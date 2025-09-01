import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAdmin } from "../lib/oauth.server";
import { prisma } from "../lib/prisma.server";
import { unlink } from "fs/promises";
import { join } from "path";

// DELETE /api/hero-sections/:id - Delete hero section
export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== "DELETE") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const admin = await requireAdmin(request);
    const id = params.id;

    if (!id) {
      return json({ error: "Hero section ID is required" }, { status: 400 });
    }

    // Get hero section to get image path
    const heroSection = await prisma.heroSection.findUnique({
      where: { id: parseInt(id) }
    });

    if (!heroSection) {
      return json({ error: "Hero section not found" }, { status: 404 });
    }

    // Delete the hero section from database
    await prisma.heroSection.delete({
      where: { id: parseInt(id) }
    });

    // Delete the image file
    if (heroSection.imageUrl) {
      try {
        // Handle both /public/... and /images/... formats
        const imagePath = heroSection.imageUrl.startsWith('/public/') 
          ? heroSection.imageUrl.substring(1) // Remove leading /
          : heroSection.imageUrl;
        const fullImagePath = join(process.cwd(), imagePath);
        console.log("Attempting to delete image file:", fullImagePath);
        await unlink(fullImagePath);
        console.log("Successfully deleted image file:", heroSection.imageUrl);
      } catch (error) {
        console.warn("Could not delete image file:", error);
        // Don't fail the request if image deletion fails
      }
    }

    return json({ message: "Hero section deleted successfully" });
  } catch (error) {
    console.error("Error deleting hero section:", error);
    if (error instanceof Error && error.message.includes("Access Denied")) {
      return json({ error: "Admin access required" }, { status: 403 });
    }
    return json({ error: "Failed to delete hero section" }, { status: 500 });
  }
}
