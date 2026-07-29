'use client'

import PostView from '@/src/components/custom/PostView'
import { Spinner } from '@/src/components/ui/spinner';
import { useAuthGuard } from '@/src/hooks/useAuthGuard'
import React from 'react'

export default function Bookmark() {
  const { user, loading } = useAuthGuard();

  if (loading)
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );

  return (
    <div>
      <PostView filter='bookmarks' userInProfileId={user?.userId} />
    </div>
  )
}
