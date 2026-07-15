export interface AiSearchLogs {
    id: number;
    session_id: number | null;
    query_text: string;
    detected_intent: string;
    tokens_used: number;
    created_at: Date;
}