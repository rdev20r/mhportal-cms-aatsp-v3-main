import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { User, UserRole } from './Users'

export const TimelineEvents: CollectionConfig = {
  slug: 'timeline-events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', 'isMilestone'],
    group: 'Everyday Tasks',
    description: 'Chronicle the organization\'s history with milestone events',
    listSearchableFields: ['title', 'year'],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 2000,
      },
    },
    maxPerDoc: 20,
  },
  defaultPopulate: {
    title: true,
    year: true,
    isMilestone: true,
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) {
        return {
          _status: {
            equals: 'published',
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
      name: 'year',
      type: 'number',
      required: true,
      index: true,
      admin: {
        description: 'The primary year this event occurred',
      },
    },
    {
      name: 'date',
      type: 'date',
      admin: {
        description: 'Specific date if known (optional)',
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Event headline (e.g., "First Annual Conference")',
      },
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor(),
      required: true,
      admin: {
        description: 'Tell the story of what happened',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Primary image for this timeline event',
      },
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Additional images for this event (optional)',
      },
    },
    {
      name: 'isMilestone',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Check this to highlight as a major milestone',
      },
    },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
      admin: {
        description: 'Image display position on timeline',
      },
    },
    {
      name: 'imageSize',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
      admin: {
        description: 'Image size on timeline',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Order within the same year (lower numbers appear first)',
      },
    },
  ],
}
