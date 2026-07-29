"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import getConfig from "@/src/firebase/config";
import { useParams } from "next/navigation";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import Post from "@/src/components/custom/Post";
import { Spinner } from "@/src/components/ui/spinner";

export default function PostView({ filter, userInProfileId }) {
  const { postId } = useParams();
  const { db } = getConfig();
  const { user } = useAuthGuard();

  const [allPost, setAllPost] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef(null);

  const createQuery = (lastDoc = null ) => {
    const constraints = [];
    let collectionName = 'posts';

    switch (filter) {
      case "my-posts":
          constraints.push(
            where("userId", "==", userInProfileId),
            where("replyToPostId", "==", ""),
          );
        break;

      case "all-replies":
        constraints.push(
          where("replyToPostId", "==", postId),
        );
        break;

      case "my-replies":
        constraints.push(
          where("userId", "==", userInProfileId),
          where("replyToPostId", "!=", ""),
        );
        break;

      case "liked-posts":
        constraints.push(
          where("userId", "==", userInProfileId),
        );
        collectionName = 'likes'
        break;

      case "bookmarks":
        constraints.push(
          where("userId", "==", userInProfileId),
        );
        collectionName = 'bookmarks'
        break;

      default:
        break;
      }

    constraints.push(orderBy("createdAt", "desc"));
      
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    constraints.push(limit(5));

    return query(collection(db, collectionName), ...constraints);
  };

  const loadPost = async () => {
    if (!user) return;

    const snapshot = await getDocs(createQuery());
    const newPosts = snapshot.docs.map((doc) => ({
      postId: doc.id,
      ...doc.data(),
    }));

    setAllPost(newPosts);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

    if (snapshot.empty) {
      setLastDoc(null);
      setHasMore(false);
      setInitialLoading(false);
      return;
    }
    if (snapshot.docs.length < 5) setHasMore(false);

    setInitialLoading(false);
  };

  const loadMore = async () => {
    if (loading) return;
    if (!lastDoc) return;

    setLoading(true);
    const snapshot = await getDocs(createQuery(lastDoc));

    const newPosts = snapshot.docs.map((doc) => ({
      postId: doc.id,
      ...doc.data(),
    }));

    setAllPost((prev) => [...prev, ...newPosts]);

    if (snapshot.empty) {
      setLastDoc(null);
      setHasMore(false);
      return;
    }

    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

    if (snapshot.docs.length < 5) setHasMore(false);

    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;

    loadPost();
  }, [db, postId, user]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting) {
          console.log("Enter");
          loadMore();
        }
      },
      {
        threshold: 1.0,
      },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [lastDoc, loading, hasMore]);

  console.log(lastDoc)

  if(initialLoading) return <div className="flex justify-center"><Spinner /></div>

  return (
    <>
      <div className="flex flex-col pt-5 pb-5 gap-10">
        {allPost.map((post) => {
          return (
            <Post postId={post.postId} key={post.postId} />
          );
        })}
        {hasMore && (
          <div ref={loaderRef} className="ml-auto mr-auto">
            <Spinner />
          </div>
        )}
      </div>
    </>
  );
}
