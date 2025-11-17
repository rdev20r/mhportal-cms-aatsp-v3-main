import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { User, UserRole } from './Users'

export const BoardMembers: CollectionConfig = {
  slug: 'board-members',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'school', 'memberStatus', 'displayOrder'],
    group: 'People & Community',
    description: 'Manage current and past board member profiles',
    listSearchableFields: ['name', 'school'],
  },
  defaultPopulate: {
    name: true,
    role: true,
    memberStatus: true,
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) {
        return {
          memberStatus: {
            equals: 'active',
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
        description: 'Full name of the board member',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'President', value: 'president' },
        { label: 'Vice President', value: 'vice_president' },
        { label: 'Secretary', value: 'secretary' },
        { label: 'Treasurer', value: 'treasurer' },
        { label: 'Board Member', value: 'board_member' },
        { label: 'Advisory Board', value: 'advisory_board' },
        { label: 'Emeritus', value: 'emeritus' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Role within the organization',
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Professional title (e.g., "Spanish Teacher")',
      },
    },
    {
      name: 'school',
      type: 'text',
      admin: {
        description: 'School or institution name',
      },
    },
    {
      name: 'bio',
      type: 'richText',
      editor: lexicalEditor(),
      required: true,
      admin: {
        description: 'Board member biography and background',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Professional headshot',
      },
    },
    {
      name: 'email',
      type: 'email',
      admin: {
        description: 'Contact email address',
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
    {
      name: 'yearsServed',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Number of years served on the board',
      },
    },
    {
      name: 'memberStatus',
      type: 'select',
      required: true,
      defaultValue: 'active',
      index: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Current status of board membership',
      },
    },
    {
      name: 'socialLinks',
      type: 'json',
      admin: {
        description: 'Social media links as JSON (e.g., {"linkedin": "url", "twitter": "url"})',
      },
    },
  ],
}
