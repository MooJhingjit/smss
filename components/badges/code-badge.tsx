import { Lock } from 'lucide-react'
import React from 'react'

export default function CodeBadge({ code, isLocked }: { code: string, isLocked?: boolean }) {
  return (
    <div className="flex items-center space-x-2">
      {
        isLocked && (
          <span className="inline-flex items-center rounded-md  text-yellow-800 text-xs">
            <Lock size={16} />
          </span>
        )
      }
      <p>{code}</p></div>
  )
}
