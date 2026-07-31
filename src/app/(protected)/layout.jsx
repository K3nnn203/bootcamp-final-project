"use client";

import DesktopNavigation from "@/src/components/custom/DesktopNavigation";
import MobileNavigation from "@/src/components/custom/MobileNavigation";
import ProtectedRoute from "@/src/components/custom/ProtectedRoute";

export default function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <DesktopNavigation className="hidden lg:grid" />
      <MobileNavigation className="lg:hidden "/>
      <div className="max-w-150 min-h-[calc(100vh-60px)] mr-auto ml-auto border-r border-l p-5">
        {children}
      </div>
    </ProtectedRoute>
  );
}
