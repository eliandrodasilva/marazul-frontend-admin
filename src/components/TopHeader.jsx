import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { logout } from "../lib/auth";
import { useAuth } from "../context/AuthContext";

function getInitials(name) {
  if (!name || name === "Carregando..." || name === "Perfil indisponível") {
    return "AD";
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TopHeader({ onOpenMenu }) {
  const navigate = useNavigate();
  const { profile, failed } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const menuRef = useRef(null);

  // Fecha o dropdown ao clicar fora.
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayName = profile
    ? profile.nome
    : failed
      ? "Perfil indisponível"
      : "Carregando...";

  const handleLogout = () => {
    logout();
    // replace impede voltar ao painel pelo botão "Voltar" do navegador.
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 px-6 backdrop-blur">
      {/* Botão hambúrguer (apenas mobile) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenMenu}
        aria-label="Abrir menu"
        className="text-foreground hover:bg-muted md:hidden"
      >
        <Menu className="size-5" />
      </Button>

      {/* Empurra o conteúdo da conta para a direita no desktop */}
      <div className="hidden md:block" />

      <div className="flex items-center gap-4">
        {/* Notificações */}
        <button
          type="button"
          className="relative cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
        </button>

        {/* Conta */}
        <div className="relative border-l pl-4" ref={menuRef}>
          <Button
            variant="ghost"
            onClick={() => setAccountOpen((v) => !v)}
            className="flex h-auto cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 normal-case tracking-normal hover:bg-muted"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold text-foreground">
              {getInitials(displayName)}
            </div>
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-semibold leading-tight text-foreground">
                {displayName}
              </p>
              <p className="text-xs font-normal text-muted-foreground">
                {profile?.email || "Administrador"}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition",
                accountOpen && "rotate-180",
              )}
            />
          </Button>

          {accountOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-card py-2 text-card-foreground shadow-lg">
              <div className="border-b px-4 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Usuário Logado
                </p>
                <p className="truncate text-sm font-semibold text-foreground">
                  {displayName}
                </p>
                {profile && (
                  <p className="truncate text-xs text-muted-foreground">
                    {profile.email}
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                className="h-auto w-full cursor-pointer justify-start gap-2 rounded-none px-4 py-2.5 text-sm font-normal normal-case tracking-normal text-foreground hover:bg-muted"
              >
                <Settings className="size-4 text-muted-foreground" /> Conta
              </Button>

              <div className="my-1 border-t" />

              <Button
                variant="ghost"
                onClick={handleLogout}
                className="h-auto w-full cursor-pointer justify-start gap-2 rounded-none px-4 py-2.5 text-sm font-normal normal-case tracking-normal text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4" /> Sair
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
