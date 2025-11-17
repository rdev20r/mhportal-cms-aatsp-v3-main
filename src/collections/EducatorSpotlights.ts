import type { CollectionConfig } from 'payload'
import { User, UserRole } from './Users'

export const EducatorSpotlights: CollectionConfig = {
  slug: 'educator-spotlights',
  admin: {
    useAsTitle: 'teacherName',
    defaultColumns: ['teacherName', 'schoolName', 'featuredStatus', 'featuredFrom'],
    group: 'People & Community',
    description: 'Highlight exceptional educators making a difference',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) {
        return {
          featuredStatus: {
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
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // If featuredStatus is being set to 'active', archive all other active spotlights
        if (data?.featuredStatus === 'active') {
          // Set featuredFrom date when activating
          if (!data.featuredFrom) {
            data.featuredFrom = new Date().toISOString()
          }

          // Archive all other active spotlights
          const payload = req.payload
          const activeSpotlights = await payload.find({
            collection: 'educator-spotlights',
            where: {
              featuredStatus: {
                equals: 'active',
              },
            },
          })

          // Update all active spotlights to archived
          for (const spotlight of activeSpotlights.docs) {
            if (spotlight.id !== data.id) {
              await payload.update({
                collection: 'educator-spotlights',
                id: spotlight.id,
                data: {
                  featuredStatus: 'archived',
                  featuredUntil: new Date().toISOString(),
                },
              })
            }
          }
        }

        // Set featuredUntil date when archiving
        if (data?.featuredStatus === 'archived' && !data.featuredUntil) {
          data.featuredUntil = new Date().toISOString()
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'teacherName',
      type: 'text',
      required: true,
      admin: {
        description: 'Teacher\'s full name',
      },
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      admin: {
        description: 'Professional title/role',
      },
    },
    {
      name: 'gradesTaught',
      type: 'text',
      required: true,
      admin: {
        description: 'Grade levels taught (e.g., "6th-8th Grade")',
      },
    },
    {
      name: 'schoolName',
      type: 'text',
      required: true,
      admin: {
        description: 'Name of school or institution',
      },
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Inspiring quote from the teacher (1-2 sentences)',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Professional photo of the teacher',
      },
    },
    {
      name: 'badge1',
      type: 'text',
      admin: {
        description: 'First achievement badge (e.g., "15 Years Teaching")',
      },
    },
    {
      name: 'badge2',
      type: 'text',
      admin: {
        description: 'Second achievement badge',
      },
    },
    {
      name: 'badge3',
      type: 'text',
      admin: {
        description: 'Third achievement badge',
      },
    },
    {
      name: 'badge4',
      type: 'text',
      admin: {
        description: 'Fourth achievement badge',
      },
    },
    {
      name: 'memberProfile',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        description: 'Link to member profile if available',
      },
    },
    {
      name: 'featuredStatus',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
        description: 'WARNING: Only ONE spotlight can be active at a time',
      },
    },
    {
      name: 'featuredFrom',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Date when this spotlight was activated (auto-set)',
      },
    },
    {
      name: 'featuredUntil',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Date when this spotlight was archived (auto-set)',
      },
    },
  ],
}
