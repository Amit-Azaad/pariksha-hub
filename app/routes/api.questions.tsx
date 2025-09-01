import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAdmin } from "../lib/oauth.server";
import { prisma } from "../lib/prisma.server";

// GET /api/questions - List questions with filtering (public read, admin write)
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const difficulty = url.searchParams.get("difficulty");
  const tags = url.searchParams.get("tags");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  try {
    const where: any = { isActive: true };
    
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (tags) {
      const tagArray = tags.split(",").map(tag => tag.trim());
      where.tags = { hasSome: tagArray };
    }
    
    // Add search functionality for question text
    if (search) {
      where.translations = {
        some: {
          language: "en",
          questionText: {
            contains: search
          }
        }
      };
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          translations: {
            where: { language: "en" } // Default to English
          },
          tags: true
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.question.count({ where })
    ]);

    return json({
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

// POST /api/questions - Create new question (admin only)
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const admin = await requireAdmin(request);
    const formData = await request.formData();
    
    const questionData = {
      questionType: formData.get("questionType") as string,
      category: formData.get("category") as string,
      difficulty: formData.get("difficulty") as string,
      isActive: formData.get("isActive") === "true"
    };

    const tags = (formData.get("tags") as string).split(",").map(tag => tag.trim());

    const translationData = {
      language: formData.get("language") as string,
      questionText: formData.get("questionText") as string,
      explanation: formData.get("explanation") as string,
      optionA: formData.get("optionA") as string,
      optionB: formData.get("optionB") as string,
      optionC: formData.get("optionC") as string,
      optionD: formData.get("optionD") as string,
      correctOptionKey: formData.get("correctOptionKey") as string
    };

    // Validate required fields
    if (!questionData.questionType || !questionData.category || !translationData.questionText) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create question with translation and tags
    const question = await prisma.question.create({
      data: {
        ...questionData,
        translations: {
          create: translationData
        },
        tags: {
          create: tags.map(tag => ({ tag }))
        }
      },
      include: {
        translations: true,
        tags: true
      }
    });

    return json({ question, message: "Question created successfully" });
  } catch (error) {
    console.error("Error creating question:", error);
    if (error instanceof Error && error.message.includes("Access Denied")) {
      return json({ error: "Admin access required" }, { status: 403 });
    }
    return json({ error: "Failed to create question" }, { status: 500 });
  }
}