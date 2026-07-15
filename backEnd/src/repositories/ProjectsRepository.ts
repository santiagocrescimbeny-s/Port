
import { query } from "../dataBase/db.js";
import type { Projects } from "../models/Projects.js";


export class ProjectsRepository{

    async findAll(): Promise<Projects[]>{
        const sql= 'SELECT * FROM projects ORDER BY created_at DESC';
        const result= await query(sql);
        return result.rows;
    }
}