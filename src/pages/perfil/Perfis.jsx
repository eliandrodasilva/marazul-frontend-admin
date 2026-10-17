import {
  AlertCircle,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AdminCard, Empty, PageHeader, PrimaryLink, RowActions, Table } from "../../components/admin";
import Pagination from "../../components/Pagination";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import PerfilService from "../../services/PerfilService";

const ITEMS_PER_PAGE = 8;

function ConfirmDeleteModal({ profile, isLoading, onConfirm, onCancel }) {
  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Fechar confirmação"
        onClick={onCancel}
        disabled={isLoading}
        className="absolute inset-0 cursor-pointer bg-foreground/40 backdrop-blur-sm disabled:cursor-not-allowed"
      />
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        className="relative z-10 mx-4 w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-2xl"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Fechar confirmação"
          className="absolute right-4 top-4 cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Trash2 className="h-8 w-8" />
          </div>
          <div>
            <h2
              id="confirm-delete-title"
              className="text-xl font-bold text-foreground"
            >
              Excluir perfil
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Deseja realmente excluir o perfil{" "}
              <span className="font-semibold text-foreground">
                {profile.name ?? profile.nome}
              </span>
              ?
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta ação não poderá ser desfeita.
            </p>
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-11 flex-1 cursor-pointer rounded-xl text-sm font-medium disabled:cursor-not-allowed"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-11 flex-1 cursor-pointer rounded-xl bg-destructive text-sm font-medium text-destructive-foreground hover:opacity-90 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Confirmar exclusão"
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function Perfis() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    PerfilService.getAll()
      .then((data) => {
        if (active) setProfiles(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar a lista de perfis.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryCount]);

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");
  const filteredProfiles = useMemo(
    () =>
      profiles.filter((profile) =>
        String(profile.name ?? profile.nome ?? "")
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch),
      ),
    [profiles, normalizedSearch],
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE),
  );
  const displayedPage = Math.min(currentPage, totalPages);
  const paginatedProfiles = useMemo(() => {
    const startIndex = (displayedPage - 1) * ITEMS_PER_PAGE;
    return filteredProfiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProfiles, displayedPage]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((count) => count + 1);
  };

  const handleDelete = async () => {
    if (!profileToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await PerfilService.delete(profileToDelete.id);
      setProfiles((current) =>
        current.filter((profile) => profile.id !== profileToDelete.id),
      );
      const remainingProfiles = filteredProfiles.length - 1;
      const remainingPages = Math.max(
        1,
        Math.ceil(remainingProfiles / ITEMS_PER_PAGE),
      );
      setCurrentPage((page) => Math.min(page, remainingPages));
      toast.success("Perfil excluído com sucesso!");
    } catch (requestError) {
      const status = requestError.response?.status;
      const data = requestError.response?.data;

      if (status === 400) {
        toast.error(
          data?.message || data?.erro || "Não foi possível excluir este perfil.",
        );
      } else if (status === 404) {
        toast.warning("Perfil não encontrado", {
          description: "O perfil já foi removido. A listagem foi atualizada.",
        });
        handleRetry();
      } else {
        toast.error("Erro ao excluir perfil", {
          description: "Ocorreu um problema. Tente novamente.",
        });
      }
    } finally {
      setIsDeleting(false);
      setProfileToDelete(null);
    }
  };

  const columns = ["Nome do perfil", "Permissões", ""];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfis de acesso"
        subtitle="Controle o que cada perfil pode fazer."
        action={<PrimaryLink onClick={() => navigate("/perfis/cadastro")}>Novo perfil</PrimaryLink>}
      />

      <AdminCard>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-foreground">
              Listagem de perfis
            </h2>
            {!isLoading && !error && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {filteredProfiles.length}
              </span>
            )}
          </div>
          {!isLoading && !error && profiles.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-perfis"
                aria-label="Buscar perfis pelo nome"
                placeholder="Buscar perfil..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 rounded-xl border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
              />
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-muted" />
              <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Carregando perfis...
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Buscando os perfis de acesso cadastrados
              </p>
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="max-w-xs text-center">
              <p className="text-sm font-semibold text-destructive">{error}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Verifique sua conexão e tente novamente.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleRetry}
              className="mt-1 cursor-pointer gap-2 rounded-xl border-destructive/20 text-xs font-medium text-destructive hover:bg-destructive/10"
            >
              <RefreshCw className="h-4 w-4" /> Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !error && profiles.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="max-w-xs text-center">
              <p className="text-base font-semibold text-foreground">
                Nenhum perfil cadastrado ainda
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cadastre o primeiro perfil de acesso para organizar as permissões.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => navigate("/perfis/cadastro")}
              className="mt-1 cursor-pointer gap-2 rounded-xl bg-primary font-medium text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Novo Perfil
            </Button>
          </div>
        )}

        {!isLoading &&
          !error &&
          profiles.length > 0 &&
          filteredProfiles.length === 0 && (
            <Empty
              icon={Search}
              title="Nenhum perfil encontrado"
              description="Tente ajustar os termos da sua busca."
            />
          )}

        {!isLoading && !error && filteredProfiles.length > 0 && (
          <Table columns={columns}>
            {paginatedProfiles.map((profile) => {
              const name = profile.name ?? profile.nome ?? "Perfil sem nome";
              const permissionCount = Array.isArray(profile.permissions)
                ? profile.permissions.length
                : 0;
              const isSystemProfile =
                name.toLocaleLowerCase("pt-BR") === "administrador";

              return (
                <tr key={profile.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="h-4 w-4 text-accent" />
                      <span className="font-medium text-foreground">{name}</span>
                      {isSystemProfile && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Padrão do sistema
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${Math.min(100, (permissionCount / 27) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        <span className="font-semibold text-foreground">{permissionCount}</span>{" "}
                        {permissionCount === 1 ? "permissão" : "permissões"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RowActions>
                      <button
                        type="button"
                        onClick={() => navigate(`/perfis/editar/${profile.id}`)}
                        title="Editar perfil"
                        aria-label={`Editar perfil ${name}`}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setProfileToDelete(profile)}
                        disabled={isSystemProfile}
                        title={
                          isSystemProfile
                            ? "O perfil padrão não pode ser excluído"
                            : "Excluir perfil"
                        }
                        aria-label={`Excluir perfil ${name}`}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </RowActions>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}

        {!isLoading && !error && filteredProfiles.length > 0 && (
          <Pagination
            currentPage={displayedPage}
            totalPages={totalPages}
            totalItems={filteredProfiles.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            itemName="perfil"
            itemNamePlural="perfis"
          />
        )}
      </AdminCard>

      <ConfirmDeleteModal
        profile={profileToDelete}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) setProfileToDelete(null);
        }}
      />
    </div>
  );
}

