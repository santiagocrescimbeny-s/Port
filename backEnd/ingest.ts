import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { DirectoryLoader } from "@langchain/classic/document_loaders/fs/directory";

const privateKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const url = process.env.SUPABASE_URL;
const supabase = createClient(url!, privateKey!);

async function run() {
  // 1. Carga toda la carpeta de una vez
  const loader = new DirectoryLoader("src/markdown", {
    // Le decimos: "Por cada archivo que termine en .md, usa TextLoader"
    ".md": (path) => new TextLoader(path),
  });

  const docs = await loader.load();

  console.log(`Se cargaron ${docs.length} documentos.`);

  // 2. Guardamos todo en la misma tabla de Supabase
  await SupabaseVectorStore.fromDocuments(docs, new OpenAIEmbeddings(), {
    client: supabase,
    tableName: "mi_perfil",
    queryName: "buscar_perfil",
  });

  console.log("¡Todo el conocimiento ha sido indexado!");
}
run();



