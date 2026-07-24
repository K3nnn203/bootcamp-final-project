'use client'

import Post from "@/src/components/custom/Post";
import UploadPost from "@/src/components/custom/UploadPost";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";

export default function Home() {
  const { loading } = useAuthGuard();



  if(loading)
    return <div>loading ...</div>

  return (
    <>
      <UploadPost />
      <Post />

    </>
  );
}
