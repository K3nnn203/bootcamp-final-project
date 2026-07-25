'use client'

import UploadPost from "@/src/components/custom/UploadPost";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import PostView from "../components/custom/PostView";

export default function Home() {
  const { loading } = useAuthGuard();

  if(loading)
    return <div>loading ...</div>

  return (
    <>
      <UploadPost />
      <PostView />
    </>
  );
}
