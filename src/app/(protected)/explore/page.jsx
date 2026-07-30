"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import getConfig from "@/src/firebase/config";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { CircleX, Search, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import styles from "@/src/app/(protected)/explore/page.module.css";
import { Spinner } from "@/src/components/ui/spinner";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/src/components/ui/item";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { useAuth } from "@/src/hooks/useAuth";

export default function Explore() {
  const { db } = getConfig();
  const { user, loading } = useAuth();

  const [loadingSearch, setLoadingSearch] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  const getUsers = async () => {
    const q = query(
      collection(db, "users"),
      where("usernameLowerCase", ">=", keyword),
      where("usernameLowerCase", "<", `${keyword}\uf8ff`),
      limit(5),
    );

    const snapshot = await getDocs(q);
    const result = snapshot.docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
    }));
    setSearchedUsers(result);
    setLoadingSearch(false);
  };

  const getSearchHistory = async () => {
    const q = query(
      collection(db, "searchHistory"),
      where("userId", "==", user.userId),
      orderBy("createdAt", "desc"),
      limit(10),
    );

    const docSnap = await getDocs(q);
    const result = docSnap.docs.map((doc) => ({
      historyId: doc.id,
      ...doc.data(),
    }));
    setSearchHistory(result);
  };

  const updateSearchHistory = async (searchedUser) => {
    const q = query(
      collection(db, "searchHistory"),
      where("searchedUserId", "==", searchedUser.userId),
      where("userId", "==", user.userId),
    );

    const docRef = await getDocs(q);
    if (docRef.docs.length !== 0) {
      //document exist
      const existingHistoryId = docRef.docs[0].id;
      const historyRef = doc(db, "searchHistory", existingHistoryId);
      await updateDoc(historyRef, {
        createdAt: serverTimestamp(),
      });
    } else {
      await addDoc(collection(db, "searchHistory"), {
        userId: user.userId,
        searchedUserId: searchedUser.userId,
        searchedUsername: searchedUser.username,
        searchedUserProfilePicture: searchedUser.profilePic,
        createdAt: serverTimestamp(),
      });
    }
  };

  const handleDeleteSingleHistory = async (historyId) => {
    const docRef = doc(db, "searchHistory", historyId);
    await deleteDoc(docRef);
  };

  const handleDeleteAllHistory = async () => {
    const q = query(
      collection(db, 'searchHistory'),
      where("userId", "==", user.userId),
    )
    const snapshot = await getDocs(q)
    const promises = snapshot.docs.map(history => {
      deleteDoc(history.ref)
    })

    await Promise.all(promises)
    getSearchHistory();
  };

  useEffect(() => {
    if (!keyword) {
      setSearchedUsers([]);
      return;
    }
    const timeoutId = setTimeout(() => {
      getUsers();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [keyword]);

  useEffect(() => {
    if (!user) return;
    getSearchHistory();
  }, [user]);

  if(loading) return <div className="flex justify-center"><Spinner /></div>

  return (
    <>
      <Popover open={keyword.length !== 0}>
        <PopoverTrigger aschild="true" className="w-full">
          <InputGroup>
            <InputGroupInput
              placeholder="Search..."
              value={keyword}
              onChange={(e) => {
                setLoadingSearch(true);
                setKeyword(e.target.value.toLowerCase());
              }}
              autoComplete="off"
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              {keyword.length !== 0 && (
                <CircleX onClick={() => setKeyword("")} />
              )}
            </InputGroupAddon>
          </InputGroup>
        </PopoverTrigger>
        <PopoverContent initialFocus={false} className={styles.popup}>
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
                onClick={() => updateSearchHistory(user)}
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
          {searchedUsers.length === 5 && (
            <Link
              className="text-blue-400 text-center"
              href={`/explore/search?searchQuery=${keyword}`}
            >
              View More
            </Link>
          )}
        </PopoverContent>
      </Popover>
      <div className="mt-2 mb-2">
        {searchHistory.map((history) => {
          return (
            <Item
              key={history.historyId}
              className="flex justify-between items-center hover:bg-muted"
            >
              <Link
                href={`/${history.searchedUsername}`}
                className="flex flex-1 items-center gap-3"
              >
                <ItemMedia>
                  <Avatar className="size-10">
                    <AvatarImage src={history?.searchedUserProfilePicture} />
                    <AvatarFallback>{history?.searchedUsername[0]}</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{history?.searchedUsername}</ItemTitle>
                </ItemContent>
              </Link>
              <ItemActions>
                <Button
                  variant="outline"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await handleDeleteSingleHistory(history?.historyId)
                    getSearchHistory();
                  }}
                >
                  <X />
                </Button>
              </ItemActions>
            </Item>
          );
        })}
        {searchHistory.length !== 0 && (
          <div className="flex justify-center">
            <Button
              className="text-blue-400 text-center"
              variant="ghost"
              onClick={handleDeleteAllHistory}
            >
              Delete all search history
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
