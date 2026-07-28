import PostView from '@/src/components/custom/PostView'
import React from 'react'

export default function Bookmark() {
  return (
    <div>
      <PostView filter='bookmarks' />
    </div>
  )
}
