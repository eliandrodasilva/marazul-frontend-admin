import { useEffect, useState } from "react";
import { Bus, RefreshCw, Users } from "lucide-react";
import { PageHeader } from "../components/admin";
import MetricCard from "../components/MetricCard";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import dashboardService from "../services/DashboardService";

export default function Dashboard() {
  const {
    profile,
    loading: profileLoading,
    failed: profileFailed,
    reload: reloadProfile,
  } = useAuth();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    dashboardService
      .getMetrics({ signal: controller.signal })
      .then((data) => {
        if (!active) return;

        setMetrics(data);
        setLoading(false);
      })
      .catch((error) => {
        // Requisição cancelada porque a tela foi desmontada: nada a atualizar.
        if (!active) return;

        setLoading(false);

        // Token expirado (401) já é tratado pelo interceptor do axios.
        if (error.response?.status === 401) return;

        setFailed(true);
      });

    // Cancela a requisição em voo se o usuário sair da tela antes da resposta.
    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey]);

  const handleRetry = () => {
    if (profileFailed) reloadProfile();

    setLoading(true);
    setFailed(false);
    setReloadKey((key) => key + 1);
  };

  const firstName = profile?.nome?.trim().split(/\s+/)[0];

  return (
    <div>
      <PageHeader
        title={
          profileLoading ? (
            <span className="inline-flex flex-wrap items-center gap-x-2">
              Olá,
              <span
                role="status"
                aria-label="Carregando nome do administrador"
                className="inline-block h-8 w-44 animate-pulse rounded-md bg-muted"
              />
            </span>
          ) : (
            <span>{firstName ? `Olá, ${firstName}` : "Olá!"}</span>
          )
        }
        subtitle="Resumo da operação da Marazul em tempo real."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard
          title="Total de ônibus"
          value={metrics?.totalVehicles}
          icon={Bus}
          loading={loading}
          error={failed}
          tone="primary"
        />
        <MetricCard
          title="Colaboradores ativos"
          value={metrics?.activeEmployees}
          icon={Users}
          loading={loading}
          error={failed}
          tone="success"
        />
      </div>

      {failed && (
        <div className="mt-6">
          <Button
            onClick={handleRetry}
            className="cursor-pointer gap-2 rounded-lg bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="size-4" /> Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );
}
