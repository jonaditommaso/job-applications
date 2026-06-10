import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { FlagEvent } from "@/types/flags";

function normalizeEffectiveDateTime(value: string | null | undefined) {
  if (!value) return null;

  const raw = value.trim();

  if (/[Tt ]\d{2}:\d{2}/.test(raw)) {
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  const now = new Date();
  const [year, month, day] = raw.split("-").map(Number);
  const parsed = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export async function GET() {
  try {
    const { rows } = await pool.query<FlagEvent>(`
      SELECT
        id,
        type,
        subtype,
        description,
        hypothesis,
        effective_date::text,
        created_at
      FROM flags
      ORDER BY effective_date ASC, created_at DESC
    `);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/flags]", err);
    return NextResponse.json({ error: "Error al obtener flags" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Omit<FlagEvent, "id" | "created_at">;

    if (!body.type?.trim()) {
      return NextResponse.json({ error: "El tipo es requerido" }, { status: 400 });
    }

    const effectiveDate = normalizeEffectiveDateTime(body.effective_date);

    const { rows } = await pool.query<FlagEvent>(`
      INSERT INTO flags (type, subtype, description, hypothesis, effective_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        type,
        subtype,
        description,
        hypothesis,
        effective_date::text,
        created_at
    `, [
      body.type.trim(),
      body.subtype?.trim() ?? "",
      body.description?.trim() ?? "",
      body.hypothesis?.trim() ?? "",
      effectiveDate,
    ]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error("[POST /api/flags]", err);
    return NextResponse.json({ error: "Error al crear flag" }, { status: 500 });
  }
}
