import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "Jobs | Pariksha Hub" }];

export default function JobsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-20">
      <h1 className="text-2xl font-bold mb-4">Jobs</h1>
      <p className="text-gray-600">Find the latest job opportunities here.</p>
    </div>
  );
} 