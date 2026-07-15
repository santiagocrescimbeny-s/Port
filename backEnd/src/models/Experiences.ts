export interface Experiences {
    id: number;
    company_institution: string;
    role_title: string;
    description: string;
    archivements: string;
    start_date: Date;
    end_date: Date;
    location_id: number | null;
    created_at: Date;
}