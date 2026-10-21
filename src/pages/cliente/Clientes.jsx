import {
  AlertCircle,
  Contact,
  Loader2,
  Pencil,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AdminCard,
  Empty,
  PageHeader,
  PrimaryLink,
  RowActions,
  Table,
} from "../../components/admin";
import Pagination from "../../components/Pagination";
import { Button } from "../../components/ui/button";
import { formatCnpj, formatCpf, onlyDigits } from "../../lib/documentMasks";
import ClienteService from "../../services/ClienteService";

const PERSON_TYPE_LABELS = {
  PF: "Pessoa Física",
  PJ: "Pessoa Jurídica",
};

const ITEMS_PER_PAGE = 8;

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function getPersonType(client) {
  return onlyDigits(client.cnpj) ? "PJ" : "PF";
}

function formatDocument(client) {
  if (onlyDigits(client.cnpj)) return formatCnpj(client.cnpj);
  if (onlyDigits(client.cpf)) return formatCpf(client.cpf);
  return "—";
}

function formatLocation(client) {
  if (client.city && client.state) return `${client.city}/${client.state}`;
  return client.city || client.state || "—";
}

function ConfirmModal({ client, isLoading, onConfirm, onCancel }) {
  if (!client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={isLoading ? undefined : onCancel}
      />

      <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl border bg-card p-8 text-card-foreground shadow-2xl">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute right-4 top-4 cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Trash2 className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">
              Excluir Cliente
            </h3>
            <p className="mt-3 text-base text-muted-foreground">
              Deseja realmente excluir o cliente{" "}
              <span className="font-semibold text-foreground">
                {client.name}
              </span>{" "}
              com documento{" "}
              <span className="font-semibold text-foreground">
                {formatDocument(client)}
              </span>
              ?
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta ação não poderá ser desfeita e o endereço vinculado ao
              cliente também será excluído.
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
                Excluindo...
              </>
            ) : (
              "Confirmar Exclusão"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Clientes() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [confirmClient, setConfirmClient] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    ClienteService.getAll()
      .then((data) => {
        if (active) setClients(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!active) return;
        setError("Não foi possível carregar a lista de clientes.");
        setClients([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryCount]);

  const fetchClients = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((count) => count + 1);
  };

  const filteredClients = useMemo(() => {
    const term = normalizeText(searchTerm);
    const termDigits = onlyDigits(searchTerm);

    if (!term) return clients;

    return clients.filter((client) => {
      const matchesName = normalizeText(client.name).includes(term);
      const documentDigits = onlyDigits(client.cpf) + onlyDigits(client.cnpj);
      const matchesDocument =
        termDigits.length > 0 && documentDigits.includes(termDigits);

      return matchesName || matchesDocument;
    });
  }, [clients, searchTerm]);

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE) || 1;
  const displayedPage = Math.min(currentPage, totalPages);

  const paginatedClients = useMemo(() => {
    const startIndex = (displayedPage - 1) * ITEMS_PER_PAGE;
    return filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredClients, displayedPage]);

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!confirmClient || isDeleting) return;
    setIsDeleting(true);

    try {
      await ClienteService.delete(confirmClient.id);
      setClients((prev) => prev.filter((c) => c.id !== confirmClient.id));
      const remainingPages = Math.max(
        1,
        Math.ceil((filteredClients.length - 1) / ITEMS_PER_PAGE),
      );
      setCurrentPage((page) => Math.min(page, remainingPages));
      toast.success("Cliente excluído com sucesso!");
    } catch (requestError) {
      const status = requestError.response?.status;
      const data = requestError.response?.data;

      if (status === 404) {
        toast.warning("Cliente não encontrado", {
          description: "O cliente já foi removido. A listagem foi atualizada.",
        });
        fetchClients();
      } else if (status === 400 || status === 409) {
        toast.error("Não foi possível excluir o cliente", {
          description:
            data?.message ||
            data?.erro ||
            "A exclusão foi bloqueada por uma regra do sistema.",
        });
      } else {
        toast.error("Erro ao excluir cliente", {
          description: "Ocorreu um problema. Tente novamente.",
        });
      }
    } finally {
      setIsDeleting(false);
      setConfirmClient(null);
    }
  };

  const columns = ["Nome", "Documento", "Tipo", "Cidade/UF", ""];

  return (
    <div>
      <PageHeader
        title="Clientes"
        
        action={
          <PrimaryLink onClick={() => navigate("/clientes/cadastro")}>
            Novo cliente
          </PrimaryLink>
        }
      />

      <AdminCard className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Clientes</h2>
            {!isLoading && !error && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {filteredClients.length}
              </span>
            )}
          </div>

          <label className="flex w-full items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm sm:w-72">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              id="search-clientes"
              placeholder="Buscar cliente…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Carregando clientes...
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Buscando dados dos clientes
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
              onClick={fetchClients}
              className="mt-2 cursor-pointer gap-2 rounded-lg text-xs font-semibold"
            >
              <RefreshCw className="h-4 w-4" /> Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !error && clients.length === 0 && (
          <Empty
            icon={Contact}
            title="Nenhum cliente cadastrado ainda"
            text="Cadastre o primeiro cliente para começar a gerenciar seus contratantes."
            onClick={() => navigate("/clientes/cadastro")}
            cta="Cadastrar cliente"
          />
        )}

        {!isLoading &&
          !error &&
          clients.length > 0 &&
          filteredClients.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                <Search className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">
                  Nenhum cliente encontrado
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nenhum cliente corresponde à busca realizada.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSearch}
                className="mt-2 cursor-pointer gap-1.5 rounded-lg text-xs font-semibold"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Limpar busca
              </Button>
            </div>
          )}

        {!isLoading && !error && filteredClients.length > 0 && (
          <Table head={columns}>
            {paginatedClients.map((client) => (
              <tr key={client.id}>
                <td className="font-semibold text-foreground">{client.name}</td>
                <td>
                  <span className="rounded-md border bg-muted px-2 py-1 font-mono text-xs text-foreground">
                    {formatDocument(client)}
                  </span>
                </td>
                <td className="text-muted-foreground">
                  {PERSON_TYPE_LABELS[getPersonType(client)]}
                </td>
                <td className="text-muted-foreground">
                  {formatLocation(client)}
                </td>
                <td>
                  <RowActions>
                    <button
                      type="button"
                      onClick={() => navigate(`/clientes/editar/${client.id}`)}
                      title="Editar cliente"
                      aria-label="Editar cliente"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmClient(client)}
                      title="Excluir cliente"
                      aria-label="Excluir cliente"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </RowActions>
                </td>
              </tr>
            ))}
          </Table>
        )}

        {!isLoading && !error && filteredClients.length > 0 && (
          <Pagination
            currentPage={displayedPage}
            totalPages={totalPages}
            totalItems={filteredClients.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            itemName="cliente"
          />
        )}
      </AdminCard>

      <ConfirmModal
        client={confirmClient}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmClient(null)}
      />
    </div>
  );
}
