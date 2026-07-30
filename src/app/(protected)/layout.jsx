"use client";

import Navigation from "@/src/components/custom/Navigation";
import ProtectedRoute from "@/src/components/custom/ProtectedRoute";

export default function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <Navigation />
      <div className="w-150 min-h-[calc(100vh-60px)] mr-auto ml-auto border-r border-l p-5">
        {children}
      </div>
    </ProtectedRoute>
  );
}
