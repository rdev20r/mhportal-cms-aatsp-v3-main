'use client'
import React from 'react'

export const SocialMediaRowLabel = ({ data, index }: any) => {
  return data?.platform && data?.url
    ? `${data.platform.charAt(0).toUpperCase() + data.platform.slice(1)} – ${data.url}`
    : `Social Link ${(index ?? 0) + 1}`
}
