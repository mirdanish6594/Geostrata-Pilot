import os
import time
from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from supabase.client import create_client
from langchain.docstore.document import Document

load_dotenv()

# Setup
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/text-embedding-004",
    google_api_key=os.environ.get("GOOGLE_API_KEY")
)

def parse_data_file(filepath):
    """Custom parser to extract Title and URL from your text file."""
    with open(filepath, "r", encoding="utf-8") as f:
        raw_text = f.read()
    
    # Split by your separator line
    raw_articles = raw_text.split("--------------------------------------------------")
    documents = []

    for art in raw_articles:
        if not art.strip(): continue # Skip empty lines
        
        lines = art.strip().split("\n")
        metadata = {"source": "The Geostrata"}
        content_lines = []
        
        # Extract headers (Title, URL, Date)
        for line in lines:
            if line.startswith("Title:"):
                metadata["title"] = line.replace("Title:", "").strip()
            elif line.startswith("URL:"):
                metadata["url"] = line.replace("URL:", "").strip()
            elif line.startswith("Date:"):
                metadata["date"] = line.replace("Date:", "").strip()
            else:
                content_lines.append(line)
        
        # Rejoin the body text
        full_content = "\n".join(content_lines)
        
        # Create a Document object with the metadata attached
        documents.append(Document(page_content=full_content, metadata=metadata))
    
    return documents

def ingest_data():
    print("1. Parsing data with URLs...")
    documents = parse_data_file("data.txt")
    print(f"   Found {len(documents)} articles.")

    print("2. Splitting text...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = text_splitter.split_documents(documents)
    print(f"   Generated {len(docs)} searchable chunks.")

    print("3. Uploading to Supabase (Batching)...")
    batch_size = 5
    for i in range(0, len(docs), batch_size):
        batch = docs[i : i + batch_size]
        print(f"   Uploading batch {i//batch_size + 1}...")
        try:
            SupabaseVectorStore.from_documents(
                batch,
                embeddings,
                client=supabase,
                table_name="documents",
                query_name="match_documents",
            )
            time.sleep(3) # Respect API limits
        except Exception as e:
            print(f"   Error: {e}")
            time.sleep(10)

    print("Ingestion Complete!")

if __name__ == "__main__":
    ingest_data()