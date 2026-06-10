"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Application, ApplicationStatus, WorkMode } from "@/types/application";
import { STATUS_LABELS, WORK_MODE_LABELS } from "@/types/application";

interface NewApplicationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Application, "id" | "created_at">) => void;
  onUpdate?: (id: number, data: Omit<Application, "id" | "created_at">) => void;
  initialData?: Application;
}

function buildApplicationDateTime(value: string | null | undefined) {
  const raw = value?.trim();

  if (!raw) {
    return new Date().toISOString();
  }

  if (/[Tt ]\d{2}:\d{2}/.test(raw)) {
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }

  const now = new Date();
  const [year, month, day] = raw.split("-").map(Number);
  const parsed = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

  return parsed.toISOString();
}

function getDefaultForm(initial?: Application) {
  if (initial) {
    return {
      company: initial.company,
      role: initial.role,
      status: initial.status,
      application_date: initial.application_date ?? "",
      notes: initial.notes ?? "",
      application_viewed: initial.application_viewed,
      contacted: initial.contacted,
      channel: initial.channel,
      other_candidates: initial.other_candidates != null ? String(initial.other_candidates) : "",
      work_mode: (initial.work_mode ?? "remote") as WorkMode | "",
      cv_in_english: initial.cv_in_english ?? false,
      english_required: initial.english_required ?? false,
      salary_min_company: initial.salary_min_company != null ? String(initial.salary_min_company) : "",
      salary_max_company: initial.salary_max_company != null ? String(initial.salary_max_company) : "",
      salary_expectation: initial.salary_expectation != null ? String(initial.salary_expectation) : "",
      tech_input: "",
      technologies: [...initial.technologies],
      tech_nice_input: "",
      technologies_nice: [...(initial.technologies_nice ?? [])],
      country: initial.country ?? "España",
      city: initial.city ?? "",
    };
  }
  return {
    company: "",
    role: "",
    status: "applied" as ApplicationStatus,
    application_date: new Date().toISOString().split("T")[0],
    notes: "",
    application_viewed: false,
    contacted: false,
    channel: "",
    other_candidates: "",
    work_mode: "remote" as WorkMode | "",
    cv_in_english: false,
    english_required: false,
    salary_min_company: "",
    salary_max_company: "",
    salary_expectation: "",
    tech_input: "",
    technologies: [] as string[],
    tech_nice_input: "",
    technologies_nice: [] as string[],
    country: "España",
    city: "",
  };
}

