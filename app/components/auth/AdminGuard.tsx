import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import type { User } from "../../lib/types";

interface AdminGuardProps {
  user: User | null;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AdminGuard({ user, children, fallback }: AdminGuardProps) {
  const navigate = useNavigate();

  useEffect(() => {
    // If no user, redirect to home
    if (!user) {
      navigate("/");
      return;
    }

    // If user is not admin, redirect to home
    if (user.role !== "ADMIN") {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  // Show fallback while checking or if access denied
  if (!user || user.role !== "ADMIN") {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // User is admin, render children
  return <>{children}</>;
}
