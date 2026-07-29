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
import { ArrowLeft, Bookmark, Heart, MessageCircle } from "lucide-react";
import getConfig from "@/src/firebase/config";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Separator } from "@/src/components/ui/separator";
import UploadPost from "@/src/components/custom/UploadPost";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import PostView from "@/src/components/custom/PostView";

export default function PostDetails() {
  const { postId } = useParams();
  const { db } = getConfig();
  const { user } = useAuthGuard();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(0);

  const router = useRouter();

  const [post, setPost] = useState({});

  const getPostDetails = async () => {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      setPost(postSnap.data());
    }
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
      await updateDoc(doc(db, "posts", postId), {
        likeCount: increment(1),
      });
      await setDoc(likeRef, {
        //Like Information
        postId: postId,
        userId: user.userId,
        createdAt: serverTimestamp(),
        //Post Information
        // userId: post.userId,
        // username: post.username,
        // profileName: post.profileName,
        // userProfilePicture: post.userProfilePicture,
        // content: post?.content,
        // imageUrl: post?.imageUrl,
        // replyToPostId: post?.replyToPostId,
        // createdAt: post?.createdAt
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
        createdAt: serverTimestamp(),
      });
    }
  };

  useEffect(() => {
    getPostDetails();
  }, []);

  useEffect(() => {
    if (!user) return;

    const likeRef = doc(db, "likes", `${postId}_${user.userId}`);

    const unsub = onSnapshot(likeRef, (doc) => {
      const liked = doc.data();
      if (liked) {
        setLiked(true);
      } else {
        setLiked(false);
      }
    });

    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const postRef = doc(db, "posts", postId);

    const unsub = onSnapshot(postRef, (doc) => {
      const likeCountResult = doc.data().likeCount;
      setLikeCount(likeCountResult);
    });

    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const bookmarkRef = doc(db, "bookmarks", `${postId}_${user.userId}`);

    const unsub = onSnapshot(bookmarkRef, (doc) => {
      const bookmarked = doc.data();
      if (bookmarked) {
        setBookmarked(true);
      } else {
        setBookmarked(false);
      }
    });

    return unsub;
  }, [user]);

  return (
    <>
      <div className="flex gap-5 items-center">
        <ArrowLeft onClick={() => router.back()} size={28} strokeWidth={1} />
        <h1 className="text-[20px]">Post</h1>
      </div>
      <Card className="w-full mt-5 mb-5" key={postId}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{post?.profileName}</CardTitle>
              <CardDescription>@{post?.username}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p>{post?.content}</p>
        </CardContent>
        <CardFooter className="flex gap-10">
          <div className="flex gap-2 items-center">
            <Heart
              onClick={(e) => handleLikePost(e)}
              fill={liked === true ? "currentColor" : "none"}
              className={liked === true ? "text-red-500" : "hover:text-red-500"}
              size={18}
              strokeWidth={1}
            />
            <p>{likeCount}</p>
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
              onClick={(e) => handleBookmarkPost(e, postId)}
              fill={bookmarked === true ? "currentColor" : "none"}
              className={bookmarked === true ? "text-blue-500" : "hover:text-blue-500"}
              size={18}
              strokeWidth={1}
            />
          </div>
        </CardFooter>
      </Card>
      <p>Posted on {post?.createdAt?.toDate().toString().slice(4, 15)}</p>
      <Separator className="mt-5 mb-5" />
      <UploadPost />
      <PostView filter="all-replies" />
    </>
  );
}
