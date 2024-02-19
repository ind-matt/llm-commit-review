import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { formatDocumentsAsString } from "langchain/util/document";
import { PromptTemplate } from "@langchain/core/prompts";
import {
    RunnableSequence,
    RunnablePassthrough,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ParentDocumentRetriever } from "langchain/retrievers/parent_document";
import { InMemoryStore } from "langchain/storage/in_memory";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";
import 'dotenv/config';

export async function runChain(filePaths) {
    const OPENAI_KEY = process.env.OPENAI_KEY;
    const model = new ChatOpenAI({
        modelName: "gpt-4",
        temperature: 0.9,
        openAIApiKey: OPENAI_KEY
    });
    let docs = await processFiles(filePaths);

    const vectorstore = new MemoryVectorStore(new OpenAIEmbeddings({
            modelName: "text-embedding-3-large",
            openAIApiKey: OPENAI_KEY
    }));
    const docstore = new InMemoryStore();
    const childDocumentRetriever = ScoreThresholdRetriever.fromVectorStore(
        vectorstore,
        {
            minSimilarityScore: 0.01,
            maxK: 100,
        }
    );
    const retriever = new ParentDocumentRetriever({
        vectorstore,
        docstore,
        childDocumentRetriever,
        childSplitter: new RecursiveCharacterTextSplitter({
            chunkOverlap: 0,
            chunkSize: 160,
        })});
    await retriever.addDocuments(docs);

    const prompt =
        PromptTemplate.fromTemplate(`Answer the question based only on the following context:
{context}

Question: {question}`);

    const chain = RunnableSequence.from([
        {
            context: retriever.pipe(formatDocumentsAsString),
            question: new RunnablePassthrough(),
        },
        prompt,
        model,
        new StringOutputParser(),
    ]);

    const result = await chain.invoke("From the included code files in my commit, can you provide line-by-line, any notable security issues? If you cannot see any, can you just say that no issues were detected? For example, 'Issue 1: (Code Example Here) / Vulnerability: Unsafe SQL query method' ");

    return result;
}

async function processFiles(filePaths) {
    let docs = [];
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 1,
    });

    // Process each file path provided
    for (const filePath of filePaths) {
        const loader = new TextLoader(filePath);
        const doc = await loader.loadAndSplit(splitter);
        docs.push(...doc);
    }
    return docs;
}

