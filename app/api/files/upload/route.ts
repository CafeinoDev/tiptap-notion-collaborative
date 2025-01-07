"use server";

import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import fs from 'fs';

// Configure multer for file storage
async function parseFormData(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const pageId = formData.get("pageId") as string;
    const attachmentId = formData.get("attachmentId") as string | null;

    if (file) {
        const buffer = await file.arrayBuffer();
        const filePath = join(process.cwd(), "uploads", file.name);
        const dir = join(process.cwd(), "uploads");
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, Buffer.from(buffer));
    }

    return { file, pageId, attachmentId };
}

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
    const regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return regex.test(uuid);
}
export async function POST(req: NextRequest) {
    try {
        const { file, pageId, attachmentId } = await parseFormData(req);

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, {
                status: 400
            });
        }

        if (!pageId) {
            return NextResponse.json({ error: "PageId is required" }, {
                status: 400
            });
        }

        if (attachmentId && !isValidUUID(attachmentId)) {
            return NextResponse.json({ error: "Invalid attachment id" }, {
                status: 400
            });
        }

        const response = {
            fileName: file.name,
            filePath: `/uploads/${file.name}`,
            pageId,
            attachmentId: attachmentId || null,
        };

        return NextResponse.json(response);
        /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (err: any) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return NextResponse.json({ error: "File too large" }, {
                status: 413
            });
        }
        return NextResponse.json({ error: "Internal server error" }, {
            status: 500
        });
    }
}