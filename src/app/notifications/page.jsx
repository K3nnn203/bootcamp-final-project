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
import React, { useEffect, useState } from "react";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { Spinner } from "@/src/components/ui/spinner";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import getConfig from "@/src/firebase/config";

export default function Notifications() {
  const { db } = getConfig();
  const { user, loading } = useAuthGuard();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.userId),
      orderBy("createdAt", "desc"),
      limit(10),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const newNotifications = [];
      snapshot.forEach((notification) => {
        newNotifications.push({
          notificationId: notification.id,
          ...notification.data(),
        });
      });
      setNotifications(newNotifications);
    });

    return unsub;
  }, [user]);

  if (loading)
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );

  return (
    <>
      <div className="flex flex-col gap-5">
        {notifications.length === 0 && (
          <div className="text-center">No notifications</div>
        )}
        {notifications.map((notification) => {
          return (
            <Card key={notification.notificationId}>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>
                      {notification?.actorUsername}{" "}
                      {notification?.type === "new-post"
                        ? "just posted"
                        : "replied to your post"}
                    </CardTitle>
                    <CardDescription>{notification?.content}</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
