'use client'
import React from 'react'

export const LegalLinkRowLabel = ({ data, index }: any) => {
  return data?.label && data?.link
    ? `${data.label} → ${data.link}`
    : `Legal Link ${(index ?? 0) + 1}`
}
