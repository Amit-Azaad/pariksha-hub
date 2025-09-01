import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAdmin, requireUser } from "../lib/oauth.server";
import { prisma } from "../lib/prisma.server";

// GET /api/quizzes - List public quizzes (public read, admin write)
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  try {
    const where: any = { isActive: true, isPublic: true };
    
    if (type) where.type = type;

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        include: {
          creator: {
            select: { name: true, email: true }
          },
          _count: {
            select: { questions: true, attempts: true }
          }
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.quiz.count({ where })
    ]);

    return json({
      quizzes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}

// POST /api/quizzes - Create new quiz (admin only)
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const admin = await requireAdmin(request);
    const formData = await request.formData();
    
    const quizData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      timeLimit: formData.get("timeLimit") ? parseInt(formData.get("timeLimit") as string) : null,
      isActive: formData.get("isActive") === "true",
      isPublic: formData.get("isPublic") === "true",
      createdBy: admin.id
    };

    const questionIds = (formData.get("questionIds") as string).split(",").map(id => parseInt(id.trim()));

    // Validate required fields
    if (!quizData.title || questionIds.length === 0) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create quiz with questions
    const quiz = await prisma.quiz.create({
      data: {
        ...quizData,
        questions: {
          create: questionIds.map((questionId, index) => ({
            questionId,
            order: index + 1,
            points: 1
          }))
        }
      },
      include: {
        questions: {
          include: {
            question: {
              include: {
                translations: {
                  where: { language: "en" }
                }
              }
            }
          }
        },
        creator: {
          select: { name: true, email: true }
        }
      }
    });

    return json({ quiz, message: "Quiz created successfully" });
  } catch (error) {
    console.error("Error creating quiz:", error);
    if (error instanceof Error && error.message.includes("Access Denied")) {
      return json({ error: "Admin access required" }, { status: 403 });
    }
    return json({ error: "Failed to create quiz" }, { status: 500 });
  }
}
