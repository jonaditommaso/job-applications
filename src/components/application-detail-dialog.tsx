"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Application } from "@/types/application";
import { STATUS_LABELS, WORK_MODE_LABELS } from "@/types/application";
import { MapPin, Calendar, Users, Eye, PhoneCall } from "lucide-react";

interface Props {
  app: Application | null;
  open: boolean;
  onClose: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  interview: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  technical_test: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  offer: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  ghosted: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

function fmtDate(d: string | null) {
  if (!d) return null;
  return new Date(d + "T12:00:00").toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtMoney(n: number | null) {
  if (n == null) return null;
  return n.toLocaleString("es-ES") + " €";
}

export function ApplicationDetailDialog({ app, open, onClose }: Props) {
  if (!app) return null;

  const location = [app.city, app.country].filter(Boolean).join(", ");
  const niceTeches = app.technologies_nice ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-start justify-between gap-4 pr-6">
            <div>
              <DialogTitle className="text-lg font-bold leading-tight">{app.company}</DialogTitle>
              <p className="mt-0.5 text-sm text-zinc-500">{app.role}</p>
            </div>
            <span
              className={`mt-0.5 inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[app.status]}`}
            >
              {STATUS_LABELS[app.status]}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-5 text-sm">

          {/* Meta */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-zinc-500">
            {app.application_date && (
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                <span className="capitalize">{fmtDate(app.application_date)}</span>
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={12} />
                {location}
              </span>
            )}
            {app.channel && (
              <span>
                Canal:{" "}
                <strong className="text-zinc-700 dark:text-zinc-300">{app.channel}</strong>
              </span>
            )}
            {app.work_mode && (
              <span>
                Modalidad:{" "}
                <strong className="text-zinc-700 dark:text-zinc-300">
                  {WORK_MODE_LABELS[app.work_mode]}
                </strong>
              </span>
            )}
          </div>

          {/* Inglés */}
          {(app.english_required || app.cv_in_english) && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500">Inglés:</span>
              {app.english_required && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Requerido
                </span>
              )}
              {app.cv_in_english && (
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  CV en inglés
                </span>
              )}
            </div>
          )}

          {/* Salarios */}
          {(app.salary_min_company || app.salary_max_company || app.salary_expectation) && (
            <div className="flex flex-wrap gap-5">
              {(app.salary_min_company || app.salary_max_company) && (
                <div>
                  <p className="mb-0.5 text-[11px] text-zinc-400">Rango empresa</p>
                  <p className="font-medium text-zinc-700 dark:text-zinc-300">
                    {fmtMoney(app.salary_min_company)} – {fmtMoney(app.salary_max_company)}
                  </p>
                </div>
              )}
              {app.salary_expectation && (
                <div>
                  <p className="mb-0.5 text-[11px] text-zinc-400">Mi expectativa</p>
                  <p className="font-medium text-zinc-700 dark:text-zinc-300">
                    {fmtMoney(app.salary_expectation)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tecnologías requeridas */}
          {app.technologies.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-zinc-500">Tecnologías</p>
              <div className="flex flex-wrap gap-1.5">
                {app.technologies.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tecnologías valorables */}
          {niceTeches.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-zinc-500">Tecnologías valorables</p>
              <div className="flex flex-wrap gap-1.5">
                {niceTeches.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Candidatos + flags */}
          {(app.other_candidates != null || app.application_viewed || app.contacted) && (
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
              {app.other_candidates != null && (
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {app.other_candidates} candidatos
                </span>
              )}
              {app.application_viewed && (
                <span className="flex items-center gap-1 text-blue-500">
                  <Eye size={12} />
                  Vista por la empresa
                </span>
              )}
              {app.contacted && (
                <span className="flex items-center gap-1 text-emerald-500">
                  <PhoneCall size={12} />
                  Me contactaron
                </span>
              )}
            </div>
          )}

          {/* Notas */}
          {app.notes && (
            <div>
              <p className="mb-1 text-xs font-medium text-zinc-500">Notas</p>
              <p className="whitespace-pre-wrap rounded-lg bg-zinc-50 px-3 py-2.5 text-sm leading-relaxed text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300">
                {app.notes}
              </p>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
