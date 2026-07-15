import type { DataTypeMap } from "node:ffi";

export interface Projects{
    id:number;
    title:string;
    short_description:string;
    long_description:string;
    github_url:string;
    demo_url:string;
    image_url:string;
    feature:boolean;
    completion_dat:Date;
    ai_summary:string;
    challenges_faced:string;
    created_at:Date;
}