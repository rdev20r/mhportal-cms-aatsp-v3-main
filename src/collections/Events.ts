import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { User, UserRole } from './Users'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startDate', 'eventType', 'eventStatus'],
    group: 'Everyday Tasks',
    description: 'Manage upcoming conferences, workshops, and community gatherings',
    listSearchableFields: ['title', 'slug', 'location'],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 2000,
      },
    },
    maxPerDoc: 30,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    startDate: true,
    eventType: true,
    eventStatus: true,
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) {
        return {
          eventStatus: {
            in: ['upcoming', 'ongoing', 'completed'],
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
        description: 'Event name (e.g., "2025 Spring Congreso Educativo")',
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
        description: 'Describe what attendees can expect',
      },
    },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: [
        { label: 'Conference', value: 'conference' },
        { label: 'Workshop', value: 'workshop' },
        { label: 'Webinar', value: 'webinar' },
        { label: 'Networking', value: 'networking' },
        { label: 'Cultural Event', value: 'cultural_event' },
        { label: 'Professional Development', value: 'professional_development' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      index: true,
      admin: {
        description: 'Event start date and time',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        description: 'Event end date and time (optional)',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'locationType',
      type: 'select',
      required: true,
      defaultValue: 'in-person',
      options: [
        { label: 'In-Person', value: 'in-person' },
        { label: 'Virtual', value: 'virtual' },
        { label: 'Hybrid', value: 'hybrid' },
      ],
      admin: {
        description: 'How will attendees participate?',
      },
    },
    {
      name: 'venueName',
      type: 'text',
      admin: {
        description: 'Venue name (e.g., Columbia University)',
        condition: (data) => data.locationType === 'in-person' || data.locationType === 'hybrid',
      },
    },
    {
      name: 'address',
      type: 'text',
      admin: {
        description: 'Physical address',
        condition: (data) => data.locationType === 'in-person' || data.locationType === 'hybrid',
      },
    },
    {
      name: 'location',
      type: 'text',
      admin: {
        description: 'General location description (e.g., "New York City, NY")',
      },
    },
    {
      name: 'registrationLink',
      type: 'text',
      admin: {
        description: 'External registration URL (e.g., Eventbrite link)',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Event flyer or promotional image',
      },
    },
    {
      name: 'galleryImages',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Additional event photos (add after event happens)',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this event on homepage',
      },
    },
    {
      name: 'eventStatus',
      type: 'select',
      required: true,
      defaultValue: 'upcoming',
      index: true,
      options: [
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
