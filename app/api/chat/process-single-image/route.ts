import { NextRequest, NextResponse } from "next/server";
import emitter from "@/lib/mobilePhotoEmitter";
import os from "os";
import path from "path";
import fs from "fs/promises";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const image = formData.get("image") as File | null;
  const height = (formData.get("target_height") as string) || "2.5";
  const sessionId = formData.get("sessionId") as string | null;

  // broadcast photo to desktop listeners
  if (image && typeof image.arrayBuffer === "function") {
    try {
      const buf = await image.arrayBuffer();
      const b64 = Buffer.from(buf).toString("base64");
      const url = `data:${image.type};base64,${b64}`;
      emitter.emit("photo", url);
    } catch (e) {
      console.warn("failed to convert uploaded image", e);
    }
  }

  // forward request to backend
  const forwardData = new FormData();
  if (image) forwardData.append("image", image, image.name || "photo.jpg");
  forwardData.append("target_height", height);

  // Indicate processing has started so desktop can show loading spinner
  let sessionFilePath = "";
  if (sessionId) {
    try {
      const safeSessionId = path.basename(sessionId);
      sessionFilePath = path.join(os.tmpdir(), `${safeSessionId}.json`);
      await fs.writeFile(sessionFilePath, JSON.stringify({ status: "processing" }));
    } catch (error) {
      console.error("Failed to write session file:", error);
    }
  }

  const res = await fetch(`${FASTAPI_URL}/api/v1/chat/process-single-image`, {
    method: "POST",
    body: forwardData,
  });

  let body: any;
  try {
    body = await res.json();
  } catch {
    body = await res.text().catch(() => null);
  }

  // If a sessionId was provided (from mobile upload), save the result for the desktop to poll
  if (sessionId && sessionFilePath) {
    try {
      const responseToSave = res.ok ? { status: "success", ...body } : { status: "error", message: body?.message || "Internal server error" };
      await fs.writeFile(sessionFilePath, JSON.stringify(responseToSave));
    } catch (error) {
      console.error("Failed to write session file:", error);
    }
  }

  return NextResponse.json(body, { status: res.status });
}