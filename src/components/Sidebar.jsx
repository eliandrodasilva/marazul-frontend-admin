import {
  BarChart3,
  Bus,
  Contact,
  LayoutGrid,
  Map,
  User,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import logoMarazul from "../assets/logoMarazul.png";
import { cn } from "../lib/utils";
import Rightbar from "./Rightbar";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/frota", label: "Frota", icon: Bus },
  { to: "/viagens", label: "Viagens", icon: Map },
  { to: "/funcionario", label: "Colaboradores", icon: Users },
  { to: "/clientes", label: "Clientes", icon: Contact },
  { to: "/passageiros", label: "Passageiros", icon: User },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
];

export default function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full w-full flex-col border-r border-sidebar-border bg-sidebar p-4">
      <div className="flex items-center gap-3 px-2 py-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground overflow-hidden">
          <img
            src={logoMarazul}
            alt="Logo da Marazul"
            className="h-6 w-6 object-contain brightness-0 invert"
          />
        </div>
        <div className="min-w-0">
          <p className="font-display text-base font-semibold text-sidebar-foreground truncate">
            Marazul
          </p>
          <p className="text-xs text-sidebar-muted truncate">
            Painel Administrativo
          </p>
        </div>
      </div>

      <nav className="mt-6 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
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
        <Rightbar onNavigate={onNavigate} />
      </nav>

      <div className="mt-auto rounded-xl border bg-background p-3 text-xs text-sidebar-muted">
        Operação online{" "}
        <span className="ml-1 inline-block h-2 w-2 rounded-full bg-success" />
      </div>
    </div>
  );
}
