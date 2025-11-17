'use client'
import React from 'react'

export const ChapterAchievementRowLabel = ({ data, index }: any) => {
  return data?.topText || data?.bottomText
    ? `${data.topText || '(number)'} – ${data.bottomText || '(label)'}`
    : `Achievement ${(index ?? 0) + 1}`
}
