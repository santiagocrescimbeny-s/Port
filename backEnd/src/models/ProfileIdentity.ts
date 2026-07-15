export interface profileIdentity {
    id: number;
    first_name: string;
    last_name: string;
    bio_sumary: string;
    cv_url: string;
    email: string;
    location_id: number | null;
    github_profile: string;
    linkedin_profile: string;
    update_at: Date;
}