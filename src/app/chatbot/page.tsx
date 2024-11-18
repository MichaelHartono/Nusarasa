/* eslint-disable react/jsx-key */
"use client";
import ChatBubble from "@/components/chat-bubble";
import StoreEmbeddings from "@/components/update-embeddings";
import { createClient } from "@/utils/supabase/client";
import { useChat } from "ai/react";
import { Button, TextInput } from "flowbite-react";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { IoSyncOutline } from "react-icons/io5";

const promptExample = [
  "Berikan rekomendasi resep yang menggunakan daging ayam",
  "Berikan rekomendasi resep yang memiliki cita rasa manis",
  "Berikan rekomendasi resep yang dapat dimasak di bawah 90 menit",
  "Berikan rekomendasi resep yang vegetarian",
  "Berikan rekomendasi resep yang berasal dari Betawi",
];

interface User {
  username: string;
  role_id: number;
}

export default function Chatbot() {
  const supabase = createClient();
  const [user, setUser] = useState<User>({ username: "", role_id: 1 });
  const [openEmbeddingsModal, setOpenEmbeddingsModal] = useState(false);
  const [pageIsLoading, setLoading] = useState(false);

  const getUser = async () => {
    setLoading(true);
    const { data } = await supabase.auth.getUser();

    const user = await supabase
      .from("user")
      .select("*")
      .eq("user_id", data.user?.id)
      .single();

    setUser({
      username: user.data?.username,
      role_id: user?.data?.role_id,
    });
    setLoading(false);
  };

  useEffect(() => {
    getUser();
  }, []);

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    api: "/api/retrieval",
  });

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!messages.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    if (isLoading) {
      return;
    }
    handleSubmit(e);
    setInput("");
  }

  return (
    <div className="mx-auto max-w-7xl">
      {!pageIsLoading ? (
        <div>
          <div className="flex items-center mb-4 justify-center">
            <Image
              src="https://lcdgpwihlqbcovpwyuur.supabase.co/storage/v1/object/public/image/renata/renata.png?t=2024-05-21T15%3A08%3A26.283Z"
              alt="Nusarasa Logo"
              className="mr-3"
              width={110}
              height={110}
            />
            <h1 className="text-3xl font-extrabold text-black">
              Renata - Resep Nusantara Assistant
            </h1>
          </div>
          {user.role_id === 1 && (
            <div className="flex justify-end mb-4">
              <Button onClick={() => setOpenEmbeddingsModal(true)}>
                <IoSyncOutline className="mr-2 h-5 w-5" />
                Update Chatbot Data
              </Button>
              <StoreEmbeddings
                show={openEmbeddingsModal}
                onClose={() => setOpenEmbeddingsModal(false)}
              />
            </div>
          )}
          <div>
            {messages.length === 0 && (
              <div className="border-2 rounded border-slate-300 px-4 pt-2">
                <h2 className="text-xl font-bold mb-4">
                  Ask Renata question related to Resep Masakan Nusantara such as:
                </h2>
                <div>
                  {promptExample.map((example) => (
                    <Button
                      pill
                      outline
                      className="mb-4"
                      onClick={() => setInput(example)}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.length > 0 && (
              <div className="flex flex-col-reverse w-full mb-2 max-h-96 overflow-y-auto border-2 border-slate-300 rounded shadow-sm px-8 py-4">
                {[...messages].reverse().map((m) => (
                  <ChatBubble
                    key={m.id}
                    message={m}
                    username={user?.username}
                  />
                ))}
              </div>
            )}

            <form onSubmit={sendMessage} className="flex w-full flex-col">
              <div className="flex w-full mt-4 items-center">
                <TextInput
                  className="mr-2 grow rounded"
                  value={input}
                  placeholder="Ask Renata here!"
                  onChange={handleInputChange}
                />
                <Button type="submit" color="success">
                  {isLoading ? (
                    <AiOutlineLoading className="animate-spin" size={18} />
                  ) : (
                    "Send"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <AiOutlineLoading className="animate-spin" size={100} />
        </div>
      )}
    </div>
  );
}
