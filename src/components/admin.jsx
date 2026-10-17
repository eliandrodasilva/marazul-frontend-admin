import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export const APP_NAME = "Marazul";

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PrimaryLink({ to, onClick, children }) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" /> {children}
      </button>
    );
  }

  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
    >
      <Plus className="h-4 w-4" /> {children}
    </Link>
  );
}

export function AdminCard({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card text-card-foreground shadow-[0_1px_3px_oklch(0.2_0_0/0.04)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Stat({ label, value, icon: Icon, tone = "primary" }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/12 text-success",
    warning: "bg-warning/15 text-warning",
    accent: "bg-accent/10 text-accent",
  };
  return (
    <AdminCard className="flex items-center justify-between p-5">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-3xl font-bold text-foreground">{value}</p>
      </div>
      {Icon && (
        <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl", tones[tone] || tones.primary)}>
          <Icon className="h-5 w-5" />
        </div>
      )}
    </AdminCard>
  );
}

const badgeTones = {
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
};

export function Badge({ tone = "neutral", children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        badgeTones[tone] || badgeTones.neutral,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function ListCard({ title, count, search, actions, children, footer, className }) {
  return (
    <AdminCard className={cn("overflow-hidden", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {count !== undefined && count !== null && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {count}
            </span>
          )}
        </div>
        {actions ? (
          actions
        ) : search ? (
          <label className="flex w-full items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm sm:w-72">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder={search}
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </label>
        ) : null}
      </div>
      {children}
      {footer && <div className="border-t px-6 py-3 text-xs text-muted-foreground">{footer}</div>}
    </AdminCard>
  );
}

export function Table({ head, columns, children }) {
  const headers = head || columns || [];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            {headers.map((h, idx) => (
              <th key={h || idx} scope="col" className="px-6 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y [&_td]:px-6 [&_td]:py-4 [&_tr:hover]:bg-muted/40">{children}</tbody>
      </table>
    </div>
  );
}

export function Empty({ icon: Icon, title, text, description, to, onClick, cta }) {
  const subtitleText = text || description;
  return (
    <div className="flex flex-col items-center px-6 py-20 text-center">
      {Icon && (
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <p className="mt-4 font-semibold text-foreground">{title}</p>
      {subtitleText && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{subtitleText}</p>}
      {cta && (to || onClick) && (
        <div className="mt-6">
          <PrimaryLink to={to} onClick={onClick}>
            {cta}
          </PrimaryLink>
        </div>
      )}
    </div>
  );
}

export function Section({ icon: Icon, title, desc, children, className }) {
  return (
    <section className={cn("grid gap-6 p-6 lg:grid-cols-[220px_1fr]", className)}>
      <div>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-accent" />}
          <h2 className="font-semibold text-foreground">{title}</h2>
        </div>
        {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export const controlClass =
  "w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/15 disabled:cursor-not-allowed disabled:opacity-60";

export function Field({ label, required, full, children, className }) {
  return (
    <div className={cn("flex flex-col gap-1.5", full && "sm:col-span-2", className)}>
      {label && (
        <span className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-accent"> *</span>}
        </span>
      )}
      {children}
    </div>
  );
}

export function RowActions({ children }) {
  return (
    <div className="flex items-center gap-1 [&_button]:cursor-pointer [&_button]:rounded-md [&_button]:p-1.5 [&_button]:text-muted-foreground [&_button:hover]:bg-muted [&_button:hover]:text-foreground [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-30 [&_button:disabled:hover]:bg-transparent [&_button:disabled:hover]:text-muted-foreground">
      {children}
    </div>
  );
}
