"use client";

import React, { useEffect, useState } from "react";
import { Field, FieldSeparator } from "@/src/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/src/components/ui/input-group";
import { CardTitle, CardDescription } from "@/src/components/ui/card";
import Image from "next/image";
import { Button } from "@/src/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import InputImage from "./InputImage";
import { X } from "lucide-react";
import { Spinner } from "../ui/spinner";
import getConfig from "@/src/firebase/config";
import { addDoc, collection, doc, getDoc, getDocs, increment, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { toast } from "sonner";
import { useParams } from "next/navigation";

export default function UploadPost() {
  const { postId } = useParams();
  const { db } = getConfig();
  const { user } = useAuthGuard();

  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);

  const createPostNotifications = async (postId, content) => {
    const followerSnap = await getDocs(
      query(
        collection(db, 'follows'),
        where("followingId", "==", user.userId)
      )
    )

    const promise = followerSnap.docs.map((doc) => 
      addDoc(collection(db, 'notifications'), {
        recipientId: doc.data().followerId,
        actorId: user.userId,
        actorUsername: user.username,
        actorProfileName: user.profileName,
        actorProfilePic: user.profilePic,
        postId: postId,
        content: content,
        type: "new-post",
        createdAt: serverTimestamp(),
        isRead: false,
      })
    )

    await Promise.all(promise)
  }

  const createReplyNotifications = async (postId, content) => {
    const postRef = doc(db, "posts", postId)
    const postSnap = await getDoc(postRef)
    if(postSnap.exists()){
      const recipientId = postSnap.data().userId
      if(recipientId === user.userId) return
      await addDoc(collection(db, 'notifications'), {
        recipientId: recipientId,
        actorId: user.userId,
        actorUsername: user.username,
        actorProfileName: user.profileName,
        actorProfilePic: user.profilePic,
        postId: postId,
        content: content,
        type: "reply",
        createdAt: serverTimestamp(),
        isRead: false,
      })
    }
  }

  const handleUploadPost = async () => {
    setLoading(true);
    try {
      let imageUrl = null;

      if (imageFile) {
        // Give each image a unique filename
        const imageRef = ref(
          storage,
          `posts/${user.userId}/${Date.now()}-${imageFile.name}`,
        );

        // Upload image
        await uploadBytes(imageRef, imageFile);

        // Get the public URL
        imageUrl = await getDownloadURL(imageRef);
      }

      const postCollections = collection(db, "posts");
      const newPost = await addDoc(postCollections, {
        userId: user.userId,
        username: user.username, // duplicated
        profileName: user.profileName,
        userProfilePicture: user.profilePic, // duplicated
        content: content,
        imageUrl,
        replyToPostId: postId || '',
        likeCount: 0,
        replyCount: 0,
        createdAt: serverTimestamp(),
      });
      if(postId) {
        const updateRef = doc(db, 'posts', postId)
        await updateDoc(updateRef, {
          replyCount: increment(1)
        })
        createReplyNotifications(postId, content)
      } else {
        createPostNotifications(newPost.id, content);
      }

      toast.success(postId ? "Your comment has been added" : "Upload Success!");
      setContent("");
      setImageFile(null);
      setImagePreview("");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  return (
    <Field>
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{user?.profileName}</CardTitle>
          <CardDescription>@{user?.username}</CardDescription>
        </div>
      </div>
      <InputGroup>
        <InputGroupTextarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          maxLength={300}
          id="post-content"
          placeholder={postId ? "Write your reply" : "What's cooking?"}
        />
        <InputGroupAddon align="block-end">
          <InputGroupText>{content.length}/300</InputGroupText>
        </InputGroupAddon>
        {imagePreview && (
          <div className="relative w-full">
            <Button
              onClick={handleRemoveImage}
              className="absolute right-8 top-12"
            >
              <X size={16} strokeWidth={1} />
            </Button>
            <Image
              src={imagePreview}
              alt="Preview"
              width={800}
              height={800}
              className="mt-3 rounded-md h-auto w-full p-5"
            />
          </div>
        )}
      </InputGroup>
      <div className="flex items-center">
        <InputImage onSelect={setImageFile} />
        <Button
          onClick={handleUploadPost}
          variant="default"
          className="ml-auto"
          disabled={!content && !imageFile}
        >
          {loading && <Spinner />}
          {postId ? 'Reply' : 'Post'}
        </Button>
      </div>
      <FieldSeparator />
    </Field>
  );
}
