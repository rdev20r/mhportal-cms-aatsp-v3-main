import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { User, UserRole } from './Users'

export const Media: CollectionConfig = {
  slug: 'media',

  // Admin UI Configuration (from AATSP v1)
  admin: {
    useAsTitle: 'filename',
    group: 'Everyday Tasks',
    description: 'Upload photos, PDFs, and other files. These can be used throughout your website.',
    listSearchableFields: ['filename', 'alt'],
    enableListViewSelectAPI: true,
  },

  // Default fields to populate in API responses (from AATSP v1)
  defaultPopulate: {
    filename: true,
    alt: true,
    url: true,
  },

  // Folder organization (from template)
  folders: true,

  // Access Control: Role-based permissions (from AATSP v1)
  access: {
    read: anyone, // Media files are public assets
    create: authenticated,
    update: ({ req: { user } }) => {
      if (!user) return false
      // Developers, Managers, and Editors can update media
      const userRole = (user as User | null)?.role
      return userRole === UserRole.DEVELOPER || userRole === UserRole.MANAGER || userRole === UserRole.EDITOR
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      // Only Developers and Managers can delete media
      const userRole = (user as User | null)?.role
      return userRole === UserRole.DEVELOPER || userRole === UserRole.MANAGER
    },
  },

  // Upload Configuration
  upload: {
    // Mime type restrictions (from AATSP v1) - security best practice
    mimeTypes: ['image/*', 'application/pdf', 'video/*'],

    // Admin thumbnail
    adminThumbnail: 'thumbnail',

    // Focal Point (from template) - Critical feature for responsive images
    focalPoint: true,

    // Optimized Image Sizes (hybrid approach)
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        // height: undefined, // Auto height maintains aspect ratio
        position: 'centre',
      },
      {
        name: 'desktop',
        width: 1440,
        position: 'centre',
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center', // For social media sharing
      },
    ],
  },

  // Fields
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true, // Accessibility compliance (from AATSP v1)
      admin: {
        description: 'Alt text for accessibility (required for images). Describe the image for screen readers.',
      },
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
      admin: {
        description: 'Optional caption for this media item. Supports formatting.',
      },
    },
  ],
}
