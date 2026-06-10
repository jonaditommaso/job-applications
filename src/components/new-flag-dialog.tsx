import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FlagEvent } from "@/types/flags";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<FlagEvent, "id" | "created_at">) => void;
}

const FLAG_TYPE_OPTIONS = [
  { value: "application_strategy", label: "Estrategia de aplicación", className: "border-violet-300 bg-violet-50 text-violet-900 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-100" },
  { value: "cv", label: "CV", className: "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-100" },
  { value: "profile", label: "Perfil", className: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100" },
  { value: "networking", label: "Networking", className: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100" },
  { value: "interview", label: "Entrevista", className: "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-100" },
] as const;

const FLAG_SUBTYPE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  application_strategy: [
    { value: "salary_change", label: "Expectativa salarial" },
    { value: "target_country", label: "País objetivo" },
    { value: "target_role", label: "Puesto objetivo" },
    { value: "other", label: "Otro" },
  ],
  cv: [
    { value: "skills", label: "Habilidades" },
    { value: "experience", label: "Experiencia" },
    { value: "projects", label: "Proyectos" },
    { value: "interests", label: "Intereses" },
    { value: "languages", label: "Idiomas" },
    { value: "format", label: "Formato" },
    { value: "information", label: "Información" },
    { value: "title", label: "Título" },
  ],
  profile: [
    { value: "linkedin_update", label: "Actualización de LinkedIn" },
    { value: "github_update", label: "Actualización de GitHub" },
    { value: "project_update", label: "Actualización de proyecto" },
    { value: "portal_update", label: "Actualización de portal" },
  ],
  networking: [
    { value: "recruiter_contact", label: "Contacto con reclutador" },
    { value: "other", label: "Otro" },
  ],
  interview: [
    { value: "interview_done", label: "Entrevista realizada" },
    { value: "interview_feedback", label: "Feedback de entrevista" },
  ],
};

function getDefaultForm() {
  return {
    type: "",
    subtype: "",
    description: "",
    hypothesis: "",
    effective_date: new Date().toISOString().split("T")[0],
  };
}

function buildEffectiveDateTime(value: string) {
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

const NewFlagDialog = ({ open, onClose, onSubmit }: Props) => {
  const [form, setForm] = useState(getDefaultForm);

  function handleClose() {
    setForm(getDefaultForm());
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.type.trim()) return;

    onSubmit({
      type: form.type,
      subtype: form.subtype,
      description: form.description,
      hypothesis: form.hypothesis,
      effective_date: buildEffectiveDateTime(form.effective_date),
    });

    handleClose();
  }

  const setField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectedType = FLAG_TYPE_OPTIONS.find((option) => option.value === form.type);
  const subtypeOptions = form.type ? FLAG_SUBTYPE_OPTIONS[form.type] ?? [] : [];
  const selectedSubtype = subtypeOptions.find((option) => option.value === form.subtype);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-bold leading-tight">Nuevo flag</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(value) => {
                  setField("type", value ?? "");
                  setField("subtype", "");
                }}
              >
                <SelectTrigger className={`h-8 w-full text-sm ${selectedType?.className ?? ""}`}>
                  <span>{selectedType?.label ?? "Seleccione un tipo"}</span>
                </SelectTrigger>
                <SelectContent>
                  {FLAG_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Subtipo</Label>
              <Select
                value={form.subtype}
                onValueChange={(value) => setField("subtype", value ?? "")}
                disabled={!form.type}
              >
                <SelectTrigger className="h-8 w-full text-sm">
                  <span>{selectedSubtype?.label ?? "Seleccione un subtipo"}</span>
                </SelectTrigger>
                <SelectContent>
                  {subtypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="flag-description" className="text-xs">Descripción</Label>
            <Textarea
              id="flag-description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Describe el flag o el contexto"
              className="min-h-20 resize-none text-sm"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="flag-hypothesis" className="text-xs">Hipótesis</Label>
            <Textarea
              id="flag-hypothesis"
              value={form.hypothesis}
              onChange={(e) => setField("hypothesis", e.target.value)}
              placeholder="Qué se espera que ocurra"
              className="min-h-20 resize-none text-sm"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="flag-effective-date" className="text-xs">Fecha</Label>
            <Input
              id="flag-effective-date"
              type="date"
              value={form.effective_date}
              onChange={(e) => setField("effective_date", e.target.value)}
              className="h-8 w-40 text-sm"
            />
          </div>

          <DialogFooter className="pt-1">
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={!form.type.trim()}>
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFlagDialog;