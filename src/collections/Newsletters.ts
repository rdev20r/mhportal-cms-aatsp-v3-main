import type { CollectionConfig } from 'payload'
import { User, UserRole } from './Users'

const generateSlug = ({ value, data }: any) => {
  if (!value && data?.title) {
    return data.title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '')
  }
  return value
}

export const Newsletters: CollectionConfig = {
  slug: 'newsletters',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'issueNumber', 'publishDate', 'publicationStatus'],
    group: 'Advanced',
    description: 'Publish newsletters and periodic communications',
  },
  upload: {
    mimeTypes: ['application/pdf'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) {
        return {
          publicationStatus: {
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
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Newsletter title',
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
        beforeValidate: [generateSlug],
      },
    },
    {
      name: 'issueNumber',
      type: 'text',
      admin: {
        description: 'Volume/issue number (e.g., "Vol 12, Issue 1")',
      },
    },
    {
      name: 'publishDate',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Publication date',
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: {
        description: 'Brief description of the newsletter content',
      },
    },
    {
      name: 'publicationStatus',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
