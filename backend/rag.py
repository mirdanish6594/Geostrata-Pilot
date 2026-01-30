import os
import json
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from supabase.client import create_client, Client
from langchain.prompts import PromptTemplate

load_dotenv()

# Setup Clients
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/text-embedding-004",
    google_api_key=os.environ.get("GOOGLE_API_KEY")
)
llm = ChatGroq(
    model="llama-3.3-70b-versatile", 
    temperature=0.3,
    api_key=os.environ.get("GROQ_API_KEY")
)

custom_prompt_template = """
You are 'Geostrata AI'. Answer the question based ONLY on the context below.

CITATION RULES (CRITICAL):
1. You have access to the [Title] and (URL) for every source.
2. When you use information, you MUST cite it using Markdown links.
3. Format: "According to [Article Title](URL)..." or at the end "Source: [Article Title](URL)".
4. Do not make up URLs. Use exactly what is provided in the Context.

Context:
{context}

Question: {question}

Answer:"""

PROMPT = PromptTemplate(
    template=custom_prompt_template, input_variables=["context", "question"]
)

def get_answer(query: str):
    try:
        # 1. Search
        query_vector = embeddings.embed_query(query)
        response = supabase.rpc(
            "match_documents",
            {"query_embedding": query_vector, "match_threshold": 0.5, "match_count": 5}
        ).execute()

        if not response.data:
            return {"result": "No information found."}

        # 2. Format Context WITH URLs
        # We explicitly extract metadata and pass it to the LLM string
        context_pieces = []
        for item in response.data:
            meta = item.get('metadata', {})
            title = meta.get('title', 'Unknown Source')
            url = meta.get('url', '#')
            text = item.get('content', '')
            context_pieces.append(f"Source: {title}\nLink: {url}\nContent: {text}\n---")

        context_text = "\n".join(context_pieces)

        # 3. Generate Answer
        final_prompt = PROMPT.format(context=context_text, question=query)
        ai_response = llm.invoke(final_prompt)

        return {"result": ai_response.content}

    except Exception as e:
        return {"result": f"Error: {str(e)}"}