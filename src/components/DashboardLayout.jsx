import { useState } from "react";
import { Outlet } from "react-router-dom";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar fixa (desktop) */}
      <aside className="sticky top-0 z-40 hidden h-screen w-64 shrink-0 flex-col md:flex">
        <Sidebar />
      </aside>

      {/* Overlay do menu mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar deslizante (mobile) */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
          className="absolute top-4 right-4 z-10 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" />
        </Button>
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Área de conteúdo (Workspace) */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader onOpenMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
