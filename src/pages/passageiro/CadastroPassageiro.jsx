import { ArrowLeft, CreditCard, Loader2, Phone, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AdminCard, PageHeader, Section } from "../../components/admin";
import GenericInput from "../../components/GenericInput";
import { Button } from "../../components/ui/button";
import { formatCpf, isValidCpf, onlyDigits } from "../../lib/documentMasks";
import { formatPhone } from "../../lib/phoneMasks";
import PassageiroService from "../../services/PassageiroService";

export default function CadastroPassageiro({ isEdicao = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdicao);
  const [loadError, setLoadError] = useState("");
  const [reload, setReload] = useState(0);
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    if (!isEdicao) return;
    let active = true;
    PassageiroService.getById(id)
      .then((passenger) => {
        if (!active) return;
        const initialData = PassageiroService.buildPayload(passenger);
        setName(passenger.name ?? "");
        setCpf(formatCpf(passenger.cpf));
        setPhone(formatPhone(passenger.phone));
        setOriginalData(initialData);
        setLoadError("");
      })
      .catch(() => {
        if (active) setLoadError("Não foi possível carregar o passageiro. Tente novamente.");
      })
      .finally(() => {
        if (active) setIsFetching(false);
      });
    return () => { active = false; };
  }, [id, isEdicao, reload]);

  const nameValid = name.trim().length > 0;
  const cpfValid = isValidCpf(cpf);
  const phoneDigits = onlyDigits(phone);
  const phoneValid = phoneDigits.length === 0 || phoneDigits.length === 11;
  const isFormValid = nameValid && cpfValid && phoneValid;
  const currentData = PassageiroService.buildPayload({ name: name.trim(), cpf, phone });
  const hasChanges = originalData !== null && (
    currentData.name !== originalData.name ||
    currentData.cpf !== originalData.cpf ||
    currentData.phone !== originalData.phone
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isFormValid || isSaving || isFetching || (isEdicao && (!originalData || !hasChanges))) return;

    setIsSaving(true);
    try {
      if (isEdicao) {
        await PassageiroService.update(id, currentData);
        toast.success("Passageiro atualizado com sucesso!");
      } else {
        await PassageiroService.create(currentData);
        toast.success("Passageiro cadastrado com sucesso!");
      }
      navigate("/passageiros");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.erro ||
          `Não foi possível ${isEdicao ? "atualizar" : "cadastrar"} o passageiro. Tente novamente.`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={isEdicao ? "Editar passageiro" : "Cadastro de passageiro"} />

      <AdminCard>
        {isFetching && (
          <div role="status" className="flex items-center gap-2 px-6 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Carregando passageiro...
          </div>
        )}
        {loadError && (
          <div role="alert" className="px-6 py-4 text-sm text-destructive">
            {loadError}{" "}
            <Button
              variant="outline"
              onClick={() => {
                setIsFetching(true);
                setLoadError("");
                setReload((value) => value + 1);
              }}
              className="ml-2 rounded-xl"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        <form id="form-passageiro" onSubmit={handleSubmit}>
          <fieldset disabled={isFetching || isSaving || Boolean(loadError)}>
            <Section icon={User} title="Informações do passageiro">
              <div className="sm:col-span-2">
                <GenericInput
                  id="name"
                  label="Nome"
                  icon={User}
                  placeholder="Nome do passageiro"
                  required
                  maxLength={255}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  hasError={name.length > 0 && !nameValid}
                  errorMessage="Informe um nome válido"
                />
              </div>
              <GenericInput
                id="cpf"
                label="CPF"
                icon={CreditCard}
                placeholder="000.000.000-00"
                required
                inputMode="numeric"
                maxLength={14}
                value={cpf}
                onChange={(event) => setCpf(formatCpf(event.target.value))}
                hasError={cpf.length > 0 && !cpfValid}
                errorMessage="Informe um CPF válido"
              />
              <GenericInput
                id="phone"
                label="Telefone"
                icon={Phone}
                placeholder="(11) 99999-9999"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={15}
                value={phone}
                onBeforeInput={(event) => {
                  if (event.data && /\D/.test(event.data)) event.preventDefault();
                }}
                onChange={(event) => setPhone(formatPhone(event.target.value))}
                hasError={phone.length > 0 && !phoneValid}
                errorMessage="Informe um telefone com 11 dígitos"
              />
            </Section>
          </fieldset>
        </form>

        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/passageiros")}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <Button
            type="submit"
            form="form-passageiro"
            disabled={!isFormValid || isSaving || isFetching || Boolean(loadError) || (isEdicao && !hasChanges)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" /> Salvar passageiro
              </>
            )}
          </Button>
        </div>
      </AdminCard>
    </div>
  );
}

