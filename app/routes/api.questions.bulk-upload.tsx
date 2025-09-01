import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAdmin } from "../lib/oauth.server";
import { prisma } from "../lib/prisma.server";

// POST /api/questions/bulk-upload - Bulk upload questions via CSV (admin only)
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const admin = await requireAdmin(request);
    const formData = await request.formData();
    const csvFile = formData.get("csvFile") as File;
    const language = formData.get("language") || "en";

    if (!csvFile) {
      return json({ error: "CSV file is required" }, { status: 400 });
    }

    // Parse CSV content
    const csvText = await csvFile.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return json({ error: "CSV file must have at least a header and one data row" }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const dataRows = lines.slice(1);

    // Expected CSV structure
    const expectedHeaders = [
      'questionType', 'category', 'difficulty', 'tags', 
      'questionText', 'explanation', 'optionA', 'optionB', 'optionC', 'optionD', 'correctOptionKey'
    ];

    // Validate headers
    const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
      return json({ 
        error: `Missing required headers: ${missingHeaders.join(', ')}` 
      }, { status: 400 });
    }

    const results = {
      total: dataRows.length,
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const values = row.split(',').map(v => v.trim());
      
      try {
        // Map values to headers
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });

        // Validate required fields
        if (!rowData.questionType || !rowData.category || !rowData.questionText) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Missing required fields`);
          continue;
        }

        // Parse tags
        const tags = rowData.tags ? rowData.tags.split(';').map((tag: string) => tag.trim()) : [];

        // Create question
        const question = await prisma.question.create({
          data: {
            questionType: rowData.questionType,
            category: rowData.category,
            difficulty: rowData.difficulty || 'medium',
            isActive: true,
            tags: {
              create: tags.map(tag => ({ tag }))
            },
            translations: {
              create: {
                language,
                questionText: rowData.questionText,
                explanation: rowData.explanation || null,
                optionA: rowData.optionA,
                optionB: rowData.optionB,
                optionC: rowData.optionC,
                optionD: rowData.optionD,
                correctOptionKey: rowData.correctOptionKey
              }
            }
          }
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return json({
      message: `Bulk upload completed. ${results.success} questions created, ${results.failed} failed.`,
      results
    });

  } catch (error) {
    console.error("Error in bulk upload:", error);
    if (error instanceof Error && error.message.includes("Access Denied")) {
      return json({ error: "Admin access required" }, { status: 403 });
    }
    return json({ error: "Failed to process bulk upload" }, { status: 500 });
  }
}
