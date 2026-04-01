import { ChatFullPage } from "@/components/features/chat/chat-fullpage"

export default function ChatPage() {
  return (
    // -m 打消 main ของ dashboard layout (p-4 sm:p-6)
    // h-[calc] ครอบคลุมพื้นที่เหลือหลัง header (4rem)
    <div className="-m-4 sm:-m-6 h-[calc(100vh-4rem)]">
      <ChatFullPage />
    </div>
  )
}
