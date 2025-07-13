import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "Notifications | Pariksha Hub" }];

export default function NotificationsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-20">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <p className="text-gray-600">Stay updated with the latest notifications.</p>
    </div>
  );
} 