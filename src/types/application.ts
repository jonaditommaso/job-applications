export type WorkMode = "remote" | "hybrid" | "worldwide" | "eu_only";

export type ApplicationStatus =
    | "applied"
    | "interview"
    | "technical_test"
    | "offer"
    | "rejected"
    | "ghosted";

export interface Application {
    id: number;
    company: string;
    role: string;
    status: ApplicationStatus;
    application_date: string | null;
    notes: string | null;
    created_at: string;
    application_viewed: boolean;
    contacted: boolean;
    channel: string;
    other_candidates: number | null;
    work_mode: WorkMode | null;
    cv_in_english: boolean | null;
    english_required: boolean | null;
    salary_min_company: number | null;
    salary_max_company: number | null;
    salary_expectation: number | null;
    technologies: string[];
    technologies_nice: string[];
    country: string | null;
    city: string | null;
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
    applied: "Postulado",
    interview: "Entrevista",
    technical_test: "Prueba técnica",
    offer: "Oferta",
    rejected: "Rechazado",
    ghosted: "Ghosteado",
};

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
    remote: "Remoto",
    hybrid: "Híbrido",
    worldwide: "Mundial",
    eu_only: "Solo UE",
};
