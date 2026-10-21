import {
  Ban,
  Loader2,
  Pencil,
  RotateCcw,
  Search,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AdminCard,
  Badge,
  Empty,
  PageHeader,
  PrimaryLink,
  RowActions,
  Table,
} from "../../components/admin";
import { Button } from "../../components/ui/button";
import FuncionarioService from "../../services/FuncionarioService";

function AccessBadge({ isUser }) {
  const hasAccess = isUser === true;
  return (
    <Badge tone={hasAccess ? "success" : "neutral"}>
      {hasAccess ? "Acesso ao sistema" : "Operacional"}
    </Badge>
  );
}

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Ativo",
    tone: "success",
  },
  INACTIVE: {
    label: "Inativo",
    tone: "danger",
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;
  return <Badge tone={config.tone}>{config.label}</Badge>;
}

function getInitials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ConfirmInactivateModal({
  colaborador,
  isLoading,
  onConfirm,
  onCancel,
}) {
  if (!colaborador) return null;

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
              Inativar Colaborador
            </h3>
            <p className="mt-3 text-base text-muted-foreground">
              Deseja realmente inativar o colaborador{" "}
              <span className="font-semibold text-foreground">
                {colaborador.name}
              </span>
              ?
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

function ConfirmActivateModal({ colaborador, isLoading, onConfirm, onCancel }) {
  if (!colaborador) return null;

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
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/12 text-success">
            <RotateCcw className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">
              Reativar Colaborador
            </h3>
            <p className="mt-3 text-base text-muted-foreground">
              Deseja realmente reativar o colaborador{" "}
              <span className="font-semibold text-foreground">
                {colaborador.name}
              </span>
              ?
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
            className="h-11 flex-1 cursor-pointer rounded-lg bg-success text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reativando...
              </>
            ) : (
              "Confirmar Reativação"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Funcionarios() {
  const navigate = useNavigate();

  const [funcionarios, setFuncionarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmFuncionario, setConfirmFuncionario] = useState(null);
  const [confirmActivationFuncionario, setConfirmActivationFuncionario] =
    useState(null);
  const [isInactivating, setIsInactivating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const fetchFuncionarios = async () => {
    try {
      const response = await FuncionarioService.getAll();
      setFuncionarios(response);
    } catch (error) {
      toast.error("Erro ao carregar colaborador", {
        id: "erro-fetch-funcionarios",
        description:
          error.response?.data?.message ||
          "Não foi possível carregar os colaboradores. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const carregarDados = async () => {
      await fetchFuncionarios();
    };

    carregarDados();
  }, []);

  const funcionariosFiltrados = funcionarios.filter((func) =>
    (func.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleInativar = async () => {
    if (!confirmFuncionario) return;

    setIsInactivating(true);

    try {
      await FuncionarioService.inativar(confirmFuncionario.id);
      toast.success("Colaborador inativado com sucesso!");
      setIsLoading(true);
      await fetchFuncionarios();
    } catch (error) {
      toast.error("Erro ao inativar", {
        id: "erro-inativar",
        description:
          error.response?.data?.message ||
          "Ocorreu um problema ao tentar inativar o colaborador.",
      });
    } finally {
      setIsInactivating(false);
      setConfirmFuncionario(null);
    }
  };

  const handleAtivar = async () => {
    if (!confirmActivationFuncionario) return;

    setIsActivating(true);

    try {
      await FuncionarioService.ativar(confirmActivationFuncionario.id);
      toast.success("Colaborador reativado com sucesso!");
      setIsLoading(true);
      await fetchFuncionarios();
    } catch (error) {
      toast.error("Erro ao reativar", {
        id: "erro-ativar",
        description:
          error.response?.data?.message ||
          "Ocorreu um problema ao tentar reativar o colaborador.",
      });
    } finally {
      setIsActivating(false);
      setConfirmActivationFuncionario(null);
    }
  };

  const columns = [
    "Nome",
    "Telefone",
    "Função",
    "Acesso",
    "Status",
    "CNH",
    "Tipo de CNH",
    "",
  ];

  return (
    <div>
      <PageHeader
        title="Colaboradores"
        
        action={
          <PrimaryLink onClick={() => navigate("/funcionario/cadastro")}>
            Novo colaborador
          </PrimaryLink>
        }
      />

      <AdminCard className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              Colaboradores
            </h2>
            {!isLoading && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {funcionariosFiltrados.length}
              </span>
            )}
          </div>

          <label className="flex w-full items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm sm:w-72">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar colaborador…"
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
            <Loader2 className="size-7 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">
              Carregando colaboradores...
            </p>
          </div>
        )}

        {!isLoading && funcionarios.length === 0 && (
          <Empty
            icon={Users}
            title="Nenhum colaborador cadastrado ainda."
            text="Cadastre o primeiro colaborador para começar a gerenciar a equipe."
            onClick={() => navigate("/funcionario/cadastro")}
            cta="Novo colaborador"
          />
        )}

        {!isLoading &&
          funcionarios.length > 0 &&
          funcionariosFiltrados.length === 0 && (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              Nenhum colaborador encontrado com essa busca.
            </div>
          )}

        {!isLoading && funcionariosFiltrados.length > 0 && (
          <Table head={columns}>
            {funcionariosFiltrados.map((func) => {
              const isMotorista =
                func.position === "DRIVER" ||
                (func.position || "").toLowerCase() === "motorista";
              const isInactive = func.status === "INACTIVE";

              return (
                <tr key={func.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {getInitials(func.name)}
                      </div>
                      <span className="font-semibold text-foreground">
                        {func.name}
                      </span>
                    </div>
                  </td>

                  <td className="text-muted-foreground">
                    {func.cellphoneNumber || "—"}
                  </td>

                  <td>
                    {FuncionarioService.getLabel("positions", func.position)}
                  </td>

                  <td>
                    <AccessBadge isUser={func.isUser} />
                  </td>

                  <td>
                    <StatusBadge status={func.status} />
                  </td>

                  <td className="text-muted-foreground">
                    {isMotorista && func.cnhNumber ? func.cnhNumber : "—"}
                  </td>

                  <td className="text-muted-foreground">
                    {isMotorista && func.cnhType ? func.cnhType : "—"}
                  </td>

                  <td>
                    <RowActions>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/funcionario/editar/${func.id}`)
                        }
                        title="Editar"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          isInactive
                            ? setConfirmActivationFuncionario(func)
                            : setConfirmFuncionario(func)
                        }
                        title={isInactive ? "Reativar" : "Inativar"}
                        aria-label={isInactive ? "Reativar" : "Desativar"}
                      >
                        {isInactive ? (
                          <RotateCcw className="h-4 w-4" />
                        ) : (
                          <Ban className="h-4 w-4" />
                        )}
                      </button>
                    </RowActions>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </AdminCard>

      <ConfirmInactivateModal
        colaborador={confirmFuncionario}
        isLoading={isInactivating}
        onConfirm={handleInativar}
        onCancel={() => setConfirmFuncionario(null)}
      />
      <ConfirmActivateModal
        colaborador={confirmActivationFuncionario}
        isLoading={isActivating}
        onConfirm={handleAtivar}
        onCancel={() => setConfirmActivationFuncionario(null)}
      />
    </div>
  );
}
