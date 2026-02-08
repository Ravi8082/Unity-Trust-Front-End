"use client";

import React from "react"

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
    if (!isLoading && isAuthenticated && allowedRoles && !hasRole(allowedRoles)) {
      router.push("/unauthorized");
    }
  }, [isLoading, isAuthenticated, allowedRoles, hasRole, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bank-blue">
        <Loader2 className="h-12 w-12 animate-spin text-bank-gold" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}
