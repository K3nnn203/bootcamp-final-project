'use client'

import Post from "../components/custom/Post";
import { useAuthGuard } from "../hooks/useAuthGuard";

export default function Home() {
  const { loading } = useAuthGuard();



  if(loading)
    return <div>loading ...</div>

  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <Post />
    </div>
  );
}
