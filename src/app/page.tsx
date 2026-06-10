"use client";

import { useState, useEffect, useCallback } from "react";
// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewApplicationModal } from "@/components/new-application-modal";
import { ApplicationDetailDialog } from "@/components/application-detail-dialog";
import {
  Application,
  ApplicationStatus,
  STATUS_LABELS,
  WORK_MODE_LABELS,
} from "@/types/application";
import {
  Plus,
  Briefcase,
  Building2,
  Search,
  Eye,
  PhoneCall,
  Wifi,
  LayoutGrid,
  Globe,
  Flag,
  Users,
  MapPin,
  Pencil,
  Loader2,
} from "lucide-react";
import NewFlagDialog from "@/components/new-flag-dialog";
import { FlagEvent } from "@/types/flags";

// ── Status colour map ──────────────────────────────────────────────
const STATUS_STYLES: Record<ApplicationStatus, string> = {
  applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  interview: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  technical_test: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  offer: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  ghosted: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

const WORK_MODE_ICON: Record<string, React.ReactNode> = {
  remote: <Wifi size={12} />,
  hybrid: <LayoutGrid size={12} />,
  worldwide: <Globe size={12} />,
  eu_only: <Flag size={12} />,
};

const FLAG_TYPE_LABELS: Record<string, string> = {
  application_strategy: "Estrategia de aplicación",
  cv: "CV",
  profile: "Perfil",
  networking: "Networking",
  interview: "Entrevista",
};

const FLAG_TYPE_STYLES: Record<string, string> = {
  application_strategy: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200",
  cv: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200",
  profile: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
  networking: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  interview: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200",
};

const FLAG_SUBTYPE_LABELS: Record<string, Record<string, string>> = {
  application_strategy: {
    salary_change: "Expectativa salarial",
    target_country: "País objetivo",
    target_role: "Puesto objetivo",
    other: "Otro",
  },
  cv: {
    skills: "Habilidades",
    experience: "Experiencia",
    projects: "Proyectos",
    interests: "Intereses",
    languages: "Idiomas",
    format: "Formato",
    information: "Información",
    title: "Título",
  },
  profile: {
    linkedin_update: "Actualización de LinkedIn",
    github_update: "Actualización de GitHub",
    project_update: "Actualización de proyecto",
    portal_update: "Actualización de portal",
  },
  networking: {
    recruiter_contact: "Contacto con reclutador",
    other: "Otro",
  },
  interview: {
    interview_done: "Entrevista realizada",
    interview_feedback: "Feedback de entrevista",
  },
};

type Filter = ApplicationStatus | "all";

function CompanyAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const colors = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-orange-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${color}`}
    >
      {initials}
    </div>
  );
}

// function formatDate(d: string | null) {
//   if (!d) return null;
//   return new Date(d + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
// }

function parseSafeDate(value: string | null | undefined) {
  if (!value) return null;

  const raw = value.trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toDayKey(value: string | null | undefined) {
  const parsed = parseSafeDate(value);
  if (!parsed) return "sin-fecha";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateShort(d: string | null) {
  const parsed = parseSafeDate(d);
  if (!parsed) return "Sin fecha";

  return parsed.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

function getEventTimestamp(entry: { kind: "application" | "flag"; app?: Application; flag?: FlagEvent; createdAt: string }) {
  const raw = entry.kind === "application" ? entry.app?.application_date : entry.flag?.effective_date;
  const parsed = parseSafeDate(raw);

  return parsed ? parsed.getTime() : new Date(entry.createdAt).getTime();
}

function formatLocation(country: string | null, city: string | null) {
  if (city && country) return `${city}, ${country}`;
  return city ?? country ?? null;
}

export default function JobApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [flags, setFlags] = useState<FlagEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [companySearch, setCompanySearch] = useState("");
  const [viewingApp, setViewingApp] = useState<Application | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/applications");
      if (!res.ok) throw new Error("Error al cargar");
      const data: Application[] = await res.json();
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFlags = useCallback(async () => {
    try {
      const res = await fetch("/api/flags");
      if (!res.ok) throw new Error("Error al cargar flags");
      const data: FlagEvent[] = await res.json();
      setFlags(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchFlags(); }, [fetchFlags]);

  const counts: Record<Filter, number> = {
    all: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    interview: applications.filter((a) => a.status === "interview").length,
    technical_test: applications.filter((a) => a.status === "technical_test").length,
    offer: applications.filter((a) => a.status === "offer").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    ghosted: applications.filter((a) => a.status === "ghosted").length,
  };

  const filtered = applications
    .filter((a) => activeFilter === "all" || a.status === activeFilter)
    .filter((a) => !companySearch.trim() || a.company.toLowerCase().includes(companySearch.trim().toLowerCase()));

  async function handleAddApplication(data: Omit<Application, "id" | "created_at">) {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al crear");
      await fetchApplications();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddFlag(data: Omit<FlagEvent, "id" | "created_at">) {
    try {
      const res = await fetch("/api/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al crear");
      await fetchFlags();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpdateApplication(id: number, data: Omit<Application, "id" | "created_at">) {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      await fetchApplications();
    } catch (err) {
      console.error(err);
    }
  }

  function handleCloseModal() {
    setModalOpen(false);
    setEditingApp(null);
  }

  async function toggleFlag(app: Application, field: "application_viewed" | "contacted") {
    const { id, ...data } = app; // created_at
    await handleUpdateApplication(id, { ...data, [field]: !app[field] });
  }

  const stats = [
    { label: "Total", value: applications.length, color: "text-foreground" },
    { label: "Activas", value: counts.applied + counts.interview + counts.technical_test, color: "text-blue-600 dark:text-blue-400" },
    { label: "Ofertas", value: counts.offer, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Descartadas", value: counts.rejected + counts.ghosted, color: "text-red-500 dark:text-red-400" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* ── Header ── */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100">
              <Briefcase size={18} className="text-zinc-100 dark:text-zinc-900" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-none text-zinc-900 dark:text-zinc-50">
                Mis Postulaciones
              </h1>
              <p className="mt-0.5 text-xs text-zinc-500">Seguimiento de búsqueda laboral</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
              <Button onClick={() => setFlagModalOpen(true)} size="sm" className="gap-2" variant="outline">
              <Plus size={15} />
              Agregar flag
            </Button>
            <Button onClick={() => setModalOpen(true)} size="sm" className="gap-2">
              <Plus size={15} />
              Nueva postulación
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{s.label}</p>
              <p className={`mt-1 text-3xl font-bold tracking-tight ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Filter Tabs + Buscador ── */}
        <div className="flex items-center justify-between gap-4">
          <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as Filter)}>
            <TabsList className="h-9 gap-0.5 bg-zinc-100 dark:bg-zinc-800">
            {(["all", "applied", "interview", "technical_test", "offer", "rejected", "ghosted"] as Filter[]).map(
              (f) => (
                <TabsTrigger key={f} value={f} className="gap-1.5 px-3 text-xs capitalize">
                  {f === "all" ? "Todas" : STATUS_LABELS[f as ApplicationStatus]}
                  <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium leading-none text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                    {counts[f]}
                  </span>
                </TabsTrigger>
              )
            )}
            </TabsList>
          </Tabs>
          <div className="relative w-52">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Buscar empresa…"
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              className="h-9 pl-7 text-xs"
            />
          </div>
        </div>

        {/* ── Applications List ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-zinc-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white py-20 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <Building2 size={36} className="mb-3 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm font-medium text-zinc-500">Sin postulaciones aquí</p>
            <p className="mt-1 text-xs text-zinc-400">
              {activeFilter === "all"
                ? "Agregá tu primera postulación para comenzar."
                : `No hay postulaciones con estado "${STATUS_LABELS[activeFilter as ApplicationStatus]}".`}
            </p>
            {activeFilter === "all" && (
              <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => setModalOpen(true)}>
                <Plus size={13} /> Nueva postulación
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_0.8fr_1fr_auto] items-center border-b border-zinc-100 px-5 py-2.5 dark:border-zinc-800">
              {["Empresa / Puesto", "Estado", "Canal", "Modalidad", "Lugar", "Inglés", "Flags", ""].map((h, i) => (
                <span key={i} className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  {h}
                </span>
              ))}
            </div>

            {/* Rows agrupadas por fecha */}
            {(() => {
              const timelineEntries = [
                ...filtered.map((app) => ({
                  kind: "application" as const,
                  date: app.application_date ?? "",
                  createdAt: app.created_at,
                  app,
                })),
                ...flags.map((flag) => ({
                  kind: "flag" as const,
                  date: flag.effective_date ?? "",
                  createdAt: flag.created_at,
                  flag,
                })),
              ];

              const timelineByDate = timelineEntries.reduce<Record<string, typeof timelineEntries>>((acc, entry) => {
                const key = toDayKey(entry.date);
                if (!acc[key]) acc[key] = [];
                acc[key].push(entry);
                return acc;
              }, {});

              const sortedDates = Object.keys(timelineByDate).sort((a, b) => {
                if (a === "sin-fecha") return 1;
                if (b === "sin-fecha") return -1;
                return b.localeCompare(a);
              });

              return sortedDates.map((date) => {
                const items = [...(timelineByDate[date] ?? [])].sort((a, b) => {
                  const timeDiff = getEventTimestamp(b) - getEventTimestamp(a);
                  if (timeDiff !== 0) return timeDiff;
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });

                return (
                <div key={date || "sin-fecha"}>
                  <div className="flex items-center gap-3 border-b border-zinc-100 bg-zinc-50 px-5 py-1.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 capitalize">
                      {date !== "sin-fecha" ? formatDateShort(date) : "Sin fecha"}
                    </span>
                    <span className="text-[10px] text-zinc-300 dark:text-zinc-600">
                      ({items.length} {items.length === 1 ? "item" : "items"})
                    </span>
                  </div>

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {items.map((entry) => {
                      if (entry.kind === "flag") {
                        const typeLabel = FLAG_TYPE_LABELS[entry.flag.type] ?? entry.flag.type;
                        const subtypeLabel = entry.flag.type && entry.flag.subtype
                          ? FLAG_SUBTYPE_LABELS[entry.flag.type]?.[entry.flag.subtype] ?? entry.flag.subtype
                          : "Sin subtipo";
                        const tone = FLAG_TYPE_STYLES[entry.flag.type] ?? "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300";

                        return (
                          <div key={`flag-${entry.flag.id}-${date}`} className="px-4 py-3">
                            <article className={`rounded-xl border px-4 py-3 ${tone}`}>
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
                                  <Flag size={12} />
                                  {typeLabel}
                                  <span className="text-[10px] font-normal opacity-80">· {subtypeLabel}</span>
                                </div>
                                <span className="text-[10px] font-medium opacity-80">
                                  {date ? formatDateShort(date) : "Sin fecha"}
                                </span>
                              </div>

                              <div className="space-y-1 text-xs">
                                {entry.flag.description?.trim() && (
                                  <p className="leading-relaxed opacity-90">{entry.flag.description}</p>
                                )}
                                {entry.flag.hypothesis?.trim() && (
                                  <p className="text-[11px] opacity-80">Hipótesis: {entry.flag.hypothesis}</p>
                                )}
                              </div>
                            </article>
                          </div>
                        );
                      }

                      const app = entry.app;

                      return (
                        <div
                          key={`app-${app.id}-${date}`}
                          onClick={() => setViewingApp(app)}
                          className="cursor-pointer grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_0.8fr_1fr_auto] items-center gap-2 px-5 py-3.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <CompanyAvatar name={app.company} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{app.company}</p>
                              <p className="truncate text-xs text-zinc-500">{app.role}</p>
                              {(app.technologies.length > 0 || (app.technologies_nice?.length ?? 0) > 0) && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {app.technologies.map((t) => (
                                    <span key={`req-${t}`} className="inline-flex items-center rounded px-1.5 text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                      {t}
                                    </span>
                                  ))}
                                  {(app.technologies_nice ?? []).map((t) => (
                                    <span key={`nice-${t}`} className="inline-flex items-center rounded px-1.5 text-[10px] font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[app.status]}`}>
                              {STATUS_LABELS[app.status]}
                            </span>
                          </div>

                          <div>
                            <span className="text-xs text-zinc-600 dark:text-zinc-400">{app.channel || "—"}</span>
                          </div>

                          <div>
                            {app.work_mode ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                {WORK_MODE_ICON[app.work_mode]}
                                {WORK_MODE_LABELS[app.work_mode]}
                              </span>
                            ) : (
                              <span className="text-xs text-zinc-400">—</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 min-w-0">
                            {formatLocation(app.country, app.city) ? (
                              <>
                                <MapPin size={11} className="shrink-0 text-zinc-400" />
                                <span className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                                  {formatLocation(app.country, app.city)}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-zinc-400">—</span>
                            )}
                          </div>

                          <div className="flex flex-col gap-0.5">
                            {app.english_required && (
                              <span className="inline-flex w-fit items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                Requerido
                              </span>
                            )}
                            {app.cv_in_english && (
                              <span className="inline-flex w-fit items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                CV EN
                              </span>
                            )}
                            {!app.english_required && !app.cv_in_english && (
                              <span className="text-xs text-zinc-400">—</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              title="Vista por empresa"
                              onClick={(e) => { e.stopPropagation(); toggleFlag(app, "application_viewed"); }}
                              className={`cursor-pointer transition-colors hover:opacity-80 ${app.application_viewed ? "text-blue-500" : "text-zinc-300 dark:text-zinc-600"}`}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              title="Me contactaron"
                              onClick={(e) => { e.stopPropagation(); toggleFlag(app, "contacted"); }}
                              className={`cursor-pointer transition-colors hover:opacity-80 ${app.contacted ? "text-emerald-500" : "text-zinc-300 dark:text-zinc-600"}`}
                            >
                              <PhoneCall size={15} />
                            </button>
                            {app.other_candidates != null && (
                              <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                                <Users size={12} />
                                {app.other_candidates}
                              </span>
                            )}
                          </div>

                          <div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                              onClick={(e) => { e.stopPropagation(); setEditingApp(app); setModalOpen(true); }}
                            >
                              <Pencil size={13} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                );
              });
            })()}
          </div>
        )}

        {/* Pool de tecnologías eliminado: ahora se muestran por fila */}
      </main>

      <NewApplicationModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddApplication}
        onUpdate={handleUpdateApplication}
        initialData={editingApp ?? undefined}
      />
      <ApplicationDetailDialog
        app={viewingApp}
        open={viewingApp !== null}
        onClose={() => setViewingApp(null)}
      />

      <NewFlagDialog
        open={flagModalOpen}
        onClose={() => setFlagModalOpen(false)}
        onSubmit={handleAddFlag}
      />
    </div>
  );
}
