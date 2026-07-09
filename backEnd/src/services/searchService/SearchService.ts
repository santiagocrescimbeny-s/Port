import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { Embeddings, type EmbeddingsParams } from "@langchain/core/embeddings";
import { createClient } from "@supabase/supabase-js";
import { env, AutoTokenizer, AutoModel, type Tensor } from '@xenova/transformers';

// Permitir descargas remotas
env.allowRemoteModels = true;
env.allowLocalModels = true;
env.localModelPath = './models/';
env.useFS = true;

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Clase de embeddings local
class TransformerEmbeddings extends Embeddings {
  private model: any;
  private tokenizer: any;
  private initialized = false;

  constructor(params?: EmbeddingsParams) {
    super(params ?? {});
  }

  async initialize() {
    if (this.initialized) return;
    console.log("🔄 Cargando modelo de embeddings...");
    this.tokenizer = await AutoTokenizer.from_pretrained('Xenova/all-MiniLM-L6-v2');
    this.model = await AutoModel.from_pretrained('Xenova/all-MiniLM-L6-v2');
    this.initialized = true;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    await this.initialize();
    const embeddings: number[][] = [];
    for (const text of texts) {
      if (text) embeddings.push(await this.embedQuery(text));
    }
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    await this.initialize();
    const inputs = this.tokenizer(text, { padding: true, truncation: true });
    const output = await this.model(inputs);
    const lastHiddenState = output.last_hidden_state as Tensor;
    const embeddingArray = Array.from(lastHiddenState.data as Float32Array);
    return embeddingArray.slice(0, 384) as number[];
  }
}

export class SearchService {
  static async searchKnowledge(query: string, limit: number = 5) {
    try {
      const embeddings = new TransformerEmbeddings();

      const vectorStore = await SupabaseVectorStore.fromExistingIndex(
        embeddings,
        {
          client: supabase,
          tableName: "mi_perfil",
          queryName: "buscar_perfil",
        }
      );

      const results = await vectorStore.similaritySearch(query, limit);
      
      return results.map((doc) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
      }));
    } catch (error) {
      console.error("❌ Error en búsqueda:", error);
      throw error;
    }
  }
}