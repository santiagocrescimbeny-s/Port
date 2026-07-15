export interface ContactMessages {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    is_read: boolean;
    received_at: Date;
}