export function NewApplicationModal({ open, onClose, onSubmit, onUpdate, initialData }: NewApplicationModalProps) {
  const [form, setForm] = useState(getDefaultForm);

  // Resetea el formulario cada vez que el modal se abre
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setForm(getDefaultForm(initialData));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleClose() {
    setForm(getDefaultForm());
    onClose();
  }

  function handleAddTech(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && form.tech_input.trim()) {
      e.preventDefault();
      const tech = form.tech_input.trim().replace(/,$/, "");
      if (tech && !form.technologies.includes(tech)) {
        setForm((f) => ({ ...f, technologies: [...f.technologies, tech], tech_input: "" }));
      }
    }
  }

  function removeTech(tech: string) {
    setForm((f) => ({ ...f, technologies: f.technologies.filter((t) => t !== tech) }));
  }

  function handleAddNiceTech(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && form.tech_nice_input.trim()) {
      e.preventDefault();
      const tech = form.tech_nice_input.trim().replace(/,$/, "");
      if (tech && !form.technologies_nice.includes(tech)) {
        setForm((f) => ({ ...f, technologies_nice: [...f.technologies_nice, tech], tech_nice_input: "" }));
      }
    }
  }

  function removeNiceTech(tech: string) {
    setForm((f) => ({ ...f, technologies_nice: f.technologies_nice.filter((t) => t !== tech) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) return;
    const data: Omit<Application, "id" | "created_at"> = {
      company: form.company.trim(),
      role: form.role.trim(),
      status: form.status,
      application_date: buildApplicationDateTime(form.application_date),
      notes: form.notes || null,
      application_viewed: form.application_viewed,
      contacted: form.contacted,
      channel: form.channel.trim(),
      other_candidates: form.other_candidates ? parseInt(form.other_candidates) : null,
      work_mode: (form.work_mode as WorkMode) || null,
      cv_in_english: form.cv_in_english,
      english_required: form.english_required,
      salary_min_company: form.salary_min_company ? parseInt(form.salary_min_company) : null,
      salary_max_company: form.salary_max_company ? parseInt(form.salary_max_company) : null,
      salary_expectation: form.salary_expectation ? parseInt(form.salary_expectation) : null,
      technologies: form.technologies,
      technologies_nice: form.technologies_nice,
      country: form.country.trim() || null,
      city: form.city.trim() || null,
    };
    if (initialData && onUpdate) {
      onUpdate(initialData.id, data);
    } else {
      onSubmit(data);
    }
    handleClose();
  }

  const f = form;
  const set = (patch: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...patch }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-base font-semibold">
            {initialData ? "Editar postulación" : "Nueva postulación"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Fila 1: Empresa + Puesto */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="company" className="text-xs">
                Empresa <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company"
                placeholder="ej. Stripe"
                className="h-8 text-sm"
                value={f.company}
                onChange={(e) => set({ company: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="role" className="text-xs">
                Puesto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="role"
                placeholder="ej. Frontend Engineer"
                className="h-8 text-sm"
                value={f.role}
                onChange={(e) => set({ role: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Fila 2: País + Ciudad */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="country" className="text-xs">País</Label>
              <Input
                id="country"
                placeholder="ej. España"
                className="h-8 text-sm"
                value={f.country}
                onChange={(e) => set({ country: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="city" className="text-xs">Ciudad</Label>
              <Input
                id="city"
                placeholder="ej. Madrid"
                className="h-8 text-sm"
                value={f.city}
                onChange={(e) => set({ city: e.target.value })}
              />
            </div>
          </div>

          {/* Fila 3: Estado + Fecha + Modalidad */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Estado</Label>
              <Select value={f.status} onValueChange={(v) => set({ status: v as ApplicationStatus })}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue>{STATUS_LABELS[f.status]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Postulado</SelectItem>
                  <SelectItem value="interview">Entrevista</SelectItem>
                  <SelectItem value="technical_test">Prueba técnica</SelectItem>
                  <SelectItem value="offer">Oferta</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                  <SelectItem value="ghosted">Ghosteado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="application_date" className="text-xs">Fecha</Label>
              <Input
                id="application_date"
                type="date"
                className="h-8 text-sm"
                value={f.application_date}
                onChange={(e) => set({ application_date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Modalidad</Label>
              <Select value={f.work_mode} onValueChange={(v) => set({ work_mode: v as WorkMode })}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="—">
                    {f.work_mode ? WORK_MODE_LABELS[f.work_mode as WorkMode] : "—"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remoto</SelectItem>
                  <SelectItem value="hybrid">Híbrido</SelectItem>
                  <SelectItem value="worldwide">Mundial</SelectItem>
                  <SelectItem value="eu_only">Solo UE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fila 4: Salarios */}
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label htmlFor="salary_min" className="text-xs">Salario mín.</Label>
              <Input
                id="salary_min"
                type="number"
                placeholder="80000"
                className="h-8 text-sm"
                value={f.salary_min_company}
                onChange={(e) => set({ salary_min_company: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="salary_max" className="text-xs">Salario máx.</Label>
              <Input
                id="salary_max"
                type="number"
                placeholder="120000"
                className="h-8 text-sm"
                value={f.salary_max_company}
                onChange={(e) => set({ salary_max_company: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="salary_exp" className="text-xs">Mi expectativa</Label>
              <Input
                id="salary_exp"
                type="number"
                placeholder="100000"
                className="h-8 text-sm"
                value={f.salary_expectation}
                onChange={(e) => set({ salary_expectation: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="other_candidates" className="text-xs">Otros candidatos</Label>
              <Input
                id="other_candidates"
                type="number"
                placeholder="ej. 10"
                className="h-8 text-sm"
                value={f.other_candidates}
                onChange={(e) => set({ other_candidates: e.target.value })}
              />
            </div>
          </div>

          {/* Fila 5: Tecnologías requeridas */}
          <div className="space-y-1">
            <Label className="text-xs">Tecnologías</Label>
            <div className="flex flex-wrap gap-1.5 min-h-8 items-center rounded-md border border-input bg-transparent px-3 py-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1">
              {f.technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 text-xs font-normal">
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTech(tech)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X size={10} />
                  </button>
                </Badge>
              ))}
              <input
                placeholder={f.technologies.length === 0 ? "Escribe y presiona Enter..." : "Agregar..."}
                value={f.tech_input}
                onChange={(e) => set({ tech_input: e.target.value })}
                onKeyDown={handleAddTech}
                className="flex-1 min-w-24 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Fila 5b: Tecnologías valorables */}
          <div className="space-y-1">
            <Label className="text-xs">Tecnologías valorables</Label>
            <div className="flex flex-wrap gap-1.5 min-h-8 items-center rounded-md border border-input bg-transparent px-3 py-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1">
              {f.technologies_nice.map((tech) => (
                <Badge key={tech} variant="outline" className="gap-1 pl-2 pr-1 py-0.5 text-xs font-normal">
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeNiceTech(tech)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X size={10} />
                  </button>
                </Badge>
              ))}
              <input
                placeholder={f.technologies_nice.length === 0 ? "Escribe y presiona Enter..." : "Agregar..."}
                value={f.tech_nice_input}
                onChange={(e) => set({ tech_nice_input: e.target.value })}
                onKeyDown={handleAddNiceTech}
                className="flex-1 min-w-24 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Fila 6: Canal + checkboxes */}
          <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
            {/* Canal */}
            <div className="space-y-1.5">
              <Label htmlFor="channel" className="text-xs">Canal</Label>
              <Input
                id="channel"
                placeholder="ej. LinkedIn, portal web..."
                className="h-8 text-sm"
                value={f.channel}
                onChange={(e) => set({ channel: e.target.value })}
              />
              <div className="flex gap-1.5">
                {[
                  { label: "LinkedIn", color: "#0A66C2" },
                  { label: "Indeed",   color: "#003A9B" },
                  { label: "InfoJobs", color: "#F07400" },
                ].map(({ label, color }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => set({ channel: label })}
                    className="rounded px-2 py-0.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-80"
                    style={{ backgroundColor: color }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkboxes: CV en inglés + Inglés requerido */}
            <div className="flex flex-col gap-2 pt-5">
              {(
                [
                  { id: "cv_in_english",    label: "CV en inglés",     key: "cv_in_english"    },
                  { id: "english_required", label: "Inglés requerido", key: "english_required" },
                ] as const
              ).map(({ id, label, key }) => (
                <div key={id} className="flex items-center gap-2">
                  <Checkbox
                    id={id}
                    checked={!!f[key]}
                    onCheckedChange={(v) => set({ [key]: !!v })}
                  />
                  <Label htmlFor={id} className="cursor-pointer text-xs font-normal whitespace-nowrap">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Fila 7: Notas */}
          <div className="space-y-1">
            <Label htmlFor="notes" className="text-xs">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Comentarios sobre esta postulación..."
              className="text-sm resize-none"
              value={f.notes}
              onChange={(e) => set({ notes: e.target.value })}
              rows={2}
            />
          </div>

          <DialogFooter className="pt-1">
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={!f.company.trim() || !f.role.trim()}>
              {initialData ? "Guardar cambios" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
