'use client'

import UploadPost from "@/src/components/custom/UploadPost";
import PostView from "@/src/components/custom/PostView";
import { useState } from "react";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <>
      <UploadPost
        onPostCreated={() => setRefreshKey(prev => prev + 1)}
      />
      <PostView refreshKey={refreshKey} />
    </>
  );
}
