import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

// This temporary directory path is provided by the execution environment.
const TMP_DIR = "C:\\Users\\user\\.gemini\\tmp\\8412df0f53907a0c4a702bc81a0f5d8739e3bac9323cfeda350b12155409a505";
const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const image = formData.get("image") as File | null;
  const sessionId = formData.get("sessionId") as string | null;

  if (!image || !sessionId) {
    return NextResponse.json(
      { message: "Missing image or sessionId" },
      { status: 400 },
    );
  }

  // Sanitize sessionId to prevent directory traversal
  const safeSessionId = path.basename(sessionId);
  const sessionFilePath = path.join(TMP_DIR, `${safeSessionId}.json`);

  // forward request to backend
  const forwardData = new FormData();
  forwardData.append("image", image, (image as any).name || "photo.jpg");
  forwardData.append("target_height", "2.5"); // Assuming default height

  try {
    const res = await fetch(`${FASTAPI_URL}/api/v1/chat/process-single-image`, {
      method: "POST",
      body: forwardData as any,
    });

    const body = await res.json();
    
    // Write the result to a temporary file
    await fs.writeFile(sessionFilePath, JSON.stringify(body));

    if (res.ok) {
      return NextResponse.json({
        status: "success",
        message: "Image processed and waiting for desktop client.",
      });
    } else {
      return NextResponse.json(body, { status: res.status });
    }
  } catch (error) {
    console.error("Mobile upload API error:", error);
    const errorResponse = { status: "error", message: "Internal server error" };
    // Write error to file so client gets notified
    await fs.writeFile(sessionFilePath, JSON.stringify(errorResponse));
    return NextResponse.json(
      errorResponse,
      { status: 500 },
    );
  }
}
