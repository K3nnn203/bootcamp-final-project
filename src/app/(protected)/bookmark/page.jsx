'use client'

import PostView from '@/src/components/custom/PostView'
import { Spinner } from '@/src/components/ui/spinner';
import { useAuth } from '@/src/hooks/useAuth'
import React from 'react'

export default function Bookmark() {
  const { user, loading } = useAuth();

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
