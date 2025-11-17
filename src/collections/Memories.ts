import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { User, UserRole } from './Users'

export const Memories: CollectionConfig = {
  slug: 'memories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'location', 'publicationStatus'],
    group: 'Everyday Tasks',
    description: 'Share photo albums and memories from past events',
    listSearchableFields: ['title', 'slug', 'location'],
  },
  defaultPopulate: {
    title: true,
    slug: true,
    date: true,
    location: true,
    publicationStatus: true,
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
        description: 'Event/album name (e.g., "Spring Conference 2024")',
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
      admin: {
        description: 'Describe what happened at this event',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      index: true,
      admin: {
        description: 'When the event occurred',
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'location',
      type: 'text',
      admin: {
        description: 'Where the event took place (e.g., "New York City, NY")',
      },
    },
    {
      name: 'year',
      type: 'number',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Automatically extracted from date',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (data?.date) {
              const date = new Date(data.date)
              return date.getFullYear()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'coverPhoto',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Album cover image - this will represent the album',
      },
    },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      admin: {
        description: 'Gallery photos - upload multiple images from the event',
      },
    },
    {
      name: 'photographerCredit',
      type: 'text',
      admin: {
        description: 'Photographer name for attribution (optional)',
      },
    },
    {
      name: 'publicationStatus',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Published',
          value: 'published',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
