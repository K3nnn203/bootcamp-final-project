"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import getConfig from "@/src/firebase/config";
import { useParams } from "next/navigation";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import Post from "@/src/components/custom/Post";

export default function PostView({ filter }) {
  
  const { postId } = useParams();
  const { db } = getConfig();
  const { user } = useAuthGuard();

  const [allPost, setAllPost] = useState([]);

  useEffect(() => {
    let q;
    if (!user) return;
    switch (filter) {
      case "my-posts":
        q = query(
          collection(db, "posts"),
          where("userId", "==", user?.userId),
          where("replyToPostId", "==", ""),
          orderBy("createdAt", "desc"),
        );
        break;

      case "all-replies":
        q = query(
          collection(db, "posts"),
          where("replyToPostId", "==", postId),
          orderBy("createdAt", "desc"),
        );
        break;

      case "my-replies":
        q = query(
          collection(db, "posts"),
          where("userId", "==", user?.userId),
          where("replyToPostId", "!=", ""),
          orderBy("createdAt", "desc"),
        );
        break;

      case "liked-posts":
        // Different query
        break;

      default:
        q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        break;
    }
    const unsub = onSnapshot(q, (snapshot) => {
      const posts = [];
      snapshot.forEach((post) => {
        posts.push({ postId: post.id, ...post.data() });
      });
      setAllPost(posts);
    });
    return () => unsub();
  }, [db, postId, user]);

  return (
    <>
      <div className="flex flex-col pt-5 pb-5 gap-10">
        {allPost.map((post) => {
          return (
            <div key={post.postId}>
                <Post post={post} />
            </div>
          );
        })}
      </div>
    </>
  );
}
