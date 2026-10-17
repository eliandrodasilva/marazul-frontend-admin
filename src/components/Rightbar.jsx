import { NavLink } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { isAdmin } from "../lib/auth";
import { cn } from "../lib/utils";

const adminItems = [
  { to: "/perfis", label: "Perfis de Acesso", icon: ShieldCheck },
];

/**
 * Itens de menu restritos ao perfil administrador.
 * Não renderiza nada para os demais perfis.
 */
export default function Rightbar({ onNavigate }) {
  if (!isAdmin()) return null;

  return (
    <>
      <div className="my-4 border-t border-sidebar-border" />
      {adminItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-foreground font-semibold [&_svg]:text-accent"
                : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground",
            )
          }
        >
          <Icon className="h-4.5 w-4.5 shrink-0" />
          <span>{label}</span>
        </NavLink>
      ))}
    </>
  );
}
