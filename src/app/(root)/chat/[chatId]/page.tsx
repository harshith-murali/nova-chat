import React from "react";
import { currentUser } from "@/modules/authentication/actions";
import ChatSession from "@/modules/chat/components/chat-session";

interface PageProps {
  params: Promise<{
    chatId: string;
  }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { chatId } = await params;
  const user = await currentUser();

  return (
    <div className="h-full w-full">
      <ChatSession user={user} chatId={chatId} />
    </div>
  );
}
