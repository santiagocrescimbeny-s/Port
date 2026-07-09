import { createClient } from "@supabase/supabase-js";
import { Embeddings, type EmbeddingsParams } from "@langchain/core/embeddings";
import { env, AutoTokenizer, AutoModel, type Tensor } from '@xenova/transformers';

env.allowRemoteModels = true;
env.allowLocalModels = true;
env.localModelPath = './models/';
env.useFS = true;

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

class TransformerEmbeddings extends Embeddings {
  private static instance: TransformerEmbeddings;
  private model: any;
  private tokenizer: any;
  private initialized = false;

  constructor(params?: EmbeddingsParams) {
    super(params ?? {});
  }

  static getInstance(): TransformerEmbeddings {
    if (!TransformerEmbeddings.instance) {
      TransformerEmbeddings.instance = new TransformerEmbeddings();
    }
    return TransformerEmbeddings.instance;
  }

  async initialize() {
    if (this.initialized) {
      console.log("✅ Modelo ya cargado en memoria");
      return;
    }
    
    console.log("🔄 Cargando modelo de embeddings (primera vez)...");
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
    const embeddings: number[][] = [];
    for (const text of texts) {
      if (text) embeddings.push(await this.embedQuery(text));
    }
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    await this.initialize();
    
    try {
      const inputs = this.tokenizer(text, { padding: true, truncation: true });
      const output = await this.model(inputs);
      const lastHiddenState = output.last_hidden_state as Tensor;
      const embeddingArray = Array.from(lastHiddenState.data as Float32Array);
      return embeddingArray.slice(0, 384) as number[];
    } catch (error) {
      console.error("❌ Error generando embedding:", error);
      throw error;
    }
  }
}

export class SearchService {
  static async searchKnowledge(query: string, limit: number = 5) {
    try {
      console.log(`🔍 Buscando: "${query}"`);
      
      // Usar la instancia global del modelo
      const embeddings = TransformerEmbeddings.getInstance();
      
      // Generar embedding de la consulta
      console.log("⏳ Generando embedding...");
      const queryEmbedding = await embeddings.embedQuery(query);

      // Consulta RPC a Supabase
      console.log("📊 Consultando base de datos...");
      const { data, error } = await supabase.rpc('buscar_perfil', {
        query_embedding: queryEmbedding,
        match_threshold: 0.0,
        match_count: limit,
      });

      if (error) {
        console.error("❌ Error RPC:", error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} resultados encontrados`);
      
      return (data || []).map((doc: any) => ({
        content: doc.content,
        metadata: doc.metadata,
        similarity: doc.similarity,
      }));
    } catch (error) {
      console.error("❌ Error en búsqueda:", error);
      throw error;
    }
  }

  // Precargar el modelo al iniciar el servidor
  static async preloadModel() {
    try {
      console.log("🚀 Precargando modelo de embeddings...");
      const embeddings = TransformerEmbeddings.getInstance();
      await embeddings.initialize();
      console.log("✅ Modelo precargado y listo");
    } catch (error) {
      console.error("❌ Error precargando modelo:", error);
    }
  }
}