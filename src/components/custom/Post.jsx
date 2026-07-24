"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/src/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import getConfig from "@/src/firebase/config";
import { useParams, useRouter } from "next/navigation";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";

export default function Post({ filter }) {
  const router = useRouter();
  const { postId } = useParams();
  const { db } = getConfig();
  const { user } = useAuthGuard();

  const [allPost, setAllPost] = useState([]);

  const [likedPosts, setLikedPosts] = useState(new Set());

  const calculatePostedHours = (date) => {
    if (!date) {
      return;
    }
    const now = new Date();
    const diffMs = now - date.toDate();
    const hours = diffMs / (1000 * 60 * 60);
    const minutes = diffMs / (1000 * 60);
    const trimmedDate = date.toDate().toString().slice(4, 15);
    if (minutes < 1) {
      return "Just now";
    } else if (hours < 1) {
      return `${Math.floor(minutes)}m`;
    } else if (hours < 24) {
      return `${Math.floor(hours)}h`;
    } else {
      return trimmedDate;
    }
  };

  const handleClickPost = (username, postId) => {
    router.push(`/${username}/post/${postId}`);
  };

  const handleLikePost = async (e, postId) => {
    e.stopPropagation();
    const q = query(
      collection(db, "likes"),
      where("postId", "==", postId),
      where("userId", "==", user?.userId),
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Like
      await addDoc(collection(db, "likes"), {
        postId: postId,
        userId: user?.userId,
      });

      await updateDoc(doc(db, "posts", postId), {
        likeCount: increment(1),
      });
    } else {
      // Unlike
      const likeDoc = snapshot.docs[0];

      await deleteDoc(likeDoc.ref);

      await updateDoc(doc(db, "posts", postId), {
        likeCount: increment(-1),
      });
    }
  };

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

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "likes"),
      where("userId", "==", user.userId),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const liked = new Set(snapshot.docs.map((doc) => doc.data().postId));

      setLikedPosts(liked);
    });

    return unsub;
  }, [user]);

  return (
    <>
      <div className="flex flex-col pt-5 pb-5 gap-10">
        {allPost.map((post) => {
          return (
            <Card
              className="w-full"
              key={post.postId}
              onClick={() => handleClickPost(post?.username, post?.postId)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{post?.profileName}</CardTitle>
                    <CardDescription>
                      @{post?.username} ·{" "}
                      {calculatePostedHours(post?.createdAt)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p>{post?.content}</p>
              </CardContent>
              <CardFooter className="flex gap-10">
                <div className="flex gap-2 items-center">
                  <Heart
                    onClick={(e) => handleLikePost(e, post?.postId)}
                    fill={likedPosts.has(post.postId) ? "currentColor" : "none"}
                    className={
                      likedPosts.has(post.postId)
                        ? "text-red-500"
                        : "hover:text-red-500"
                    }
                    size={18}
                    strokeWidth={1}
                  />
                  <p>{post?.likeCount}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <MessageCircle
                    className="hover:text-blue-500"
                    size={18}
                    strokeWidth={1}
                  />
                  <p>{post?.replyCount}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Bookmark
                    className="hover:text-green-500"
                    size={18}
                    strokeWidth={1}
                  />
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
}
