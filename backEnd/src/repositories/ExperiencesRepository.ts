import pool from '../dataBase/db.js';

export interface ExperienceInput {
  companyInstitution: string;
  roleTitle: string;
  description: string;
  achievements: string[];
  startDate: string;
  endDate?: string | null;
  isEducation: boolean;
  locationId: number;
}

export interface Experience {
  id: number;
  company_institution: string;
  role_title: string;
  description: string;
  achievements: string[];
  start_date: Date;
  end_date: Date | null;
  is_education: boolean;
  location_id: number;
  city?: string;
  country?: string;
  remote_friendly?: boolean;
  created_at: Date;
}

export class ExperiencesRepository {

  // 1. Obtener todas las experiencias con su respectiva ubicación (JOIN)
  static async getAll(): Promise<Experience[]> {
    const queryText = `
      SELECT 
        e.id,
        e.company_institution,
        e.role_title,
        e.description,
        e.achievements,
        e.start_date,
        e.end_date,
        e.is_education,
        e.location_id,
        e.created_at,
        l.city,
        l.country,
        l.remote_friendly
      FROM experiences e
      LEFT JOIN locations l ON e.location_id = l.id
      ORDER BY e.start_date DESC
    `;
    const { rows } = await pool.query(queryText);
    return rows;
  }

  // 2. Obtener una experiencia por ID
  static async getById(id: number): Promise<Experience | null> {
    const queryText = `
      SELECT 
        e.id,
        e.company_institution,
        e.role_title,
        e.description,
        e.achievements,
        e.start_date,
        e.end_date,
        e.is_education,
        e.location_id,
        e.created_at,
        l.city,
        l.country,
        l.remote_friendly
      FROM experiences e
      LEFT JOIN locations l ON e.location_id = l.id
      WHERE e.id = $1
    `;
    const { rows } = await pool.query(queryText, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // 3. Crear experiencia laboral o académica
  static async create(data: ExperienceInput): Promise<Experience> {
    const queryText = `
      INSERT INTO experiences (
        company_institution, role_title, description, achievements, 
        start_date, end_date, is_education, location_id, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id, company_institution, role_title, description, achievements, start_date, end_date, is_education, location_id, created_at
    `;
    const values = [
      data.companyInstitution,
      data.roleTitle,
      data.description,
      data.achievements, // Postgres mapea automáticamente un array de TS a un array de PG
      data.startDate,
      data.endDate || null,
      data.isEducation,
      data.locationId
    ];
    const { rows } = await pool.query(queryText, values);
    return rows[0];
  }

  // 4. Actualizar experiencia
  static async update(id: number, data: Partial<ExperienceInput>): Promise<Experience | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let queryIndex = 1;

    if (data.companyInstitution !== undefined) {
      fields.push(`company_institution = $${queryIndex++}`);
      values.push(data.companyInstitution);
    }
    if (data.roleTitle !== undefined) {
      fields.push(`role_title = $${queryIndex++}`);
      values.push(data.roleTitle);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${queryIndex++}`);
      values.push(data.description);
    }
    if (data.achievements !== undefined) {
      fields.push(`achievements = $${queryIndex++}`);
      values.push(data.achievements);
    }
    if (data.startDate !== undefined) {
      fields.push(`start_date = $${queryIndex++}`);
      values.push(data.startDate);
    }
    if (data.endDate !== undefined) {
      fields.push(`end_date = $${queryIndex++}`);
      values.push(data.endDate);
    }
    if (data.isEducation !== undefined) {
      fields.push(`is_education = $${queryIndex++}`);
      values.push(data.isEducation);
    }
    if (data.locationId !== undefined) {
      fields.push(`location_id = $${queryIndex++}`);
      values.push(data.locationId);
    }

    if (fields.length === 0) return null;

    const queryText = `
      UPDATE experiences
      SET ${fields.join(', ')}
      WHERE id = $${queryIndex}
      RETURNING id, company_institution, role_title, description, achievements, start_date, end_date, is_education, location_id, created_at
    `;
    values.push(id);

    const { rows } = await pool.query(queryText, values);
    return rows.length > 0 ? rows[0] : null;
  }

  // 5. Eliminar experiencia
  static async delete(id: number): Promise<boolean> {
    const queryText = `
      DELETE FROM experiences WHERE id = $1
    `;
    const result = await pool.query(queryText, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}