import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { User, UserRole } from './Users'

export const GrantsAndAwards: CollectionConfig = {
  slug: 'grants-and-awards',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'opportunityType', 'deadline', 'status'],
    group: 'Website Content',
    description: 'Manage grant and award opportunities for educators',
    listSearchableFields: ['title', 'slug', 'provider'],
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
    opportunityType: true,
    deadline: true,
    status: true,
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) {
        return {
          _status: {
            equals: 'published',
          },
          status: {
            in: ['active', 'upcoming'],
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
        description: 'Opportunity name',
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
      name: 'description',
      type: 'richText',
      editor: lexicalEditor(),
      required: true,
      admin: {
        description: 'Detailed description of the opportunity',
      },
    },
    {
      name: 'opportunityType',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Grant', value: 'grant' },
        { label: 'Award', value: 'award' },
        { label: 'Fellowship', value: 'fellowship' },
        { label: 'Scholarship', value: 'scholarship' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Type of opportunity',
      },
    },
    {
      name: 'provider',
      type: 'text',
      required: true,
      admin: {
        description: 'Organization providing this opportunity (e.g., ACTFL, NEH)',
      },
    },
    {
      name: 'providerLogo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Provider organization logo',
      },
    },
    {
      name: 'applicationUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'Link to application or more information',
      },
      validate: (value: unknown) => {
        if (!value) return 'Application URL is required'
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
      },
    },
    {
      name: 'deadline',
      type: 'date',
      required: true,
      index: true,
      admin: {
        description: 'Application deadline',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'announcementDate',
      type: 'date',
      admin: {
        description: 'When winners/recipients will be announced',
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'awardAmount',
      type: 'text',
      admin: {
        description: 'Award/grant amount (e.g., "$5,000" or "$1,000-$5,000")',
        placeholder: '$5,000',
      },
    },
    {
      name: 'eligibility',
      type: 'richText',
      editor: lexicalEditor(),
      admin: {
        description: 'Who is eligible to apply? (e.g., K-12 teachers, college professors)',
      },
    },
    {
      name: 'targetAudience',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'K-12 Teachers', value: 'k12' },
        { label: 'College Professors', value: 'college' },
        { label: 'Graduate Students', value: 'grad_students' },
        { label: 'Undergraduate Students', value: 'undergrad_students' },
        { label: 'Administrators', value: 'administrators' },
        { label: 'Researchers', value: 'researchers' },
      ],
      admin: {
        description: 'Select all applicable audiences',
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
        { label: 'Language Education (General)', value: 'general' },
      ],
      admin: {
        description: 'Which language(s) does this opportunity focus on?',
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
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Image for this opportunity',
      },
    },
    {
      name: 'curator',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Who added this opportunity?',
      },
      defaultValue: ({ user }) => user?.id,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'upcoming',
      index: true,
      options: [
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Active (Open for Applications)', value: 'active' },
        { label: 'Closed', value: 'closed' },
        { label: 'Awarded/Announced', value: 'awarded' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Current status of this opportunity',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this opportunity on the homepage',
      },
    },
    {
      name: 'viewsCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Number of times this has been viewed',
      },
    },
    {
      name: 'clicksCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Number of times application link was clicked',
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
  ],
}
