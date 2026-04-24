import { type NextRequest } from "next/server";
import { FASTAPI_URL } from "@/lib/constants";

// พอร์ต 8002 สำหรับ AI/Vision
const AI_BACKEND_URL = FASTAPI_URL.replace(':8000', ':8002');

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const { searchParams } = new URL(request.url);

  if (path === 'get-ip') {
    const upstream = await fetch(`${AI_BACKEND_URL}/api/v1/chat/get-ip`, { cache: "no-store" });
    return Response.json(await upstream.json());
  }

  if (path === 'check-upload-status') {
    const sessionId = searchParams.get("sessionId");
    const upstream = await fetch(
      `${AI_BACKEND_URL}/api/v1/chat/check-upload-status?sessionId=${sessionId}`,
      { cache: "no-store" }
    );
    return Response.json(await upstream.json());
  }

  return new Response("AI Path Not Found", { status: 404 });
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');

  if (path === 'process-single-image') {
    const formData = await request.formData();
    const upstream = await fetch(`${AI_BACKEND_URL}/api/v1/chat/process-single-image`, {
      method: "POST",
      body: formData,
    });
    return Response.json(await upstream.json());
  }

  return new Response("AI Path Not Found", { status: 404 });
}