import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

// Role constants for type safety and reuse
export const UserRole = {
  DEVELOPER: 'developer',
  MANAGER: 'manager',
  EDITOR: 'editor',
} as const

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole]

export interface User {
  id: string
  name?: string
  email: string
  role: UserRoleType
  createdAt: string
  updatedAt: string
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    listSearchableFields: ['name', 'email'],
    enableListViewSelectAPI: true,
    group: 'Advanced',
    description: 'Manage user accounts and permissions. Only Developers can create/delete users.',
    // Hide from non-developers
    hidden: ({ user }) => {
      const userRole = (user as User | null)?.role
      return userRole !== UserRole.DEVELOPER
    },
  },

  // Role-based access controls
  access: {
    // Only authenticated users can access admin
    admin: authenticated,

    // Only Developers can create new users
    create: ({ req: { user } }) => (user as User | null)?.role === UserRole.DEVELOPER,

    // Only Developers can delete users
    delete: ({ req: { user } }) => (user as User | null)?.role === UserRole.DEVELOPER,

    // Developers can update any user, others can only update themselves
    update: ({ req: { user } }) => {
      if ((user as User | null)?.role === UserRole.DEVELOPER) return true
      return { id: { equals: user?.id } }
    },

    // Developers can read all users, others can only read themselves
    read: ({ req: { user } }) => {
      if ((user as User | null)?.role === UserRole.DEVELOPER) return true
      return { id: { equals: user?.id } }
    },
  },

  fields: [
    // Name field (template style - simple, single field)
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Full name (used throughout the CMS)',
      },
    },

    // Role field with 3-tier system
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: UserRole.EDITOR,
      index: true,
      options: [
        {
          label: 'Developer',
          value: UserRole.DEVELOPER,
        },
        {
          label: 'Manager',
          value: UserRole.MANAGER,
        },
        {
          label: 'Editor',
          value: UserRole.EDITOR,
        },
      ],
      // Only Developers can change roles
      access: {
        update: ({ req: { user } }) => (user as User | null)?.role === UserRole.DEVELOPER,
      },
      admin: {
        description:
          'Developer: Full access | Manager: Can manage content & settings | Editor: Can manage content only',
        position: 'sidebar',
      },
    },
  ],

  timestamps: true,
}
