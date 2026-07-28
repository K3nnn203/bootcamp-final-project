"use client";

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
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import getConfig from "@/src/firebase/config";

export default function Post(props) {
  const { post } = props;

  const router = useRouter();
  const { db } = getConfig();
  const { user } = useAuthGuard();

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

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
    const likeRef = doc(db, "likes", `${postId}_${user.userId}`);

    const likeSnap = await getDoc(likeRef);

    if (likeSnap.exists()) {
      await deleteDoc(likeRef);
      await updateDoc(doc(db, "posts", postId), {
        likeCount: increment(-1),
      });
    } else {
      await setDoc(likeRef, {
        postId,
        userId: user.userId,
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, "posts", postId), {
        likeCount: increment(1),
      });
    }
  };

  const handleBookmarkPost = async (e, postId) => {
    e.stopPropagation();
    const bookmarkRef = doc(db, "bookmarks", `${postId}_${user.userId}`);

    const bookmarkSnap = await getDoc(bookmarkRef);

    if (bookmarkSnap.exists()) {
      await deleteDoc(bookmarkRef);
    } else {
      await setDoc(bookmarkRef, {
        postId,
        userId: user.userId,
        createdAt: serverTimestamp()
      });
    }
  };

  useEffect(() => {
    if (!user) return;

    const likeRef = doc(db, "likes", `${post?.postId}_${user.userId}`);

    const unsub = onSnapshot(likeRef, (doc) => {
      const liked = doc.data()
      if(liked) {
        setLiked(true);
      } else {
        setLiked(false)
      }
    });

    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const bookmarkRef = doc(db, "bookmarks", `${post?.postId}_${user.userId}`);

    const unsub = onSnapshot(bookmarkRef, (doc) => {
      const bookmarked = doc.data()
      if(bookmarked) {
        setBookmarked(true);
      } else {
        setBookmarked(false)
      }
    });

    return unsub;
  }, [user]);

  return (
    <Card
      className="w-full"
      key={post?.postId}
      onClick={() => handleClickPost(post?.username, post?.postId)}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{post?.profileName}</CardTitle>
            <CardDescription>
              @{post?.username} · {calculatePostedHours(post?.createdAt)}
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
            fill={liked === true ? "currentColor" : "none"}
            className={liked === true ? "text-red-500" : "hover:text-red-500"}
            size={18}
            strokeWidth={1}
          />
          <p>{post?.likeCount}</p>
        </div>
        <div className="flex gap-2 items-center">
          <MessageCircle
            className="hover:text-green-500"
            size={18}
            strokeWidth={1}
          />
          <p>{post?.replyCount}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Bookmark
            onClick={(e) => handleBookmarkPost(e, post?.postId)}
            fill={bookmarked === true ? "currentColor" : "none"}
            className={bookmarked === true ? "text-blue-500" : "hover:text-blue-500"}
            size={18}
            strokeWidth={1}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
