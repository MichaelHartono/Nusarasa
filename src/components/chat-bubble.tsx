import { createClient } from "@/utils/supabase/client";
import type { Message } from "ai/react";
import React, { useEffect, useState } from "react";

export default function ChatBubble(props: {
  message: Message;
  username: string;
}) {
  const username = props.username;
  const roleClassName =
    props.message.role === "user"
      ? "bg-nusa-red text-white max-w-full "
      : "text-black bg-white border-nusa-red border-2 max-w-[80%] ";
  const prefix = props.message.role === "user" ? username : "Renata";

  return (
    <div className={props.message.role === "user" ? "ml-auto" : "mr-auto"}>
      <div
        className={`${
          props.message.role === "user" ? "text-end" : "text-nusa-red"
        } mb-2 font-bold `}
      >
        {prefix}
      </div>
      <div
        className={`${roleClassName} rounded px-4 py-2 mb-4 whitespace-pre-wrap flex flex-col`}
      >
        <span>{props.message.content}</span>
      </div>
    </div>
  );
}
