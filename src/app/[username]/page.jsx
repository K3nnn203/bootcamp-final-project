"use client";

import Post from "@/src/components/custom/Post";
import PostView from "@/src/components/custom/PostView";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import getConfig from "@/src/firebase/config";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Profile() {
  const router = useRouter();
  const { username } = useParams();
  const { user, loading } = useAuthGuard();
  const { db } = getConfig();

  const [userInProfile, setUserInProfile] = useState();
  const [followed, setFollowed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const getUser = async () => {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({ userId: doc.id, ...doc.data() });
    });
    return data[0];
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const handleFollow = async () => {
    const followRef = doc(
      db,
      "follows",
      `${user.userId}_${userInProfile.userId}`,
    );
    const followSnap = await getDoc(followRef);

    if (followSnap.exists()) {
      await deleteDoc(followRef);
      await updateDoc(doc(db, "users", user.userId), {
        followingCount: increment(-1),
      });
      await updateDoc(doc(db, "users", userInProfile.userId), {
        followerCount: increment(-1),
      });
      setFollowed(false);
    } else {
      await setDoc(followRef, {
        followerId: user.userId,
        followingId: userInProfile.userId,
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, "users", user.userId), {
        followingCount: increment(1),
      });
      await updateDoc(doc(db, "users", userInProfile.userId), {
        followerCount: increment(1),
      });
      setFollowed(true);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      if (!username || !user) return;
      if (username === user?.username) {
        setUserInProfile(user);
      } else {
        const getUserResult = await getUser();
        setUserInProfile(getUserResult);
      }
    };

    loadUser();
  }, [user, username]);

  useEffect(() => {
    if (!user || !userInProfile) return;

    if (username === user?.username) return;

    const checkFollow = async () => {
      const followRef = doc(
        db,
        "follows",
        `${user.userId}_${userInProfile.userId}`,
      );
      const res = await getDoc(followRef);
      if (res.exists()) {
        setFollowed(true);
      } else {
        setFollowed(false);
      }
    };

    checkFollow();
  }, [user, userInProfile]);

  if (loading) return <div>laoding...</div>;

  return (
    <>
      <div className="flex items-center gap-10 mb-5">
        <Avatar className="w-35 h-35">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="">
          <div className="mt-5 mb-2">
            <h1 className="font-heading text-2xl font-bold">
              {userInProfile?.profileName}
            </h1>
            <p className="text-sm text-muted-foreground">
              @{userInProfile?.username}
            </p>
          </div>
          <p className="mt-1 mb-1">
            Joined {userInProfile?.createdAt.toDate().toString().slice(4, 15)}
          </p>
          <div className="flex gap-10 mt-2 mb-1">
            <p>{userInProfile?.followingCount} Following</p>
            <p>{userInProfile?.followerCount} Followers</p>
          </div>
        </div>
        <div className="mb-auto mt-5">
          {username === user?.username ? (
            <Button variant="outline" onClick={handleEditProfile}>
              Edit Profile
            </Button>
          ) : followed === true ? (
            <Button
              variant="outline"
              onClick={handleFollow}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className="w-22.5 hover:border-red-500 hover:text-red-500"
            >
              {hovered ? "Unfollow" : "Following"}
            </Button>
          ) : (
            <Button onClick={handleFollow}>Follow</Button>
          )}
        </div>
      </div>
      <Tabs defaultValue="My Posts">
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="My Posts">My Posts</TabsTrigger>
          <TabsTrigger value="Replies">Replies</TabsTrigger>
          {username === user?.username && (
            <TabsTrigger value="Liked Posts">Liked Posts</TabsTrigger>
          )}
        </TabsList>
        <Separator />
        <TabsContent value="My Posts">
          <PostView 
            filter="my-posts" 
            userInProfileId={userInProfile?.userId} 
          />
        </TabsContent>
        <TabsContent value="Replies">
          <PostView
            filter="my-replies"
            userInProfileId={userInProfile?.userId}
          />
        </TabsContent>
        <TabsContent value="Liked Posts">
          <PostView 
            filter="liked-posts"
            userInProfileId={userInProfile?.userId} 
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
