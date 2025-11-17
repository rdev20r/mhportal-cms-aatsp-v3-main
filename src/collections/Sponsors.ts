import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { User, UserRole } from './Users'

export const Sponsors: CollectionConfig = {
  slug: 'sponsors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'tier', 'isActive', 'sponsorshipStart', 'displayOrder'],
    group: 'People & Community',
    description: 'Recognize organizations and individuals supporting your mission',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) {
        return {
          isActive: {
            equals: true,
          },
        }
      }
      return true
    },
    create: ({ req: { user } }) => {
      const userRole = (user as User | null)?.role
      return userRole === UserRole.DEVELOPER || userRole === UserRole.MANAGER
    },
    update: ({ req: { user } }) => {
      const userRole = (user as User | null)?.role
      return userRole === UserRole.DEVELOPER || userRole === UserRole.MANAGER
    },
    delete: ({ req: { user } }) => {
      const userRole = (user as User | null)?.role
      return userRole === UserRole.DEVELOPER
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Sponsor organization name',
      },
    },
    {
      name: 'tier',
      type: 'select',
      required: true,
      options: [
        { label: 'Featured', value: 'featured' },
        { label: 'Gold', value: 'gold' },
        { label: 'Silver', value: 'silver' },
        { label: 'Bronze', value: 'bronze' },
        { label: 'Partner', value: 'partner' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Sponsorship tier level',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Sponsor logo image',
      },
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor(),
      admin: {
        description: 'Information about the sponsor organization',
      },
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        description: 'Sponsor website URL',
      },
    },
    {
      name: 'contactName',
      type: 'text',
      admin: {
        description: 'Primary contact person name',
      },
      access: {
        read: ({ req: { user } }) => !!user,
      },
    },
    {
      name: 'contactEmail',
      type: 'email',
      admin: {
        description: 'Primary contact email address',
      },
      access: {
        read: ({ req: { user } }) => !!user,
      },
    },
    {
      name: 'contributionAmount',
      type: 'number',
      admin: {
        description: 'Monetary contribution amount (if applicable)',
      },
      access: {
        read: ({ req: { user } }) => !!user,
      },
    },
    {
      name: 'contributionType',
      type: 'select',
      options: [
        { label: 'Monetary', value: 'monetary' },
        { label: 'In-Kind', value: 'in_kind' },
        { label: 'Services', value: 'services' },
        { label: 'Mixed', value: 'mixed' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Type of contribution provided',
      },
      access: {
        read: ({ req: { user } }) => !!user,
      },
    },
    {
      name: 'sponsorshipStart',
      type: 'date',
      admin: {
        description: 'Start date of sponsorship',
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'sponsorshipEnd',
      type: 'date',
      admin: {
        description: 'End date of sponsorship (if applicable)',
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Whether this sponsor is currently active',
      },
    },
    {
      name: 'displayOnHomepage',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this sponsor on the homepage',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Sort order (lower numbers appear first)',
      },
    },
  ],
}
