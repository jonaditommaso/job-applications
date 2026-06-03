import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { Application } from "@/types/application";

// GET /api/applications – lista todas las postulaciones
export async function GET() {
    try {
        const { rows } = await pool.query<Application>(
            `SELECT
        id, company, role, status, application_date::text, notes,
        created_at, application_viewed, contacted, channel,
        other_candidates, work_mode::text, cv_in_english, english_required,
        salary_min_company, salary_max_company, salary_expectation, technologies,
        country, city, COALESCE(technologies_nice, '{}'::text[]) as technologies_nice
       FROM applications
       ORDER BY created_at DESC`
        );
        return NextResponse.json(rows);
    } catch (err) {
        console.error("[GET /api/applications]", err);
        return NextResponse.json({ error: "Error al obtener postulaciones" }, { status: 500 });
    }
}

// POST /api/applications – crea una nueva postulación
export async function POST(request: Request) {
    try {
        const body = await request.json() as Omit<Application, "id" | "created_at">;

        if (!body.company?.trim() || !body.role?.trim() || !body.status) {
            return NextResponse.json({ error: "Empresa, puesto y estado son requeridos" }, { status: 400 });
        }

        const { rows } = await pool.query<Application>(
            `INSERT INTO applications (
        company, role, status, application_date, notes,
        application_viewed, contacted, channel, other_candidates,
        work_mode, cv_in_english, english_required,
        salary_min_company, salary_max_company, salary_expectation, technologies,
        country, city, technologies_nice
       ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10::work_mode_enum, $11, $12,
        $13, $14, $15, $16::text[],
        $17, $18, $19::text[]
       ) RETURNING
        id, company, role, status, application_date::text, notes,
        created_at, application_viewed, contacted, channel,
        other_candidates, work_mode::text, cv_in_english, english_required,
        salary_min_company, salary_max_company, salary_expectation, technologies,
        country, city, COALESCE(technologies_nice, '{}'::text[]) as technologies_nice`,
            [
                body.company.trim(),
                body.role.trim(),
                body.status,
                body.application_date || null,
                body.notes || null,
                body.application_viewed ?? false,
                body.contacted ?? false,
                body.channel?.trim() || "",
                body.other_candidates ?? null,
                body.work_mode || null,
                body.cv_in_english ?? null,
                body.english_required ?? null,
                body.salary_min_company ?? null,
                body.salary_max_company ?? null,
                body.salary_expectation ?? null,
                body.technologies ?? [],
                body.country || null,
                body.city || null,
                body.technologies_nice ?? [],
            ]
        );

        return NextResponse.json(rows[0], { status: 201 });
    } catch (err) {
        console.error("[POST /api/applications]", err);
        return NextResponse.json({ error: "Error al crear postulación" }, { status: 500 });
    }
}
