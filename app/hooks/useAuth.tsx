import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { User } from "../lib/types";

interface AuthData {
  user?: User;
}

export function useAuth() {
  const loaderData = useLoaderData<AuthData>();
  const [user, setUser] = useState<User | null>(loaderData?.user || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setUser(loaderData?.user || null);
  }, [loaderData?.user]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "ADMIN";
  const isGuest = !isAuthenticated;

  return {
    user,
    isAuthenticated,
    isAdmin,
    isGuest,
    isLoading,
    setUser,
    setIsLoading,
  };
}
