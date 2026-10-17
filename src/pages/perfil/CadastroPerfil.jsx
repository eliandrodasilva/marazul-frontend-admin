import {
  ArrowLeft,
  Info,
  Loader2,
  RefreshCw,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AdminCard, PageHeader } from "../../components/admin";
import GenericInput from "../../components/GenericInput";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import PerfilService from "../../services/PerfilService";

const PERFIL_PADRAO = "administrador";

const ROTULOS_MODULO = {
  dashboard: "Dashboard",
  funcionario: "Colaboradores",
  frota: "Frota",
  perfis: "Perfis de Acesso",
  permissoes: "Permissões",
};

const ROTULOS_FUNCIONALIDADE = {
  create: "Criar",
  view: "Visualizar",
  edit: "Editar",
  delete: "Excluir",
};

const CadastroPerfil = ({ isEdicao = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [nome, setNome] = useState("");
  const [permissoes, setPermissoes] = useState([]);
  const [permissoesCarregadas, setPermissoesCarregadas] = useState(false);
  const [erroPermissoes, setErroPermissoes] = useState(false);
  const [tentativaCarregamento, setTentativaCarregamento] = useState(0);
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState(
    () => new Set(),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPerfil, setIsLoadingPerfil] = useState(isEdicao);
  const [perfilOriginal, setPerfilOriginal] = useState(null);

  useEffect(() => {
    let active = true;

    PerfilService.getPermissoes()
      .then((data) => {
        if (active) setPermissoes(data);
      })
      .catch(() => {
        if (active) setErroPermissoes(true);
      })
      .finally(() => {
        if (active) setPermissoesCarregadas(true);
      });

    return () => {
      active = false;
    };
  }, [tentativaCarregamento]);

  useEffect(() => {
    if (!isEdicao) return;

    let active = true;

    PerfilService.getById(id)
      .then((data) => {
        if (!active) return;
        const nomePerfil = data?.nome ?? data?.name ?? "";
        const idsVinculados = (data?.permissions ?? []).map((permissao) =>
          String(permissao.id),
        );
        setNome(nomePerfil);
        setPermissoesSelecionadas(new Set(idsVinculados));
        setPerfilOriginal({ nome: nomePerfil, permissoes: idsVinculados });
        setIsLoadingPerfil(false);
      })
      .catch((error) => {
        if (!active) return;
        const status = error.response?.status;
        toast.error(
          status === 404 || status === 400
            ? "Perfil não encontrado."
            : "Erro ao carregar dados do perfil.",
        );
        navigate("/perfis");
      });

    return () => {
      active = false;
    };
  }, [isEdicao, id, navigate]);

  const permissoesPorModulo = useMemo(
    () =>
      permissoes.reduce((grupos, permissao) => {
        const modulo = permissao.rotaBase || "Outros";
        grupos[modulo] ??= [];
        grupos[modulo].push(permissao);
        return grupos;
      }, {}),
    [permissoes],
  );

  const nomeValido = nome.trim() !== "";
  const isFormValid =
    nomeValido &&
    permissoesSelecionadas.size > 0 &&
    permissoesCarregadas &&
    !erroPermissoes;

  const isPerfilPadrao =
    isEdicao && perfilOriginal?.nome.trim().toLowerCase() === PERFIL_PADRAO;
  const camposBloqueados = isLoadingPerfil || isPerfilPadrao;

  const houveAlteracao = useMemo(() => {
    if (!perfilOriginal) return false;
    if (nome.trim() !== perfilOriginal.nome.trim()) return true;
    if (permissoesSelecionadas.size !== perfilOriginal.permissoes.length)
      return true;
    return perfilOriginal.permissoes.some(
      (permissaoId) => !permissoesSelecionadas.has(permissaoId),
    );
  }, [nome, perfilOriginal, permissoesSelecionadas]);

  const podeSalvar =
    isFormValid &&
    !isSaving &&
    (!isEdicao || (houveAlteracao && !camposBloqueados));

  const togglePermissao = (id) => {
    setPermissoesSelecionadas((atuais) => {
      const atualizadas = new Set(atuais);
      const permissaoId = String(id);
      if (atualizadas.has(permissaoId)) atualizadas.delete(permissaoId);
      else atualizadas.add(permissaoId);
      return atualizadas;
    });
  };

  const toggleModulo = (permissoesDoModulo, checked) => {
    setPermissoesSelecionadas((atuais) => {
      const atualizadas = new Set(atuais);
      permissoesDoModulo.forEach(({ id }) => {
        if (checked) atualizadas.add(String(id));
        else atualizadas.delete(String(id));
      });
      return atualizadas;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!podeSalvar) return;

    setIsSaving(true);
    try {
      const payload = {
        nome: nome.trim(),
        permissionsIds: Array.from(permissoesSelecionadas),
      };
      if (isEdicao) {
        await PerfilService.update(id, payload);
        toast.success("Perfil atualizado com sucesso!");
      } else {
        await PerfilService.create(payload);
        toast.success("Perfil cadastrado com sucesso!");
      }
      navigate("/perfis");
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 400) {
        toast.error(
          data?.message ||
            data?.erro ||
            `Não foi possível ${isEdicao ? "atualizar" : "cadastrar"} o perfil.`,
        );
      } else if (isEdicao && status === 404) {
        toast.error("Perfil não encontrado.");
        navigate("/perfis");
      } else {
        toast.error(`Erro ao ${isEdicao ? "atualizar" : "cadastrar"} perfil`, {
          description:
            "Ocorreu um problema ao salvar os dados. Tente novamente.",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdicao ? "Editar perfil" : "Cadastro de perfil"}
        subtitle="Defina o nome e as permissões de acesso do perfil."
      />

      <AdminCard>
        <div className="flex items-center gap-2.5 border-b border-border px-6 py-4">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold text-foreground">
            Informações do perfil
          </h2>
        </div>

        <div className="p-6">
          <form id="form-perfil" onSubmit={handleSubmit} className="space-y-6">
            {isPerfilPadrao && (
              <div
                className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
                role="note"
              >
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>
                  Este é o perfil padrão do sistema. O nome e as permissões não
                  podem ser alterados.
                </p>
              </div>
            )}

            <GenericInput
              id="nome-perfil"
              label="NOME DO PERFIL"
              type="text"
              placeholder="Ex: Atendimento"
              required
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              disabled={camposBloqueados}
            />

            <section aria-labelledby="permissoes-heading" className="space-y-4">
              <div>
                <h3
                  id="permissoes-heading"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  PERMISSÕES <span className="text-accent">*</span>
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Selecione ao menos uma permissão para este perfil.
                </p>
              </div>

              {isEdicao && !isLoadingPerfil && !isPerfilPadrao && (
                <div
                  className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning"
                  role="note"
                >
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    As alterações de permissões passam a valer para os
                    colaboradores vinculados a partir do próximo login.
                  </p>
                </div>
              )}

              {!permissoesCarregadas || isLoadingPerfil ? (
                <div
                  className="flex min-h-24 items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground"
                  role="status"
                >
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  {isLoadingPerfil
                    ? "Carregando dados do perfil..."
                    : "Carregando permissões..."}
                </div>
              ) : erroPermissoes ? (
                <div className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 text-center">
                  <p className="text-sm text-destructive">
                    Não foi possível carregar as permissões.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPermissoesCarregadas(false);
                      setErroPermissoes(false);
                      setTentativaCarregamento((tentativa) => tentativa + 1);
                    }}
                    className="h-8 cursor-pointer gap-2 rounded-xl border-destructive/20 bg-card px-3 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Tentar novamente
                  </Button>
                </div>
              ) : permissoes.length === 0 ? (
                <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  Nenhuma permissão disponível.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Object.entries(permissoesPorModulo).map(
                    ([modulo, permissoesDoModulo]) => {
                      const selecionadasNoModulo = permissoesDoModulo.filter(
                        ({ id }) => permissoesSelecionadas.has(String(id)),
                      ).length;
                      const todasSelecionadas =
                        selecionadasNoModulo === permissoesDoModulo.length;

                      return (
                        <fieldset
                          key={modulo}
                          className="rounded-xl border border-border bg-background/50 p-4"
                        >
                          <legend className="px-1.5 text-sm font-semibold text-foreground">
                            {ROTULOS_MODULO[modulo] ?? modulo}
                          </legend>
                          <div className="grid grid-cols-1 gap-x-6 gap-y-3 pb-3 sm:grid-cols-2">
                            {permissoesDoModulo.map((permissao) => (
                              <div
                                key={permissao.id}
                                className="flex items-center gap-2.5"
                              >
                                <Checkbox
                                  id={`permissao-${permissao.id}`}
                                  checked={permissoesSelecionadas.has(
                                    String(permissao.id),
                                  )}
                                  onCheckedChange={() =>
                                    togglePermissao(permissao.id)
                                  }
                                  disabled={camposBloqueados}
                                  className="rounded-[4px] border-input bg-card cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                />
                                <Label
                                  htmlFor={`permissao-${permissao.id}`}
                                  className="cursor-pointer text-sm font-normal text-foreground"
                                >
                                  {ROTULOS_FUNCIONALIDADE[
                                    permissao.funcionalidade
                                  ] ?? permissao.funcionalidade}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-2.5 border-t border-border pt-3">
                            <Checkbox
                              id={`modulo-${modulo}`}
                              checked={
                                todasSelecionadas
                                  ? true
                                  : selecionadasNoModulo > 0
                                    ? "indeterminate"
                                    : false
                              }
                              onCheckedChange={(checked) =>
                                toggleModulo(
                                  permissoesDoModulo,
                                  checked === true,
                                )
                              }
                              disabled={camposBloqueados}
                              className="rounded-[4px] border-input bg-card cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                            <Label
                              htmlFor={`modulo-${modulo}`}
                              className="cursor-pointer text-xs font-medium text-muted-foreground"
                            >
                              Selecionar todas
                            </Label>
                          </div>
                        </fieldset>
                      );
                    },
                  )}
                </div>
              )}
            </section>
          </form>
        </div>

        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/perfis")}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          {!isPerfilPadrao && (
            <Button
              type="submit"
              form="form-perfil"
              disabled={!podeSalvar}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" /> Salvar
                </>
              )}
            </Button>
          )}
        </div>
      </AdminCard>
    </div>
  );
};

export default CadastroPerfil;

