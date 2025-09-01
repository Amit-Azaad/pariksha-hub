import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAdmin } from "../lib/oauth.server";
import { prisma } from "../lib/prisma.server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";

// GET /api/hero-sections - List all hero sections
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const heroSections = await prisma.heroSection.findMany({
      orderBy: { createdAt: "desc" }
    });

    return json({ heroSections });
  } catch (error) {
    console.error("Error fetching hero sections:", error);
    return json({ error: "Failed to fetch hero sections" }, { status: 500 });
  }
}

// POST /api/hero-sections - Create new hero section
// PUT /api/hero-sections - Update existing hero section
export async function action({ request }: ActionFunctionArgs) {
  try {
    const admin = await requireAdmin(request);
    const formData = await request.formData();
    
    const text = formData.get("text") as string;
    const image = formData.get("image") as File | null;
    const id = formData.get("id") as string | null;
    const method = request.method;

    if (!text?.trim()) {
      return json({ error: "Hero text is required" }, { status: 400 });
    }

    let imageUrl = "";

    // Handle image upload
    if (image && image.size > 0) {
      // Validate file type
      if (!image.type.startsWith('image/')) {
        return json({ error: "File must be an image" }, { status: 400 });
      }

      // Validate file size (max 5MB)
      if (image.size > 5 * 1024 * 1024) {
        return json({ error: "File size must be less than 5MB" }, { status: 400 });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = image.name.split('.').pop() || 'jpg';
      const filename = `hero_${timestamp}.${extension}`;
      
      // Save file to public/images/hero_images/
      const uploadPath = join(process.cwd(), 'public', 'images', 'hero_images', filename);
      const arrayBuffer = await image.arrayBuffer();
      await writeFile(uploadPath, Buffer.from(arrayBuffer));
      
      imageUrl = `/public/images/hero_images/${filename}`;
    }

    if (method === "POST") {
      // Create new hero section
      if (!image || image.size === 0) {
        return json({ error: "Image is required for new hero sections" }, { status: 400 });
      }

      const heroSection = await prisma.heroSection.create({
        data: {
          text: text.trim(),
          imageUrl
        }
      });

      return json({ heroSection, message: "Hero section created successfully" });
    } else if (method === "PUT") {
      // Update existing hero section
      if (!id) {
        return json({ error: "Hero section ID is required for updates" }, { status: 400 });
      }

      const updateData: any = {
        text: text.trim()
      };

      // Only update image if a new one is provided
      if (image && image.size > 0) {
        // Get current hero section to delete old image
        const currentSection = await prisma.heroSection.findUnique({
          where: { id: parseInt(id) }
        });

        if (currentSection?.imageUrl) {
          // Delete old image file
          try {
            // Handle both /public/... and /images/... formats
            const imagePath = currentSection.imageUrl.startsWith('/public/') 
              ? currentSection.imageUrl.substring(1) // Remove leading /
              : currentSection.imageUrl;
            const oldImagePath = join(process.cwd(), imagePath);
            console.log("Attempting to delete old image:", oldImagePath);
            await unlink(oldImagePath);
            console.log("Successfully deleted old image:", currentSection.imageUrl);
          } catch (error) {
            console.warn("Could not delete old image:", error);
            // Don't fail the update if we can't delete the old image
          }
        }

        updateData.imageUrl = imageUrl;
      }

      const heroSection = await prisma.heroSection.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      return json({ heroSection, message: "Hero section updated successfully" });
    } else {
      return json({ error: "Method not allowed" }, { status: 405 });
    }
  } catch (error) {
    console.error("Error managing hero section:", error);
    if (error instanceof Error && error.message.includes("Access Denied")) {
      return json({ error: "Admin access required" }, { status: 403 });
    }
    return json({ error: "Failed to manage hero section" }, { status: 500 });
  }
}
