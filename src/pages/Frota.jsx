import {
  AlertCircle,
  Ban,
  Bus,
  Gauge,
  Loader2,
  Pencil,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AdminCard,
  Badge,
  Empty,
  PageHeader,
  PrimaryLink,
  RowActions,
  Stat,
  Table,
} from "../components/admin";
import Pagination from "../components/Pagination";
import { Button } from "../components/ui/button";
import FrotaService from "../services/FrotaService";

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Ativo",
    tone: "success",
  },
  INACTIVE: {
    label: "Inativo",
    tone: "danger",
  },
  UNDER_MAINTENANCE: {
    label: "Em manutenção",
    tone: "warning",
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;
  return <Badge tone={config.tone}>{config.label}</Badge>;
}

function formatDate(isoDate) {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function ConfirmModal({ vehicle, isLoading, onConfirm, onCancel }) {
  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl border bg-card p-8 text-card-foreground shadow-2xl">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Ban className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">
              Inativar Veículo
            </h3>
            <p className="mt-3 text-base text-muted-foreground">
              Deseja realmente inativar o veículo{" "}
              <span className="font-semibold text-foreground">
                {vehicle.prefix}
              </span>{" "}
              com placa{" "}
              <span className="font-semibold text-foreground">
                {vehicle.licensePlate}
              </span>
              ?
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              O veículo não será excluído da base, apenas seu status será
              alterado para inativo.
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-11 flex-1 cursor-pointer rounded-lg text-sm font-semibold"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="h-11 flex-1 cursor-pointer rounded-lg bg-destructive text-sm font-semibold text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inativando...
              </>
            ) : (
              "Confirmar Inativação"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

const ITEMS_PER_PAGE = 8;

export default function Frota() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modelFilter, setModelFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const [confirmVehicle, setConfirmVehicle] = useState(null);
  const [isInactivating, setIsInactivating] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterOpen]);

  const fetchVehicles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await FrotaService.getAll();
      setVehicles(Array.isArray(data) ? data : []);
    } catch {
      setError("Não foi possível carregar a lista de veículos.");
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    FrotaService.getAll()
      .then((data) => setVehicles(Array.isArray(data) ? data : []))
      .catch(() => {
        setError("Não foi possível carregar a lista de veículos.");
        setVehicles([]);
      })
      .finally(() => setIsLoading(false));
    FrotaService.getEnums().then((data) => {
      if (data?.models) {
        setModelOptions(data.models);
      }
    });
  }, []);

  const stats = useMemo(() => {
    const total = vehicles.length;
    const active = vehicles.filter((v) => v.status === "ACTIVE").length;
    const maintenance = vehicles.filter(
      (v) => v.status === "UNDER_MAINTENANCE",
    ).length;
    const operationalRate = total > 0 ? Math.round((active / total) * 100) : 0;
    return { total, active, maintenance, operationalRate };
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const term = searchTerm.toLowerCase().trim();
      const modelLabel = FrotaService.getLabel("models", v.model).toLowerCase();
      const matchesSearch =
        !term ||
        v.prefix?.toLowerCase().includes(term) ||
        v.licensePlate?.toLowerCase().includes(term) ||
        modelLabel.includes(term);

      const matchesStatus = statusFilter === "ALL" || v.status === statusFilter;
      const matchesModel = modelFilter === "ALL" || v.model === modelFilter;

      return matchesSearch && matchesStatus && matchesModel;
    });
  }, [vehicles, searchTerm, statusFilter, modelFilter]);

  const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE) || 1;

  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVehicles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredVehicles, currentPage]);

  const activeFilterCount =
    (statusFilter !== "ALL" ? 1 : 0) + (modelFilter !== "ALL" ? 1 : 0);

  const hasActiveFilters = Boolean(searchTerm.trim()) || activeFilterCount > 0;

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setModelFilter("ALL");
    setCurrentPage(1);
  };

  const handleInactivate = async () => {
    if (!confirmVehicle) return;
    setIsInactivating(true);

    try {
      const updated = await FrotaService.inactivate(confirmVehicle.id);
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === confirmVehicle.id
            ? { ...v, status: updated?.status || "INACTIVE" }
            : v,
        ),
      );
      toast.success("Veículo inativado com sucesso!", {
        description: `${confirmVehicle.prefix} (${confirmVehicle.licensePlate}) foi inativado.`,
      });
    } catch {
      toast.error("Erro ao inativar veículo", {
        description: "Ocorreu um problema. Tente novamente.",
      });
    } finally {
      setIsInactivating(false);
      setConfirmVehicle(null);
    }
  };

  const columns = [
    "Prefixo",
    "Placa",
    "Modelo",
    "Ano",
    "Capacidade",
    "Status",
    "Vistoria",
    "",
  ];

  return (
    <div>
      <PageHeader
        title="Frota"
        subtitle="Gerencie os veículos da operação."
        action={
          <PrimaryLink onClick={() => navigate("/frota/cadastro")}>
            Novo veículo
          </PrimaryLink>
        }
      />

      {!isLoading && !error && vehicles.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Stat
            label="Veículos ativos"
            value={stats.active}
            icon={Bus}
            tone="success"
          />
          <Stat
            label="Em manutenção"
            value={stats.maintenance}
            icon={Wrench}
            tone="warning"
          />
          <Stat
            label="Taxa operacional"
            value={`${stats.operationalRate}%`}
            icon={Gauge}
          />
        </div>
      )}

      <AdminCard className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Veículos</h2>
            {!isLoading && !error && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {filteredVehicles.length}
              </span>
            )}
          </div>

          {!isLoading && !error && vehicles.length > 0 && (
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <label className="flex w-full items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm sm:w-72">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  id="search-frota"
                  placeholder="Buscar prefixo, placa ou modelo…"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </label>

              <div className="relative" ref={filterRef}>
                <button
                  type="button"
                  onClick={() => setFilterOpen((prev) => !prev)}
                  title="Filtrar veículos"
                  className={`inline-flex h-9.5 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all duration-150 ${
                    activeFilterCount > 0
                      ? "border-primary bg-primary/5 text-primary"
                      : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Filtros</span>
                  {activeFilterCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {filterOpen && (
                  <div className="animate-in fade-in zoom-in-95 absolute right-0 top-11 z-50 w-72 rounded-xl border bg-card p-4 text-card-foreground shadow-xl duration-100">
                    <div className="mb-3 flex items-center justify-between border-b pb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Filtrar Frota
                      </span>
                      {activeFilterCount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter("ALL");
                            setModelFilter("ALL");
                            setCurrentPage(1);
                          }}
                          className="cursor-pointer text-[11px] font-medium text-destructive hover:underline"
                        >
                          Limpar
                        </button>
                      )}
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Status
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { value: "ALL", label: "Todos" },
                            { value: "ACTIVE", label: "Ativo" },
                            {
                              value: "UNDER_MAINTENANCE",
                              label: "Em manutenção",
                            },
                            { value: "INACTIVE", label: "Inativo" },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setStatusFilter(opt.value);
                                setCurrentPage(1);
                              }}
                              className={`cursor-pointer rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                                statusFilter === opt.value
                                  ? "bg-primary font-semibold text-primary-foreground shadow-xs"
                                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Marca
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setModelFilter("ALL");
                              setCurrentPage(1);
                            }}
                            className={`cursor-pointer rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                              modelFilter === "ALL"
                                ? "bg-primary font-semibold text-primary-foreground shadow-xs"
                                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            Todas
                          </button>
                          {modelOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setModelFilter(opt.value);
                                setCurrentPage(1);
                              }}
                              className={`cursor-pointer rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                                modelFilter === opt.value
                                  ? "bg-primary font-semibold text-primary-foreground shadow-xs"
                                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Carregando veículos...
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Buscando dados da frota
              </p>
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div className="max-w-xs text-center">
              <p className="font-semibold text-foreground">{error}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Verifique sua conexão e tente novamente.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={fetchVehicles}
              className="mt-2 cursor-pointer gap-2 rounded-lg text-xs font-semibold"
            >
              <RefreshCw className="h-4 w-4" /> Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !error && vehicles.length === 0 && (
          <Empty
            icon={Bus}
            title="Nenhum veículo cadastrado ainda"
            text="Cadastre o primeiro veículo para começar a gerenciar sua frota."
            onClick={() => navigate("/frota/cadastro")}
            cta="Cadastrar veículo"
          />
        )}

        {!isLoading &&
          !error &&
          vehicles.length > 0 &&
          filteredVehicles.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                <Search className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">
                  Não há nada a ser exibido
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hasActiveFilters
                    ? "Nenhum veículo corresponde aos filtros selecionados."
                    : "Nenhum resultado encontrado."}
                </p>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-2 cursor-pointer gap-1.5 rounded-lg text-xs font-semibold"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Limpar filtros
                </Button>
              )}
            </div>
          )}

        {!isLoading && !error && filteredVehicles.length > 0 && (
          <Table head={columns}>
            {paginatedVehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="font-semibold text-foreground">
                  {vehicle.prefix}
                </td>
                <td>
                  <span className="rounded-md border bg-muted px-2 py-1 font-mono text-xs uppercase text-foreground">
                    {vehicle.licensePlate}
                  </span>
                </td>
                <td>{FrotaService.getLabel("models", vehicle.model)}</td>
                <td className="text-muted-foreground">{vehicle.year}</td>
                <td>
                  <b>{vehicle.seats}</b>{" "}
                  <span className="text-muted-foreground">lugares</span>
                </td>
                <td>
                  <StatusBadge status={vehicle.status} />
                </td>
                <td className="text-muted-foreground">
                  {formatDate(vehicle.inspectionDate)}
                </td>
                <td>
                  <RowActions>
                    <button
                      type="button"
                      onClick={() => navigate(`/frota/editar/${vehicle.id}`)}
                      title="Editar veículo"
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmVehicle(vehicle)}
                      disabled={vehicle.status === "INACTIVE"}
                      title={
                        vehicle.status === "INACTIVE"
                          ? "Veículo já está inativo"
                          : "Inativar veículo"
                      }
                      aria-label="Desativar"
                    >
                      <Ban className="h-4 w-4" />
                    </button>
                  </RowActions>
                </td>
              </tr>
            ))}
          </Table>
        )}

        {!isLoading && !error && filteredVehicles.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredVehicles.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            itemName="veículo"
          />
        )}
      </AdminCard>

      <ConfirmModal
        vehicle={confirmVehicle}
        isLoading={isInactivating}
        onConfirm={handleInactivate}
        onCancel={() => setConfirmVehicle(null)}
      />
    </div>
  );
}
