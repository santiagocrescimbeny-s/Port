
export interface Document {
    id: number;
    text: string;
    metadata: Record<string, any>;
    embedding: number[];
}
