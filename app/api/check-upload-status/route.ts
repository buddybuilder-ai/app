import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

// This temporary directory path is provided by the execution environment.
const TMP_DIR = "C:\\Users\\user\\.gemini\\tmp\\8412df0f53907a0c4a702bc81a0f5d8739e3bac9323cfeda350b12155409a505";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Surrogate-Control": "no-store",
  };

  if (!sessionId) {
    return NextResponse.json(
      { message: "Missing sessionId" },
      { status: 400, headers },
    );
  }

  // Sanitize sessionId to prevent directory traversal
  const safeSessionId = path.basename(sessionId);
  const sessionFilePath = path.join(TMP_DIR, `${safeSessionId}.json`);

  try {
    // Check if the session file exists
    await fs.access(sessionFilePath);

    // If it exists, read it
    const data = await fs.readFile(sessionFilePath, "utf-8");
    
    // Delete the file
    await fs.unlink(sessionFilePath);

    // Return the content
    return new NextResponse(data, {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" },
    });

  } catch {
    // File does not exist yet
    return NextResponse.json({ status: "pending" }, { headers });
  }
}
