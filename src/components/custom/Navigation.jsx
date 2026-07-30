'use client'

import React, { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/src/components/ui/navigation-menu";
import Alert from "@/src/components/custom/Alert";
import { Button } from "../ui/button";
import getConfig from "@/src/firebase/config";
import { signOut } from "firebase/auth";
import { useAuth } from "@/src/hooks/useAuth";
import { toast } from "sonner";
import { useTheme } from "@/src/context/ThemeContext";

export default function Navigation() {
  const { theme, toggle } = useTheme();
  const { auth } = getConfig();
  const { user } = useAuth();

  const [loadingLogout, setLoadingLogout] = useState(false);
  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await signOut(auth);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <div className="grid grid-cols-[1fr_2fr_1fr]">
      <NavigationMenu className="p-1 ml-auto mr-auto col-start-2 self-center">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/" className="text-xl">
              Home
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/explore" className="text-xl">
              Explore
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/notifications" className="text-xl">
              Notifications
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/bookmark" className="text-xl">
              Bookmark
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              href={`/${user.username}`}
              className="text-xl"
            >
              Profile
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex gap-2 items-center ml-auto mr-2">
        <Button onClick={toggle}>
          Switch to {theme === "light" ? "dark" : "light"} theme
        </Button>
        <Alert
          trigger={<Button>Logout</Button>}
          size="sm"
          title="Logout"
          description="You will need to log in again."
          confirmText="Logout"
          onConfirm={handleLogout}
          loading={loadingLogout}
        />
      </div>
    </div>
  );
}
