import React from "react";
import { currentUser } from "@/modules/authentication/actions";
import ChatSession from "@/modules/chat/components/chat-session";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="h-full w-full">
      <ChatSession user={user} />
    </div>
  );
}
