import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import { join } from "path";

type tParams = Promise<{ fileName: string }>;

export async function GET(_: NextRequest, { params }: { params: tParams }) {
    const { fileName } = await params;

    const filePath = join(process.cwd(), "uploads", fileName);

    try {
        const fileBuffer = fs.readFileSync(filePath);
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'image/jpeg', // Adjust the content type based on your image format
                'Content-Disposition': `inline; filename="${fileName}"`,
            },
        });
    } catch {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
}