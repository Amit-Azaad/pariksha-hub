import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "Profile | Pariksha Hub" }];

export default function ProfilePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-20">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p className="text-gray-600">Manage your profile and settings here.</p>
    </div>
  );
} 