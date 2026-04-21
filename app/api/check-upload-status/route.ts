import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import os from "os";

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
  const sessionFilePath = path.join(os.tmpdir(), `${safeSessionId}.json`);

  try {
    // Check if the session file exists
    await fs.access(sessionFilePath);

    // If it exists, read it
    const data = await fs.readFile(sessionFilePath, "utf-8");
    
    // Parse the data to check status
    let parsedData = { status: "unknown" };
    try {
      parsedData = JSON.parse(data);
    } catch {
      // Ignore parse error
    }

    // Only delete the file if it is NOT currently processing
    if (parsedData.status !== "processing") {
      await fs.unlink(sessionFilePath);
    }

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
