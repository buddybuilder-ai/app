import { NextRequest, NextResponse } from "next/server";
import emitter from "@/lib/mobilePhotoEmitter";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const image = formData.get("image") as File | null;
  const height = (formData.get("target_height") as string) || "2.5";

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
  if (image) forwardData.append("image", image, (image as any).name || "photo.jpg");
  forwardData.append("target_height", height);

  const res = await fetch(`${FASTAPI_URL}/api/v1/chat/process-single-image`, {
    method: "POST",
    body: forwardData as any,
  });

  let body: any;
  try {
    body = await res.json();
  } catch {
    body = await res.text().catch(() => null);
  }

  return NextResponse.json(body, { status: res.status });
}