import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { Application } from "@/types/application";

function normalizeApplicationDate(value: string | null | undefined) {
    if (!value) return null;

    const raw = value.trim();
    if (!raw) return null;

    if (/[Tt ]\d{2}:\d{2}/.test(raw)) {
        const parsed = new Date(raw);
        return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
    }

    const now = new Date();
    const [year, month, day] = raw.split("-").map(Number);
    const parsed = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

// PUT /api/applications/[id] – actualiza una postulación existente
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const numericId = parseInt(id);
        if (isNaN(numericId)) {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 });
        }

        const body = await request.json() as Omit<Application, "id" | "created_at">;

        if (!body.company?.trim() || !body.role?.trim() || !body.status) {
            return NextResponse.json({ error: "Empresa, puesto y estado son requeridos" }, { status: 400 });
        }

        const applicationDate = normalizeApplicationDate(body.application_date);

        const { rows } = await pool.query<Application>(
            `UPDATE applications SET
        company              = $1,
        role                 = $2,
        status               = $3,
        application_date     = $4,
        notes                = $5,
        application_viewed   = $6,
        contacted            = $7,
        channel              = $8,
        other_candidates     = $9,
        work_mode            = $10::work_mode_enum,
        cv_in_english        = $11,
        english_required     = $12,
        salary_min_company   = $13,
        salary_max_company   = $14,
        salary_expectation   = $15,
        technologies         = $16::text[],
        country              = $17,
        city                 = $18,
        technologies_nice    = $19::text[]
       WHERE id = $20
       RETURNING
        id, company, role, status, application_date::text, notes,
        created_at, application_viewed, contacted, channel,
        other_candidates, work_mode::text, cv_in_english, english_required,
        salary_min_company, salary_max_company, salary_expectation, technologies,
        country, city, COALESCE(technologies_nice, '{}'::text[]) as technologies_nice`,
            [
                body.company.trim(),
                body.role.trim(),
                body.status,
                applicationDate,
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
                numericId,
            ]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "Postulación no encontrada" }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (err) {
        console.error("[PUT /api/applications/:id]", err);
        return NextResponse.json({ error: "Error al actualizar postulación" }, { status: 500 });
    }
}
