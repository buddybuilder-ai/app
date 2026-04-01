import { NextRequest } from "next/server";
import emitter from "@/lib/mobilePhotoEmitter";

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const sendPhoto = (data: string) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      emitter.on("photo", sendPhoto);

      request.signal.addEventListener("abort", () => {
        emitter.off("photo", sendPhoto);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}