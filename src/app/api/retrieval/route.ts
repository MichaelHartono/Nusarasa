// Import necessary modules and classes from various packages
import { NextRequest, NextResponse } from "next/server";
import {
  Message as VercelChatMessage,
  StreamingTextResponse,
  createStreamDataTransformer,
} from "ai";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { Document } from "@langchain/core/documents";
import { RunnableSequence } from "@langchain/core/runnables";
import {
  BytesOutputParser,
  StringOutputParser,
} from "@langchain/core/output_parsers";
import { createClient } from "@/utils/supabase/client";

// Set the dynamic property to "force-dynamic"
export const dynamic = "force-dynamic";

// Function to combine the content of multiple documents into a single string
const combineDocumentContent = (docs: Document[]) => {
  const docsContent = docs.map((doc) => doc.pageContent);
  return docsContent.join("\n\n");
};

// Function to format chat messages for processing
const formatMessages = (chatHistory: VercelChatMessage[]) => {
  const formattedDialogueMessage = chatHistory.map((message) => {
    if (message.role === "user") {
      return `User: ${message.content}`;
    } else if (message.role === "assistant") {
      return `You: ${message.content}`;
    }
  });
  return formattedDialogueMessage.join("\n");
};

// Template for rephrasing user input based on chat history
const REPHRASED_INPUT_TEMPLATE = `
Given the following conversation and a follow-up input, rephrase the follow-up input to achieve the following:
1. If it's a question, rephrase it to be a standalone question, ensuring it can be understood without needing to reference the previous conversation.
2. If it's a statement or response, retain its context and make it concise while maintaining its meaning and relevance to the chat history.

**Chat History:**
{chat_history}

**Follow-Up Input:** {user_input}

**Rephrased Input:** 
`;

// Create a PromptTemplate instance for the rephrased input template
const reprhasedInputTemplatePrompt = PromptTemplate.fromTemplate(
  REPHRASED_INPUT_TEMPLATE
);

// Template for generating the assistant's response
const ANSWER_TEMPLATE = `
Your Role:
- You are a cheerful expert cooking assistant specializing in Indonesian cuisine. 
- Your task is to assist users by providing helpful information about Indonesian recipes, including ingredients, cooking utensils, and instructions based on the context provided. 
- You can help provide recipe recommendation based on the user requests, such as ingredients, utensils, and categories (taste, specific diet, origin, type of cuisine (breakfast, lunch, dinner)) based on the context provided.
- You can also provide alternatives to the ingredients and utensils provided in the recipe, if and only if the user ask for alternatives.

Boundaries:
- Only provide information/recommendations/suggestions based on the context of Indonesian cuisine (Masakan Nusantara) provided in the retrieval context below.

Context: You can provide responses based on only the context provided and the ongoing conversation between you and the user:
- Context: 
{context}
- Chat History: 
{chat_history}

User's Input: {user_input}

Instructions for Generating Response:
1. Provide a detailed and helpful response that is relevant to the provided context, user's input, and chat history.
2. Ensure your response is formatted to be easily readable by the user.
3. If the user's input is unclear or gibberish, kindly ask the user to repeat it clearly.
4. Engage the user with additional questions to better understand their needs if there is any confusion.
5. When giving recommendation about a recipe make sure to provide the details such as bahan (ingredients), alat memasak (utensils), waktu memasak (cooking time), kategori (categories), and langkah memasak (instructions)..
6. Provide responses only in Bahasa Indonesia and make sure there are no english words.`;

// Create a PromptTemplate instance for the answer template
const answerTemplatePrompt = PromptTemplate.fromTemplate(ANSWER_TEMPLATE);

// Handle POST requests to this endpoint
export async function POST(req: NextRequest) {
  try {
    // Parse the request body to get the chat messages
    const body = await req.json();
    const messages = body.messages ?? [];
    const previousMessages = messages.slice(0, -1);
    const currentMessageContent = messages[messages.length - 1].content;

    // Initialize the OpenAI model with specific parameters
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo-1106",
      temperature: 0.4,
    });

    // Create a Supabase client
    const client = createClient();

    // Initialize a Supabase vector store for document retrieval
    const vectorstore = new SupabaseVectorStore(new OpenAIEmbeddings(), {
      client,
      tableName: "documents",
      queryName: "match_documents",
    });

    // Define a chain for rephrasing the user input
    const rephrasedInputChain = RunnableSequence.from([
      reprhasedInputTemplatePrompt,
      model,
      new StringOutputParser(),
    ]);

    // Promise to resolve with retrieved documents
    let resolveWithDocuments: (value: Document[]) => void;
    const documentPromise = new Promise<Document[]>((resolve) => {
      resolveWithDocuments = resolve;
    });

    // Create a retriever with a callback to handle retrieved documents
    const retriever = vectorstore.asRetriever({
      callbacks: [
        {
          handleRetrieverEnd(documents: Document<Record<string, any>>[]) {
            resolveWithDocuments(documents);
          },
        },
      ],
    });

    // Chain for combining retrieved document content
    const retrievalChain = retriever.pipe(combineDocumentContent);

    // Define a chain for generating the assistant's response
    const answerChain = RunnableSequence.from([
      {
        context: RunnableSequence.from([
          (input) => input.user_input,
          retrievalChain,
        ]),
        chat_history: (input) => input.chat_history,
        user_input: (input) => input.user_input,
      },
      answerTemplatePrompt,
      model,
    ]);

    // Define the main conversation chain
    const conversationChain = RunnableSequence.from([
      {
        user_input: rephrasedInputChain,
        chat_history: (input) => input.chat_history,
      },
      answerChain,
      new BytesOutputParser(),
    ]);

    // Stream the conversation chain response
    const stream = await conversationChain.stream({
      user_input: currentMessageContent,
      chat_history: formatMessages(previousMessages),
    });

    // Return the streamed response
    return new StreamingTextResponse(
      stream.pipeThrough(createStreamDataTransformer())
    );
  } catch (e: any) {
    // Handle any errors that occur
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
