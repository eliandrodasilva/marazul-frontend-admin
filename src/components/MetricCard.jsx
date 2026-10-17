import { TriangleAlert } from "lucide-react";
import { cn } from "../lib/utils";

const TONES = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning",
  accent: "bg-accent/10 text-accent",
};

/**
 * Card de resumo do dashboard. Cobre os três estados da HU25:
 * carregando (skeleton), erro (ícone de alerta) e valor carregado.
 */
export default function MetricCard({
  title,
  value,
  icon: Icon,
  loading,
  error,
  tone = "primary",
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-[0_1px_3px_oklch(0.2_0_0/0.04)]">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{title}</p>

        {loading && (
          <div
            role="status"
            aria-label={`Carregando ${title}`}
            className="mt-1 h-9 w-24 animate-pulse rounded-md bg-muted"
          />
        )}

        {!loading && error && (
          <p className="mt-1 text-sm font-medium text-destructive">
            Não foi possível carregar os dados
          </p>
        )}

        {!loading && !error && (
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-foreground">
            {Number(value ?? 0).toLocaleString("pt-BR")}
          </p>
        )}
      </div>

      <div
        className={cn(
          "grid h-12 w-12 shrink-0 place-items-center rounded-xl",
          error ? "bg-destructive/10 text-destructive" : TONES[tone] || TONES.primary,
        )}
      >
        {error ? (
          <TriangleAlert className="h-5 w-5 text-destructive" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </div>
    </div>
  );
}
