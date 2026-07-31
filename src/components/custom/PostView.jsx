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
import { useAuth } from "@/src/hooks/useAuth";
import Post from "@/src/components/custom/Post";
import { Spinner } from "@/src/components/ui/spinner";

export default function PostView({ filter, userInProfileId, refreshKey }) {
  const { postId } = useParams();
  const { db } = getConfig();
  const { user } = useAuth();

  const [allPost, setAllPost] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef(null);

  const getFollowerIds = async () => {
    const q = query(
      collection(db, "follows"),
      where("followerId", "==", user.userId),
    );
    const followingSnap = await getDocs(q);
    const followingIds = followingSnap.docs.map(
      (doc) => doc.data().followingId,
    );
    followingIds.push(user.userId);
    return followingIds;
  };

  const createQuery = (lastDoc = null) => {
    const constraints = [];
    let collectionName = "posts";

    switch (filter) {
      case "my-posts":
        if (userInProfileId) {
          constraints.push(
            where("userId", "==", userInProfileId),
            where("replyToPostId", "==", ""),
          );
        }
        break;

      case "all-replies":
        constraints.push(where("replyToPostId", "==", postId));
        break;

      case "my-replies":
        if (userInProfileId) {
          constraints.push(
            where("userId", "==", userInProfileId),
            where("replyToPostId", "!=", ""),
          );
        }
        break;

      case "liked-posts":
        if (userInProfileId) {
          constraints.push(where("userId", "==", userInProfileId));
          collectionName = "likes";
        }
        break;

      case "bookmarks":
        if (userInProfileId) {
          constraints.push(where("userId", "==", userInProfileId));
          collectionName = "bookmarks";
        }
        break;

      default:
        break;
    }

    constraints.push(orderBy("createdAt", "desc"));

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    constraints.push(limit(10));

    return query(collection(db, collectionName), ...constraints);
  };

  const getFollowingFeed = async (lastDoc = null) => {
    const followingIds = await getFollowerIds();
    let constraints = [];
    constraints.push(
      where("userId", "in", followingIds),
      where("replyToPostId", "==", ""),
      orderBy("createdAt", "desc"),
    )
    if(lastDoc)
      constraints.push(startAfter(lastDoc))

    constraints.push(limit(10))
    const q = query(
      collection(db, "posts"), ...constraints
    );
    const snapshot = await getDocs(q);
    
    return snapshot;
  };

  const loadPost = async () => {
    let newPosts;
    let snapshot;
    if (filter === "home-feed") {
      snapshot = await getFollowingFeed();
      newPosts = snapshot.docs.map((doc) => ({
        postId: doc.id,
        ...doc.data(),
      }));

    } else {
      snapshot = await getDocs(createQuery());
      newPosts = snapshot.docs.map((doc) => ({
        postId: doc.id,
        ...doc.data(),
      }));
    }
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

    if (snapshot.empty) {
      setLastDoc(null);
      setHasMore(false);
      setInitialLoading(false);
      return;
    }
    if (snapshot.docs.length < 10) setHasMore(false);

    setAllPost(newPosts);
    setInitialLoading(false);
  };

  const loadMore = async () => {
    if (loading) return;
    if (!lastDoc) return;

    setLoading(true);
    let newPosts;
    let snapshot;
    if (filter === "home-feed") {
      snapshot = await getFollowingFeed(lastDoc);
      newPosts = snapshot.docs.map((doc) => ({
        postId: doc.id,
        ...doc.data(),
      }));

    } else {
      snapshot = await getDocs(createQuery(lastDoc));
      newPosts = snapshot.docs.map((doc) => ({
        postId: doc.id,
        ...doc.data(),
      }));
    }

    setAllPost((prev) => [...prev, ...newPosts]);

    if (snapshot.empty) {
      setLastDoc(null);
      setHasMore(false);
      return;
    }

    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

    if (snapshot.docs.length < 10) setHasMore(false);

    setLoading(false);
  };

  useEffect(() => {
    loadPost();
  }, [db, postId, userInProfileId]);

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

  useEffect(() => {
    loadPost();
  }, [refreshKey]);

  if (initialLoading)
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );

  return (
    <>
      <div className="flex flex-col pt-5 pb-5 gap-10">
        {allPost.map((post) => {
          return <Post postId={post.postId} key={post.postId} />;
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
