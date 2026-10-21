import { AlertCircle, Loader2, Pencil, RefreshCw, Search, Trash2, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AdminCard, Empty, PageHeader, PrimaryLink, RowActions, Table } from "../../components/admin";
import Pagination from "../../components/Pagination";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { formatCpf } from "../../lib/documentMasks";
import { formatPassengerPhone, matchesPassenger } from "../../lib/passengerList";
import PassageiroService from "../../services/PassageiroService";

const ITEMS_PER_PAGE = 8;
const COLUMNS = ["Nome", "CPF", "Telefone", ""];

function ConfirmDeleteModal({ passenger, isLoading, onConfirm, onCancel }) {
  if (!passenger) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity" onClick={isLoading ? undefined : onCancel} />
      <div role="dialog" aria-modal="true" aria-labelledby="delete-passenger-title" className="relative z-10 w-full max-w-lg rounded-2xl bg-card p-8 shadow-2xl mx-4 border border-border">
        <button type="button" onClick={onCancel} disabled={isLoading} aria-label="Fechar" className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">
          <X className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Trash2 className="h-8 w-8" />
          </div>
          <div>
            <h3 id="delete-passenger-title" className="text-xl font-bold text-foreground">Excluir Passageiro</h3>
            <p className="mt-3 text-base text-muted-foreground">
              Deseja realmente excluir o passageiro <span className="font-semibold text-foreground">{passenger.name}</span> com documento <span className="font-semibold text-foreground">{formatCpf(passenger.cpf)}</span>?
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Esta ação não poderá ser desfeita.</p>
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1 rounded-xl h-11 text-sm cursor-pointer font-medium">Cancelar</Button>
          <Button onClick={onConfirm} disabled={isLoading} className="flex-1 rounded-xl h-11 bg-destructive text-sm text-destructive-foreground hover:opacity-90 cursor-pointer font-medium">
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Excluindo...</> : "Confirmar Exclusão"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Passageiros() {
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmPassenger, setConfirmPassenger] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    PassageiroService.getAll()
      .then((data) => {
        if (active) {
          setPassengers(Array.isArray(data) ? data : []);
          setError("");
        }
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar os passageiros.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [reload]);

  const filteredPassengers = useMemo(
    () => passengers.filter((passenger) => matchesPassenger(passenger, searchTerm)),
    [passengers, searchTerm],
  );
  const totalPages = Math.max(1, Math.ceil(filteredPassengers.length / ITEMS_PER_PAGE));
  const displayedPage = Math.min(currentPage, totalPages);
  const paginatedPassengers = filteredPassengers.slice(
    (displayedPage - 1) * ITEMS_PER_PAGE,
    displayedPage * ITEMS_PER_PAGE,
  );

  const retry = () => {
    setIsLoading(true);
    setError("");
    setReload((value) => value + 1);
  };

  const handleDelete = async () => {
    if (!confirmPassenger || isDeleting) return;
    setIsDeleting(true);
    try {
      await PassageiroService.delete(confirmPassenger.id);
      setPassengers((previous) => previous.filter((passenger) => passenger.id !== confirmPassenger.id));
      const remainingPages = Math.max(1, Math.ceil((filteredPassengers.length - 1) / ITEMS_PER_PAGE));
      setCurrentPage((page) => Math.min(page, remainingPages));
      toast.success("Passageiro excluído com sucesso!");
    } catch (requestError) {
      const status = requestError.response?.status;
      const data = requestError.response?.data;
      if (status === 400 || status === 409) {
        toast.error(data?.message || data?.erro || "A exclusão foi bloqueada por uma regra do sistema.");
      } else if (status === 404) {
        toast.warning("Passageiro não encontrado. A listagem será atualizada.");
        retry();
      } else {
        toast.error("Não foi possível excluir o passageiro. Tente novamente.");
      }
    } finally {
      setIsDeleting(false);
      setConfirmPassenger(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Passageiros"
        
        action={<PrimaryLink onClick={() => navigate("/passageiros/cadastro")}>Novo passageiro</PrimaryLink>}
      />

      <AdminCard>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-foreground">Listagem de passageiros</h2>
            {!isLoading && !error && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {filteredPassengers.length}
              </span>
            )}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search-passengers"
              aria-label="Buscar passageiro por nome ou CPF"
              placeholder="Buscar nome ou CPF..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              className="h-9 rounded-xl border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Carregando passageiros...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4" role="alert">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center max-w-xs">
              <p className="text-sm font-semibold text-destructive">{error}</p>
              <p className="mt-1 text-xs text-muted-foreground">Verifique sua conexão e tente novamente.</p>
            </div>
            <Button variant="outline" onClick={retry} className="mt-1 gap-2 rounded-xl cursor-pointer border-destructive/20 text-destructive hover:bg-destructive/10 font-medium text-xs">
              <RefreshCw className="h-4 w-4" /> Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !error && passengers.length === 0 && (
          <Empty
            icon={User}
            title="Nenhum passageiro cadastrado ainda"
            description="Adicione o primeiro passageiro usando o botão acima."
          />
        )}

        {!isLoading && !error && passengers.length > 0 && filteredPassengers.length === 0 && (
          <Empty
            icon={Search}
            title="Nenhum passageiro encontrado"
            description="Tente ajustar os termos da sua busca."
          />
        )}

        {!isLoading && !error && filteredPassengers.length > 0 && (
          <Table columns={COLUMNS}>
            {paginatedPassengers.map((passenger) => (
              <tr key={passenger.id} className="hover:bg-muted/30">
                <td className="px-6 py-4 font-medium text-foreground">{passenger.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{formatCpf(passenger.cpf)}</td>
                <td className="px-6 py-4 text-muted-foreground">{formatPassengerPhone(passenger.phone)}</td>
                <td className="px-6 py-4">
                  <RowActions>
                    <button
                      type="button"
                      onClick={() => navigate(`/passageiros/editar/${passenger.id}`)}
                      aria-label={`Editar ${passenger.name}`}
                      title="Editar passageiro"
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmPassenger(passenger)}
                      aria-label={`Excluir ${passenger.name}`}
                      title="Excluir passageiro"
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </RowActions>
                </td>
              </tr>
            ))}
          </Table>
        )}

        {!isLoading && !error && filteredPassengers.length > 0 && (
          <Pagination
            currentPage={displayedPage}
            totalPages={totalPages}
            totalItems={filteredPassengers.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            itemName="passageiro"
          />
        )}
      </AdminCard>

      <ConfirmDeleteModal
        passenger={confirmPassenger}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) setConfirmPassenger(null);
        }}
      />
    </div>
  );
}

