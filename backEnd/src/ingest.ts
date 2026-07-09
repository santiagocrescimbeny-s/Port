import 'dotenv/config';
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { Embeddings, type EmbeddingsParams } from "@langchain/core/embeddings";
import { createClient } from "@supabase/supabase-js";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { DirectoryLoader } from "@langchain/classic/document_loaders/fs/directory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { env, AutoTokenizer, AutoModel, type Tensor } from '@xenova/transformers';

// Permitir descargas remotas y uso local
env.allowRemoteModels = true;
env.allowLocalModels = true;
env.localModelPath = './models/';
env.useFS = true;

const privateKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const url = process.env.SUPABASE_URL;

if (!url || !privateKey) {
  throw new Error("Faltan las variables de entorno de Supabase");
}

const supabase = createClient(url, privateKey);

// Crear clase de embeddings con Transformers.js
class TransformerEmbeddings extends Embeddings {
  private model: any;
  private tokenizer: any;
  private initialized = false;

  constructor(params?: EmbeddingsParams) {
    super(params ?? {});
  }

  async initialize() {
    if (this.initialized) return;
    
    console.log("🔄 Inicializando modelo de embeddings...");
    try {
      this.tokenizer = await AutoTokenizer.from_pretrained('Xenova/all-MiniLM-L6-v2');
      this.model = await AutoModel.from_pretrained('Xenova/all-MiniLM-L6-v2');
      this.initialized = true;
      console.log("✅ Modelo cargado correctamente");
    } catch (error) {
      console.error("❌ Error al cargar modelo:", error);
      throw error;
    }
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    await this.initialize();
    console.log(`📊 Generando embeddings para ${texts.length} documentos...`);
    
    const embeddings: number[][] = [];
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      if (!text) continue;
      
      const embedding = await this.embedQuery(text);
      embeddings.push(embedding);
      if ((i + 1) % 5 === 0) {
        console.log(`  ✓ ${i + 1}/${texts.length} completado`);
      }
    }
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    await this.initialize();
    
    try {
      // Tokenizar el texto
      const inputs = this.tokenizer(text, {
        padding: true,
        truncation: true,
      });

      // Generar embeddings
      const output = await this.model(inputs);
      const lastHiddenState = output.last_hidden_state as Tensor;

      // Convertir a array
      const embeddingArray = Array.from(lastHiddenState.data as Float32Array);
      
      // all-MiniLM-L6-v2 genera 384 dimensiones
      return embeddingArray.slice(0, 384) as number[];
    } catch (error) {
      console.error("❌ Error generando embedding:", error);
      throw error;
    }
  }
}

async function run() {
  try {
    console.log("🚀 Iniciando proceso de indexación...\n");

    const loader = new DirectoryLoader("src/markdown", {
      ".md": (path) => new TextLoader(path),
    });

    const docs = await loader.load();
    console.log(`📄 Documentos cargados: ${docs.length}\n`);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await splitter.splitDocuments(docs);
    console.log(`✂️ Fragmentos creados: ${splitDocs.length}\n`);

    // Limpiar tabla
    await supabase.from("mi_perfil").delete().neq("id", 0);
    console.log("🗑️ Tabla limpiada\n");

    // Crear embeddings locales
    const embeddings = new TransformerEmbeddings();

    // Probar que funciona
    console.log("🧪 Probando embeddings...");
    const testEmbedding = await embeddings.embedQuery("test");
    console.log(`✅ Embeddings funcionando. Dimensiones: ${testEmbedding.length}\n`);

    // Indexar documentos
    console.log(`📊 Indexando ${splitDocs.length} fragmentos...\n`);

    await SupabaseVectorStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        client: supabase,
        tableName: "mi_perfil",
        queryName: "buscar_perfil",
      }
    );

    console.log("\n✅ ¡Todo el conocimiento ha sido indexado con éxito!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

run();