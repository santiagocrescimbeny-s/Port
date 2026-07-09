import OpenAI from 'openai';
export declare class AiService {
    static askGeminiStream(userPrompt: string): Promise<AsyncGenerator<import("@google/genai").GenerateContentResponse, any, any>>;
    static askOpenAIStream(userPrompt: string): Promise<import("openai/core/streaming.mjs").Stream<OpenAI.Chat.Completions.ChatCompletionChunk> & {
        _request_id?: string | null;
    }>;
}
//# sourceMappingURL=IAService.d.ts.map