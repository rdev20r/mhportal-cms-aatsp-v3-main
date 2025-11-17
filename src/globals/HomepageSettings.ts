import type { GlobalConfig } from 'payload'
import { User, UserRole } from '../collections/Users'
import { validateUrl } from '../utilities/validateUrl'

export const HomepageSettings: GlobalConfig = {
  slug: 'homepage-settings',
  admin: {
    group: 'Settings',
    description: 'Customize all aspects of your homepage including hero, quick stops, community sections, and footer',
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
        // ============================================
        // TAB 1: HERO SECTION
        // ============================================
        {
          label: 'Hero Section',
          description: 'Configure the main hero banner at the top of your homepage',
          fields: [
            {
              name: 'heroSection',
              type: 'group',
              fields: [
                {
                  name: 'accentText',
                  type: 'text',
                  admin: {
                    description: 'Small accent text displayed above the main heading (keep under 5 words)',
                    placeholder: 'Welcome to AATSP',
                  },
                },
                {
                  name: 'headline',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Main headline - aim for 8-12 words that capture your mission',
                    placeholder: 'Empowering Spanish & Portuguese Educators Across New York',
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  admin: {
                    description: 'Supporting text below the headline (2-3 sentences)',
                    placeholder: 'Brief overview of your organization and its mission...',
                  },
                },
                {
                  name: 'primaryCTA',
                  type: 'group',
                  label: 'Primary Call-to-Action Button',
                  admin: {
                    description: 'The main action button (typically more prominent visually)',
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          admin: {
                            width: '40%',
                            description: 'Button text',
                            placeholder: 'Join Now',
                          },
                        },
                        {
                          name: 'link',
                          type: 'text',
                          admin: {
                            width: '60%',
                            description: 'Internal link (starts with /) or external URL (starts with https://)',
                            placeholder: '/membership/join',
                          },
                          validate: (value) => validateUrl(value, { allowInternal: true }),
                        },
                      ],
                    },
                  ],
                },
                {
                  name: 'secondaryCTA',
                  type: 'group',
                  label: 'Secondary Call-to-Action Button',
                  admin: {
                    description: 'The secondary action button (typically less prominent)',
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          admin: {
                            width: '40%',
                            description: 'Button text',
                            placeholder: 'Learn More',
                          },
                        },
                        {
                          name: 'link',
                          type: 'text',
                          admin: {
                            width: '60%',
                            description: 'Internal link (starts with /) or external URL (starts with https://)',
                            placeholder: '/about',
                          },
                          validate: (value) => validateUrl(value, { allowInternal: true }),
                        },
                      ],
                    },
                  ],
                },
                {
                  name: 'backgroundImage',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  admin: {
                    description: 'Hero section background image (recommended: 1920x1080px, under 2MB)',
                  },
                },
              ],
            },
          ],
        },
        // ============================================
        // TAB 2: QUICK STOPS
        // ============================================
        {
          label: 'Quick Stops',
          description: 'Configure the 5-card carousel section with quick action cards',
          fields: [
            {
              name: 'quickStops',
              type: 'group',
              admin: {
                description: 'Manage the quick access cards shown in the carousel. Cards appear in order from 1 to 5.',
              },
              fields: [
                // CARD 1: Featured Sponsor
                {
                  name: 'featuredSponsor',
                  type: 'group',
                  label: 'Card 1 of 5: Featured Sponsor',
                  admin: {
                    description: 'Highlight a chapter sponsor with their logo and description',
                  },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                      label: 'Display on Homepage',
                      admin: {
                        description: 'Toggle off to temporarily hide this card without losing your settings',
                      },
                    },
                    {
                      name: 'sponsor',
                      type: 'relationship',
                      relationTo: 'sponsors',
                      admin: {
                        description: 'Select which sponsor to feature. To manage sponsors, go to Collections → Sponsors.',
                        condition: (data, siblingData) => siblingData?.enabled === true,
                      },
                    },
                  ],
                },
                // CARD 2: Upcoming Event
                {
                  name: 'upcomingEvent',
                  type: 'group',
                  label: 'Card 2 of 5: Upcoming Event',
                  admin: {
                    description: '🔄 Auto-generated: Shows the next upcoming event from the Events collection',
                  },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                      label: 'Display on Homepage',
                      admin: {
                        description: 'Toggle off to temporarily hide this card without losing your settings',
                      },
                    },
                  ],
                },
                // CARD 3: Resource
                {
                  name: 'resourceCard',
                  type: 'group',
                  label: 'Card 3 of 5: Resource',
                  admin: {
                    description: 'Display a random resource or choose a specific one to feature',
                  },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                      label: 'Display on Homepage',
                      admin: {
                        description: 'Toggle off to temporarily hide this card without losing your settings',
                      },
                    },
                    {
                      name: 'displayMode',
                      type: 'radio',
                      defaultValue: 'random',
                      options: [
                        {
                          label: 'Show Random Resource (Changes each visit)',
                          value: 'random',
                        },
                        {
                          label: 'Choose Specific Resource (Pin one resource)',
                          value: 'specific',
                        },
                      ],
                      admin: {
                        description: 'Random mode keeps content fresh automatically. Specific mode lets you pin an important resource.',
                        condition: (data, siblingData) => siblingData?.enabled === true,
                      },
                    },
                    {
                      name: 'resource',
                      type: 'relationship',
                      relationTo: 'resources',
                      admin: {
                        description: 'Select a specific resource to display. To manage resources, go to Collections → Resources.',
                        condition: (data, siblingData) =>
                          siblingData?.enabled === true && siblingData?.displayMode === 'specific',
                      },
                    },
                  ],
                },
                // CARD 4: Latest News
                {
                  name: 'latestNews',
                  type: 'group',
                  label: 'Card 4 of 5: Latest News',
                  admin: {
                    description: 'Display the latest news post or choose a specific one to feature',
                  },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                      label: 'Display on Homepage',
                      admin: {
                        description: 'Toggle off to temporarily hide this card without losing your settings',
                      },
                    },
                    {
                      name: 'displayMode',
                      type: 'radio',
                      defaultValue: 'latest',
                      options: [
                        {
                          label: 'Show Latest News Post (Auto-updates)',
                          value: 'latest',
                        },
                        {
                          label: 'Choose Specific News Post (Pin one post)',
                          value: 'specific',
                        },
                      ],
                      admin: {
                        description: 'Latest mode automatically shows your newest published post. Specific mode lets you pin an important announcement.',
                        condition: (data, siblingData) => siblingData?.enabled === true,
                      },
                    },
                    {
                      name: 'newsPost',
                      type: 'relationship',
                      relationTo: 'posts',
                      admin: {
                        description: 'Select a specific news post to display. To manage news posts, go to Collections → Posts.',
                        condition: (data, siblingData) =>
                          siblingData?.enabled === true && siblingData?.displayMode === 'specific',
                      },
                    },
                  ],
                },
                // CARD 5: Newsletter
                {
                  name: 'newsletter',
                  type: 'group',
                  label: 'Card 5 of 5: Newsletter',
                  admin: {
                    description: 'Display the latest newsletter with subscribe action',
                  },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                      label: 'Display on Homepage',
                      admin: {
                        description: 'Toggle off to temporarily hide this card without losing your settings',
                      },
                    },
                    {
                      name: 'displayMode',
                      type: 'radio',
                      defaultValue: 'latest',
                      options: [
                        {
                          label: 'Show Latest Newsletter (Auto-updates)',
                          value: 'latest',
                        },
                        {
                          label: 'Choose Specific Newsletter (Pin one issue)',
                          value: 'specific',
                        },
                      ],
                      admin: {
                        description: 'Latest mode automatically shows your newest newsletter. Specific mode lets you pin an older issue.',
                        condition: (data, siblingData) => siblingData?.enabled === true,
                      },
                    },
                    {
                      name: 'selectedNewsletter',
                      type: 'relationship',
                      relationTo: 'newsletters',
                      admin: {
                        description: 'Select a specific newsletter to display. To manage newsletters, go to Collections → Newsletters.',
                        condition: (data, siblingData) =>
                          siblingData?.enabled === true && siblingData?.displayMode === 'specific',
                      },
                    },
                    {
                      name: 'primaryAction',
                      type: 'group',
                      label: 'Call to Action Button',
                      admin: {
                        condition: (data, siblingData) => siblingData?.enabled === true,
                      },
                      fields: [
                        {
                          type: 'row',
                          fields: [
                            {
                              name: 'label',
                              type: 'text',
                              defaultValue: 'Subscribe',
                              admin: {
                                width: '40%',
                                description: 'Button text',
                                placeholder: 'Subscribe',
                              },
                            },
                            {
                              name: 'link',
                              type: 'text',
                              admin: {
                                width: '60%',
                                description: 'Link to subscription page or form',
                                placeholder: '/newsletter/subscribe',
                              },
                              validate: (value) => validateUrl(value, { allowInternal: true }),
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        // ============================================
        // TAB 3: COMMUNITY IN ACTION
        // ============================================
        {
          label: 'Community in Action',
          description: 'Configure the "Our Community in Action" section',
          fields: [
            {
              name: 'communityInAction',
              type: 'group',
              admin: {
                description: 'This section highlights your community with 4 cards: educator spotlight, upcoming events preview, latest news preview, and chapter achievement statistics.',
              },
              fields: [
                {
                  name: 'backgroundImage',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Background image for the Community in Action section (recommended: 1920x1080px, under 2MB)',
                  },
                },
                // CARD 1: Educator Spotlight
                {
                  name: 'educatorSpotlight',
                  type: 'group',
                  label: 'Card 1 of 4: Educator Spotlight',
                  admin: {
                    description: 'Feature a spotlight on an educator from your chapter',
                  },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                      label: 'Display on Homepage',
                      admin: {
                        description: 'Toggle off to temporarily hide this card without losing your settings',
                      },
                    },
                    {
                      name: 'spotlight',
                      type: 'relationship',
                      relationTo: 'educator-spotlights',
                      admin: {
                        description: 'Select which educator spotlight to feature. To manage spotlights, go to Collections → Educator Spotlights.',
                        condition: (data, siblingData) => siblingData?.enabled === true,
                      },
                    },
                  ],
                },
                // CARD 2: Upcoming Events Preview
                {
                  name: 'upcomingEventsPreview',
                  type: 'group',
                  label: 'Card 2 of 4: Upcoming Events Preview',
                  admin: {
                    description: '🔄 Auto-generated: Displays the next 3 upcoming events from the Events collection',
                  },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                      label: 'Display on Homepage',
                      admin: {
                        description: 'Toggle off to temporarily hide this card without losing your settings',
                      },
                    },
                  ],
                },
                // CARD 3: Latest News Preview
                {
                  name: 'latestNewsPreview',
                  type: 'group',
                  label: 'Card 3 of 4: Latest News Preview',
                  admin: {
                    description: '🔄 Auto-generated: Displays the 3 most recent published posts from the Posts collection',
                  },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                      label: 'Display on Homepage',
                      admin: {
                        description: 'Toggle off to temporarily hide this card without losing your settings',
                      },
                    },
                  ],
                },
                // CARD 4: Chapter Achievements
                {
                  name: 'chapterAchievements',
                  type: 'array',
                  label: 'Card 4 of 4: Chapter Achievements',
                  minRows: 2,
                  maxRows: 6,
                  admin: {
                    description: 'Add 2-6 achievement statistics to highlight chapter accomplishments (e.g., number of members, events hosted, years of service)',
                    components: {
                      RowLabel: ({ data, index }: any) => {
                        return data?.topText || data?.bottomText
                          ? `${data.topText || '(number)'} – ${data.bottomText || '(label)'}`
                          : `Achievement ${(index ?? 0) + 1}`
                      },
                    },
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'topText',
                          type: 'text',
                          required: true,
                          admin: {
                            width: '30%',
                            description: 'The number or statistic',
                            placeholder: '500+',
                          },
                        },
                        {
                          name: 'bottomText',
                          type: 'text',
                          required: true,
                          admin: {
                            width: '70%',
                            description: 'The label describing the statistic',
                            placeholder: 'Active Members',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        // ============================================
        // TAB 4: CHAPTER STORY
        // ============================================
        {
          label: 'Chapter Story',
          description: 'Configure the "Our Chapter Story" section',
          fields: [
            {
              name: 'chapterStory',
              type: 'group',
              admin: {
                description: 'Share your chapter\'s history and partnerships with 2 cards: a combined photos & timeline card, and a partners showcase featuring sponsors.',
              },
              fields: [
                {
                  name: 'backgroundImage',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Background image for the Chapter Story section (recommended: 1920x1080px, under 2MB)',
                  },
                },
                // CARD 1: Photos & Timeline
                {
                  name: 'photosTimeline',
                  type: 'group',
                  label: 'Card 1 of 2: Photos & Timeline',
                  admin: {
                    description: '🔄 Auto-generated: Links to your photo gallery (Memories) and timeline content (Timeline Events)',
                  },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                      label: 'Display on Homepage',
                      admin: {
                        description: 'Toggle off to temporarily hide this card without losing your settings',
                      },
                    },
                  ],
                },
                // CARD 2: Our Partners
                {
                  name: 'partners',
                  type: 'group',
                  label: 'Card 2 of 2: Our Partners',
                  admin: {
                    description: 'Showcase your featured sponsor and partner organizations',
                  },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                      label: 'Display on Homepage',
                      admin: {
                        description: 'Toggle off to temporarily hide this card without losing your settings',
                      },
                    },
                    {
                      name: 'featuredSponsor',
                      type: 'relationship',
                      relationTo: 'sponsors',
                      admin: {
                        description: 'Choose the main featured sponsor for this section (displays prominently with description). To manage sponsors, go to Collections → Sponsors.',
                        condition: (data, siblingData) => siblingData?.enabled === true,
                      },
                    },
                    {
                      name: 'partnerLogos',
                      type: 'relationship',
                      relationTo: 'sponsors',
                      hasMany: true,
                      maxRows: 5,
                      admin: {
                        description: 'Select up to 5 partners to display in the grid below the featured sponsor (logos only)',
                        condition: (data, siblingData) => siblingData?.enabled === true,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        // ============================================
        // TAB 5: FOOTER
        // ============================================
        {
          label: 'Footer',
          description: 'Configure the homepage footer section',
          fields: [
            {
              name: 'footer',
              type: 'group',
              admin: {
                description: 'Configure your site footer with logo, description, social media links, contact info, copyright text, and legal links.',
              },
              fields: [
                // Branding
                {
                  name: 'footerLogo',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Logo image displayed in the footer (recommended: PNG with transparent background, max height 80px)',
                  },
                },
                {
                  name: 'footerDescription',
                  type: 'textarea',
                  admin: {
                    description: 'Brief description or tagline displayed in the footer (1-2 sentences)',
                    placeholder: 'Empowering Spanish and Portuguese educators across the New York metropolitan area since 1967.',
                  },
                },
                // Social Media Links
                {
                  name: 'socialMediaLinks',
                  type: 'array',
                  label: 'Social Media Links',
                  admin: {
                    description: 'Add social media links for the footer',
                    components: {
                      RowLabel: ({ data, index }: any) => {
                        return data?.platform && data?.url
                          ? `${data.platform.charAt(0).toUpperCase() + data.platform.slice(1)} – ${data.url}`
                          : `Social Link ${(index ?? 0) + 1}`
                      },
                    },
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'platform',
                          type: 'select',
                          required: true,
                          admin: {
                            width: '30%',
                          },
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
                            width: '70%',
                            description: 'Full URL to your social media profile',
                            placeholder: 'https://facebook.com/yourpage',
                          },
                          validate: (value: unknown) => {
                            if (!value) return 'URL is required'
                            if (typeof value !== 'string') return 'Invalid URL format'
                            try {
                              new URL(value)
                              return true
                            } catch {
                              return 'Please enter a valid URL (must start with http:// or https://)'
                            }
                          },
                        },
                      ],
                    },
                    {
                      name: 'label',
                      type: 'text',
                      admin: {
                        description: 'Optional custom label (defaults to platform name if left empty)',
                        placeholder: 'Follow us on Facebook',
                      },
                    },
                  ],
                },
                // Contact Information
                {
                  name: 'contactInfo',
                  type: 'group',
                  label: 'Contact Information',
                  admin: {
                    description: 'Contact details displayed in the footer',
                  },
                  fields: [
                    {
                      name: 'location',
                      type: 'textarea',
                      admin: {
                        description: 'Physical location or address (optional)',
                        placeholder: 'New York, NY',
                      },
                    },
                    {
                      name: 'showContactForm',
                      type: 'checkbox',
                      defaultValue: true,
                      label: 'Show Contact Form Button',
                      admin: {
                        description: 'Toggle to show/hide the contact form button in the footer',
                      },
                    },
                    {
                      name: 'contactFormLink',
                      type: 'text',
                      admin: {
                        description: 'Link to open contact form (internal page, modal, or external URL)',
                        placeholder: '/contact',
                        condition: (data, siblingData) => siblingData?.showContactForm === true,
                      },
                      validate: (value) => validateUrl(value, { allowInternal: true, allowModal: true }),
                    },
                  ],
                },
                // Copyright Text
                {
                  name: 'copyrightText',
                  type: 'text',
                  admin: {
                    description: 'Copyright text displayed in the footer',
                    placeholder: '© 2025 AATSP Metropolitan NY Chapter. All rights reserved.',
                  },
                },
                // Legal Links
                {
                  name: 'legalLinks',
                  type: 'array',
                  label: 'Legal Links',
                  admin: {
                    description: 'Add legal and policy links (Privacy Policy, Terms of Service, etc.)',
                    components: {
                      RowLabel: ({ data, index }: any) => {
                        return data?.label && data?.link
                          ? `${data.label} → ${data.link}`
                          : `Legal Link ${(index ?? 0) + 1}`
                      },
                    },
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          required: true,
                          admin: {
                            width: '40%',
                            description: 'Link text',
                            placeholder: 'Privacy Policy',
                          },
                        },
                        {
                          name: 'link',
                          type: 'text',
                          required: true,
                          admin: {
                            width: '60%',
                            description: 'Link URL',
                            placeholder: '/privacy',
                          },
                          validate: (value) => validateUrl(value, { allowInternal: true }),
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
