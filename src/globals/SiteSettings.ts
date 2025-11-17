import type { GlobalConfig } from 'payload'
import { User, UserRole } from '../collections/Users'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'Settings',
    description: 'Manage site-wide settings including contact info, social links, and analytics',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => {
      const userRole = (user as User | null)?.role
      return userRole === UserRole.MANAGER || userRole === UserRole.DEVELOPER
    },
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // Tab 1: General
        {
          label: 'General',
          description: 'Basic site information',
          fields: [
            {
              name: 'siteTitle',
              type: 'text',
              required: true,
              admin: {
                description: 'The main title of your website',
              },
            },
            {
              name: 'siteDescription',
              type: 'textarea',
              required: true,
              admin: {
                description: 'A brief description of your website for SEO',
              },
            },
          ],
        },
        // Tab 2: Contact Information
        {
          label: 'Contact',
          description: 'Organization contact information',
          fields: [
            {
              name: 'contactEmail',
              type: 'email',
              required: true,
              admin: {
                description: 'Primary contact email address',
              },
            },
            {
              name: 'contactPhone',
              type: 'text',
              admin: {
                description: 'Contact phone number',
              },
            },
            {
              name: 'contactAddress',
              type: 'textarea',
              admin: {
                description: 'Physical address or mailing address',
              },
            },
          ],
        },
        // Tab 3: Social Media
        {
          label: 'Social Media',
          description: 'Social media links',
          fields: [
            {
              name: 'socialLinks',
              type: 'array',
              admin: {
                description: 'Social media links for the organization',
              },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'Twitter/X', value: 'twitter' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'TikTok', value: 'tiktok' },
                    { label: 'Other', value: 'other' },
                  ],
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Full URL to your social media profile',
                  },
                  validate: (value: unknown) => {
                    if (!value) return true
                    if (typeof value !== 'string') return 'Invalid URL format'
                    try {
                      new URL(value)
                      return true
                    } catch {
                      return 'Please enter a valid URL (must start with http:// or https://)'
                    }
                  },
                },
                {
                  name: 'label',
                  type: 'text',
                  admin: {
                    description: 'Optional custom label (defaults to platform name)',
                  },
                },
              ],
            },
          ],
        },
        // Tab 4: Announcement Bar
        {
          label: 'Announcement',
          description: 'Top-of-page announcement bar',
          fields: [
            {
              name: 'announcementBar',
              type: 'group',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description: 'Show/hide the announcement bar',
                  },
                },
                {
                  name: 'message',
                  type: 'text',
                  admin: {
                    description: 'Announcement message text',
                    condition: (data, siblingData) => siblingData?.enabled === true,
                  },
                },
                {
                  name: 'link',
                  type: 'text',
                  admin: {
                    description: 'Optional link URL (e.g., /events or https://...)',
                    condition: (data, siblingData) => siblingData?.enabled === true,
                  },
                  validate: (value: unknown) => {
                    if (!value) return true
                    if (typeof value !== 'string') return 'Invalid link format'
                    if (value.startsWith('/') || value.startsWith('http')) {
                      return true
                    }
                    return 'Link must start with / or http'
                  },
                },
                {
                  name: 'linkText',
                  type: 'text',
                  admin: {
                    description: 'Link button text (e.g., "Learn More")',
                    condition: (data, siblingData) => siblingData?.enabled === true && siblingData?.link,
                  },
                },
                {
                  name: 'style',
                  type: 'select',
                  defaultValue: 'info',
                  options: [
                    { label: 'Info (Blue)', value: 'info' },
                    { label: 'Success (Green)', value: 'success' },
                    { label: 'Warning (Yellow)', value: 'warning' },
                    { label: 'Error (Red)', value: 'error' },
                  ],
                  admin: {
                    description: 'Visual style of the announcement bar',
                    condition: (data, siblingData) => siblingData?.enabled === true,
                  },
                },
              ],
            },
          ],
        },
        // Tab 5: Analytics
        {
          label: 'Analytics',
          description: 'Tracking and analytics',
          fields: [
            {
              name: 'googleAnalyticsId',
              type: 'text',
              admin: {
                description: 'Google Analytics tracking ID (e.g., G-XXXXXXXXXX)',
                placeholder: 'G-XXXXXXXXXX',
              },
            },
          ],
        },
      ],
    },
  ],
}
