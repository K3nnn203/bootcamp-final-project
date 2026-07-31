import React, { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/src/components/ui/navigation-menu";
import { useAuth } from "@/src/hooks/useAuth";
import { Bell, Compass, House, Bookmark, User, Menu } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import getConfig from "@/src/firebase/config";
import { useTheme } from "@/src/context/ThemeContext";
import { Spinner } from "@/src/components/ui/spinner";
import { signOut } from "firebase/auth";

export default function MobileNavigation({ className }) {
  const { user } = useAuth();
  const { auth } = getConfig();
  const { theme, toggle } = useTheme();

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
    <div className={`w-full ${className}`}>
      <NavigationMenu className="p-1 max-w-none">
        <NavigationMenuList className="justify-around">
          <NavigationMenuItem>
            <NavigationMenuLink href="/">
              <House className="size-6" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/explore">
              <Compass className="size-6" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/notifications">
              <Bell className="size-6" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/bookmark">
              <Bookmark className="size-6" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href={`/${user.username}`}>
              <User className="size-6" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <Menu />
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid max-w-max">
                <li className="flex flex-col gap-2">
                  <Button onClick={toggle}>Switch Theme</Button>
                  <Button variant="outline" onClick={handleLogout}>
                    {loadingLogout && <Spinner />}
                    Logout
                  </Button>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
