
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const text = body.text;

  const client = createClient();
  
  const { error: deleteError } = await client
    .from('documents')
    .delete()
    .gte('id', 0);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2500,
    separators: ["### Recipe Name:", '\n\n'],
  });

  const splitDocuments = await splitter.createDocuments([text], [], {});

  const vectorStore = await SupabaseVectorStore.fromDocuments(
    splitDocuments,
    new OpenAIEmbeddings({ maxConcurrency: 5 }),
    {
      client,
      tableName: "documents",
      queryName: "match_documents",
    }
  );

  return NextResponse.json({ ok: true }, { status: 200 });
}
