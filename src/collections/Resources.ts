import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { User, UserRole } from './Users'

export const Resources: CollectionConfig = {
  slug: 'resources',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'resourceType', 'curator', 'isArchived'],
    group: 'Website Content',
    description: 'Curate lesson plans, worksheets, and teaching materials',
    listSearchableFields: ['title', 'slug'],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 3000,
      },
    },
    maxPerDoc: 30,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    resourceType: true,
    isArchived: true,
    curator: {
      name: true,
      email: true,
    },
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) {
        return {
          _status: {
            equals: 'published',
          },
          isArchived: {
            equals: false,
          },
        }
      }
      return true
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => {
      const userRole = (user as User | null)?.role
      return userRole === UserRole.DEVELOPER || userRole === UserRole.MANAGER
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Resource name',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'URL-friendly version (auto-generated)',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'summary',
      type: 'richText',
      editor: lexicalEditor(),
      required: true,
      admin: {
        description: 'What it is and why it\'s useful (2-3 sentences)',
      },
    },
    {
      name: 'resourceType',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Lesson Plan', value: 'lesson_plan' },
        { label: 'Worksheet', value: 'worksheet' },
        { label: 'Assessment', value: 'assessment' },
        { label: 'Video', value: 'video' },
        { label: 'Article', value: 'article' },
        { label: 'Website', value: 'website' },
        { label: 'Professional Development', value: 'professional_development' },
        { label: 'Curriculum Guide', value: 'curriculum_guide' },
        { label: 'Interactive Activity', value: 'interactive_activity' },
      ],
      admin: {
        position: 'sidebar',
        description: 'What type of resource is this?',
      },
    },
    {
      name: 'sourceType',
      type: 'select',
      required: true,
      defaultValue: 'external_link',
      options: [
        { label: 'External Link', value: 'external_link' },
        { label: 'Hosted File', value: 'hosted_file' },
      ],
      admin: {
        description: 'Is this a link to an external website or an uploaded file?',
      },
    },
    {
      name: 'externalUrl',
      type: 'text',
      admin: {
        description: 'Link to external resource',
        condition: (data) => data.sourceType === 'external_link',
      },
      validate: (value: unknown, { data }: any) => {
        if (data?.sourceType === 'external_link') {
          if (!value) return 'External URL is required when source type is External Link'
          if (typeof value !== 'string') return 'Invalid URL format'
          if (value.startsWith('http://') || value.startsWith('https://')) {
            try {
              new URL(value)
              return true
            } catch {
              return 'Please enter a valid URL'
            }
          }
          return 'URL must start with http:// or https://'
        }
        return true
      },
    },
    {
      name: 'hostedFile',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Upload PDF, Word doc, PowerPoint, or other file',
        condition: (data) => data.sourceType === 'hosted_file',
      },
    },
    {
      name: 'sourceOrganization',
      type: 'text',
      admin: {
        description: 'Who created this resource? (e.g., ACTFL, AATSP, Teachers Pay Teachers)',
        placeholder: 'ACTFL',
      },
    },
    {
      name: 'sourceOrganizationLogo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Organization logo (optional)',
      },
    },
    {
      name: 'previewImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Thumbnail or preview image for this resource',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        position: 'sidebar',
        description: 'Primary category',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Add tags (type to search or create new)',
      },
    },
    {
      name: 'curator',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Who added this resource?',
      },
      defaultValue: ({ user }) => user?.id,
    },
    {
      name: 'gradeLevels',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Pre-K', value: 'prek' },
        { label: 'Elementary (K-5)', value: 'elementary' },
        { label: 'Middle School (6-8)', value: 'middle' },
        { label: 'High School (9-12)', value: 'high' },
        { label: 'College/University', value: 'college' },
        { label: 'Adult Learners', value: 'adult' },
      ],
      admin: {
        description: 'Select all grade levels this resource is appropriate for',
      },
    },
    {
      name: 'languageLevel',
      type: 'select',
      options: [
        { label: 'Novice Low', value: 'novice_low' },
        { label: 'Novice Mid', value: 'novice_mid' },
        { label: 'Novice High', value: 'novice_high' },
        { label: 'Intermediate Low', value: 'intermediate_low' },
        { label: 'Intermediate Mid', value: 'intermediate_mid' },
        { label: 'Intermediate High', value: 'intermediate_high' },
        { label: 'Advanced Low', value: 'advanced_low' },
        { label: 'Advanced Mid', value: 'advanced_mid' },
        { label: 'Advanced High', value: 'advanced_high' },
        { label: 'Heritage Speaker', value: 'heritage' },
        { label: 'All Levels', value: 'all' },
      ],
      admin: {
        description: 'Target language proficiency level (ACTFL scale)',
      },
    },
    {
      name: 'subjectFocus',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Spanish', value: 'spanish' },
        { label: 'Portuguese', value: 'portuguese' },
        { label: 'Both Languages', value: 'both' },
      ],
      admin: {
        description: 'Which language(s) does this resource focus on?',
      },
    },
    {
      name: 'contentLanguage',
      type: 'select',
      defaultValue: 'english',
      options: [
        { label: 'English', value: 'english' },
        { label: 'Spanish', value: 'spanish' },
        { label: 'Portuguese', value: 'portuguese' },
        { label: 'Bilingual', value: 'bilingual' },
      ],
      admin: {
        description: 'What language is the resource content written in?',
      },
    },
    {
      name: 'standardsAlignment',
      type: 'textarea',
      admin: {
        description: 'Curriculum standards this resource aligns with (e.g., ACTFL World-Readiness Standards, Common Core, state standards)',
        placeholder: 'ACTFL World-Readiness Standards: Communication, Cultures',
      },
    },
    {
      name: 'duration',
      type: 'text',
      admin: {
        description: 'Estimated time needed (e.g., "45 minutes", "2 class periods", "15 min video")',
        placeholder: '45 minutes',
        condition: (data) =>
          data?.resourceType === 'lesson_plan' ||
          data?.resourceType === 'video' ||
          data?.resourceType === 'interactive_activity',
      },
    },
    {
      name: 'fileSize',
      type: 'text',
      admin: {
        description: 'File size (e.g., "2.5 MB", "15 MB")',
        placeholder: '2.5 MB',
        condition: (data) => data?.sourceType === 'hosted_file',
        readOnly: true,
      },
    },
    {
      name: 'lastVerified',
      type: 'date',
      admin: {
        description: 'When was this external link last checked to ensure it still works?',
        date: {
          pickerAppearance: 'dayOnly',
        },
        condition: (data) => data?.sourceType === 'external_link',
      },
    },
    {
      name: 'isBrokenLink',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Mark if this external link is broken or no longer available',
        condition: (data) => data?.sourceType === 'external_link',
      },
    },
    {
      name: 'requiresLogin',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Does accessing this resource require creating an account or logging in?',
      },
    },
    {
      name: 'cost',
      type: 'select',
      defaultValue: 'free',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Freemium (Free with paid options)', value: 'freemium' },
        { label: 'Paid', value: 'paid' },
      ],
      admin: {
        description: 'Is there a cost associated with this resource?',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this resource on the homepage',
      },
    },
    {
      name: 'viewsCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Number of times this resource has been viewed',
      },
    },
    {
      name: 'clicksCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Number of times this resource link has been clicked',
      },
    },
    {
      name: 'downloadsCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Number of times hosted file has been downloaded',
        condition: (data) => data?.sourceType === 'hosted_file',
      },
    },
    {
      name: 'dateAdded',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'isArchived',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Archive this resource (hidden from public view)',
      },
    },
  ],
}
