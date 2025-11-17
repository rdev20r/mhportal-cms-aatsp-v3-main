// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres' // database-adapter-import
import { s3Storage } from '@payloadcms/storage-s3' // storage-adapter-import
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { BoardMembers } from './collections/BoardMembers'
import { Categories } from './collections/Categories'
import { EducatorSpotlights } from './collections/EducatorSpotlights'
import { Events } from './collections/Events'
import { GrantsAndAwards } from './collections/GrantsAndAwards'
import { Media } from './collections/Media'
import { Memories } from './collections/Memories'
import { Newsletters } from './collections/Newsletters'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Resources } from './collections/Resources'
import { Sponsors } from './collections/Sponsors'
import { Tags } from './collections/Tags'
import { TimelineEvents } from './collections/TimelineEvents'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { HomepageSettings } from './globals/HomepageSettings/config'
import { SiteSettings } from './globals/SiteSettings'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  email: nodemailerAdapter({
    defaultFromAddress: process.env.SMTP_FROM_EMAIL || 'noreply@example.com',
    defaultFromName: 'Payload CMS',
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),
  // database-adapter-config-start
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    push: false, // Disabled - using migrations instead (Drizzle push has known issues with PostgreSQL serial primary keys)
  }),
  // database-adapter-config-end
  collections: [
    // Main Content
    Pages,
    Posts,
    Events,
    Resources,
    GrantsAndAwards,
    // Media & Gallery
    Media,
    Memories,
    // Organization
    Categories,
    Tags,
    // People & Community
    BoardMembers,
    Sponsors,
    EducatorSpotlights,
    // Documents
    Newsletters,
    TimelineEvents,
    // System
    Users,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, SiteSettings, HomepageSettings],
  plugins: [
    ...plugins,
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        },
        newsletters: {
          prefix: 'newsletters',
        },
      },
      bucket: process.env.R2_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        region: process.env.R2_REGION || 'auto',
        endpoint: process.env.R2_ENDPOINT || '',
        forcePathStyle: true,
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
