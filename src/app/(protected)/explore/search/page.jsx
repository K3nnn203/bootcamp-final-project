"use client";

import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/src/components/ui/item";
import { Spinner } from "@/src/components/ui/spinner";
import getConfig from "@/src/firebase/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { collection, where, getDocs, query } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function SearchUser() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("searchQuery");

  const { db } = getConfig();

  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState([]);

  const getUsers = async () => {
    const q = query(
      collection(db, "users"),
      where("usernameLowerCase", ">=", searchQuery),
      where("usernameLowerCase", "<", `${searchQuery}\uf8ff`),
    );

    const snapshot = await getDocs(q);
    const result = snapshot.docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
    }));
    setSearchedUsers(result);
    setLoadingSearch(false);
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div>
      <h1>Users matching search result "{searchQuery}"</h1>
      <div className="mt-2">
        {loadingSearch === true && (
          <div className="ml-auto mr-auto">
            <Spinner />
          </div>
        )}
        {searchedUsers.length === 0 && !loadingSearch && (
          <div className="ml-auto mr-auto">No user found</div>
        )}
        {searchedUsers.map((user) => {
          return (
            <Item
              key={user?.userId}
              render={
                <a href={`/${user?.username}`}>
                  <ItemMedia>
                    <Avatar className="size-10">
                      <AvatarImage src={user?.profilePic} />
                      <AvatarFallback>{user?.username[0]}</AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{user?.username}</ItemTitle>
                  </ItemContent>
                </a>
              }
            ></Item>
          );
        })}
      </div>
    </div>
  );
}
