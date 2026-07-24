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
  updateDoc,
  where,
} from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Separator } from "@/src/components/ui/separator";
import UploadPost from "@/src/components/custom/UploadPost";
import Post from "@/src/components/custom/Post";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";

export default function PostDetails() {
  const { postId } = useParams();
  const { db } = getConfig();
  const { user } = useAuthGuard();

  const [liked, setLiked] = useState(false);

  const router = useRouter();

  const [post, setPost] = useState({});

  const handleLikePost = async (e) => {
    e.stopPropagation();
    const q = query(
      collection(db, "likes"),
      where("postId", "==", postId),
      where("userId", "==", user.userId),
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Like
      await addDoc(collection(db, "likes"), {
        postId: postId,
        userId: user.userId,
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
    const getPost = async () => {
      const docRef = doc(db, "posts", postId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPost({ ...docSnap.data() });
      }
    };
    getPost();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "likes"),
      where("userId", "==", user.userId),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const liked = snapshot.docs.map((doc) => doc.data().postId);

      setLiked(liked.includes(postId));
    });

    return unsub;
  }, [user]);

  return (
    <>
      <div className="flex gap-5 items-center">
        <ArrowLeft onClick={() => router.push("/")} size={28} strokeWidth={1} />
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
      <p>Posted on {post?.createdAt?.toDate().toString().slice(4, 15)}</p>
      <Separator className="mt-5 mb-5" />
      <UploadPost />
      <Post filter='all-replies' />
    </>
  );
}
