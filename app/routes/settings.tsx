import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "Settings | Pariksha Hub" }];

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-20">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-gray-600">Manage your app settings here.</p>
    </div>
  );
} 