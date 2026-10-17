import { ArrowLeft, Contact, Loader2, MapPin, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AdminCard, PageHeader, Section } from "../../components/admin";
import GenericInput from "../../components/GenericInput";
import GenericSelect from "../../components/GenericSelect";
import {
  formatCnpj,
  formatCpf,
  isValidCnpj,
  isValidCpf,
  onlyDigits,
} from "../../lib/documentMasks";
import ClienteService from "../../services/ClienteService";
import LocalidadeService from "../../services/LocalidadeService";

const PERSON_TYPE_OPTIONS = [
  { value: "PF", label: "Pessoa Física" },
  { value: "PJ", label: "Pessoa Jurídica" },
];

const DOCUMENT_CONFIG = {
  PF: {
    label: "CPF",
    placeholder: "000.000.000-00",
    maxLength: 14,
    format: formatCpf,
    validate: isValidCpf,
    errorMessage: "Informe um CPF válido",
  },
  PJ: {
    label: "CNPJ",
    placeholder: "00.000.000/0000-00",
    maxLength: 18,
    format: formatCnpj,
    validate: isValidCnpj,
    errorMessage: "Informe um CNPJ válido",
  },
};

function toCityOptions(data) {
  return (Array.isArray(data) ? data : []).map((city) => ({
    value: String(city.id),
    label: city.name,
  }));
}

export default function CadastroCliente({ isEdicao = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingClient, setIsLoadingClient] = useState(isEdicao);
  const [initialForm, setInitialForm] = useState(null);

  const [form, setForm] = useState({
    name: "",
    personType: "PF",
    document: "",
    street: "",
    number: "",
    complement: "",
    stateId: "",
    cityId: "",
  });

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const selectedStateRef = useRef("");

  useEffect(() => {
    let active = true;

    LocalidadeService.getEstados()
      .then((data) => {
        if (!active) return;
        setStates(
          (Array.isArray(data) ? data : []).map((state) => ({
            value: String(state.id),
            label: `${state.name} (${state.acronym})`,
          })),
        );
      })
      .catch(() => {
        if (active) toast.error("Não foi possível carregar os estados.");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isEdicao) return;

    let active = true;

    ClienteService.getById(id)
      .then(async (client) => {
        const address = client?.address ?? {};
        const city = address.cityId
          ? await LocalidadeService.getCidadeById(address.cityId)
          : null;
        const stateId = city?.stateId ? String(city.stateId) : "";
        const cityList = stateId
          ? await LocalidadeService.getCidades(stateId)
          : [];

        if (!active) return;

        const personType = onlyDigits(client?.cnpj) ? "PJ" : "PF";
        const loadedForm = {
          name: client?.name ?? "",
          personType,
          document: DOCUMENT_CONFIG[personType].format(
            personType === "PJ" ? client.cnpj : client?.cpf,
          ),
          street: address.street ?? "",
          number: address.number ?? "",
          complement: address.complement ?? "",
          stateId,
          cityId: address.cityId ? String(address.cityId) : "",
        };

        selectedStateRef.current = stateId;
        setCities(toCityOptions(cityList));
        setForm(loadedForm);
        setInitialForm(loadedForm);
        setIsLoadingClient(false);
      })
      .catch((error) => {
        if (!active) return;
        const status = error.response?.status;
        toast.error(
          status === 404 || status === 400
            ? "Cliente não encontrado."
            : "Erro ao carregar dados do cliente.",
        );
        navigate("/clientes");
      });

    return () => {
      active = false;
    };
  }, [isEdicao, id, navigate]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePersonTypeChange = (value) => {
    setForm((prev) =>
      prev.personType === value
        ? prev
        : { ...prev, personType: value, document: "" },
    );
  };

  const handleDocumentChange = (e) => {
    const { format } = DOCUMENT_CONFIG[form.personType];
    setForm((prev) => ({ ...prev, document: format(e.target.value) }));
  };

  const handleStateChange = (value) => {
    if (!value || value === form.stateId) return;

    selectedStateRef.current = value;
    setForm((prev) => ({ ...prev, stateId: value, cityId: "" }));
    setCities([]);
    setIsLoadingCities(true);

    LocalidadeService.getCidades(value)
      .then((data) => {
        if (selectedStateRef.current !== value) return;
        setCities(toCityOptions(data));
      })
      .catch(() => {
        if (selectedStateRef.current !== value) return;
        toast.error("Não foi possível carregar as cidades do estado.");
      })
      .finally(() => {
        if (selectedStateRef.current === value) setIsLoadingCities(false);
      });
  };

  const handleCityChange = (value) => {
    if (!value) return;
    setForm((prev) => ({ ...prev, cityId: value }));
  };

  const documentConfig = DOCUMENT_CONFIG[form.personType];

  const nomeValido = form.name.trim().length > 0;
  const nomeTemErro = form.name.length > 0 && !nomeValido;

  const documentoValido = documentConfig.validate(form.document);
  const documentoCompleto = form.document.length === documentConfig.maxLength;
  const documentoTemErro = documentoCompleto && !documentoValido;

  const ruaValida = form.street.trim().length > 0;
  const ruaTemErro = form.street.length > 0 && !ruaValida;

  const numeroValido = form.number.trim().length > 0;
  const numeroTemErro = form.number.length > 0 && !numeroValido;

  const isFormValid =
    nomeValido &&
    documentoValido &&
    ruaValida &&
    numeroValido &&
    form.stateId !== "" &&
    form.cityId !== "";

  const houveAlteracao =
    !isEdicao ||
    (initialForm !== null &&
      Object.keys(form).some((field) => form[field] !== initialForm[field]));

  const podeSalvar =
    isFormValid && houveAlteracao && !isSaving && !isLoadingClient;

  const getCityPlaceholder = () => {
    if (!form.stateId) return "Selecione um estado primeiro";
    if (isLoadingCities) return "Carregando cidades...";
    return "Selecione a cidade";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!podeSalvar) return;

    setIsSaving(true);

    const document = onlyDigits(form.document);
    const payload = {
      name: form.name.trim(),
      cpf: form.personType === "PF" ? document : "",
      cnpj: form.personType === "PJ" ? document : "",
      address: {
        street: form.street,
        number: form.number,
        complement: form.complement,
        cityId: form.cityId,
      },
    };

    try {
      if (isEdicao) {
        await ClienteService.update(id, payload);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await ClienteService.create(payload);
        toast.success("Cliente cadastrado com sucesso!");
      }
      navigate("/clientes");
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (isEdicao && status === 404) {
        toast.error("Cliente não encontrado.");
        navigate("/clientes");
        return;
      }

      const backendMessage =
        status === 400 || status === 409 ? data?.message || data?.erro : null;

      toast.error(`Erro ao ${isEdicao ? "atualizar" : "cadastrar"} cliente`, {
        description:
          backendMessage ||
          "Ocorreu um problema ao salvar os dados. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={isEdicao ? "Editar cliente" : "Cadastro de cliente"}
        subtitle="Dados do contratante e endereço."
      />

      <AdminCard>
        <form id="form-cliente" onSubmit={handleSubmit}>
          <div className="divide-y">
            <Section icon={Contact} title="Dados do cliente">
              <div className="sm:col-span-2">
                <GenericInput
                  id="name"
                  label="Nome"
                  type="text"
                  placeholder="Ex: Maria da Silva"
                  required
                  disabled={isLoadingClient}
                  value={form.name}
                  onChange={handleChange("name")}
                  hasError={nomeTemErro}
                  errorMessage="O nome não pode conter apenas espaços"
                />
              </div>

              <GenericSelect
                id="personType"
                label="Tipo de pessoa"
                required
                disabled={isLoadingClient}
                value={form.personType}
                onChange={handlePersonTypeChange}
                options={PERSON_TYPE_OPTIONS}
                placeholder="Selecione o tipo de pessoa"
              />

              <GenericInput
                id="document"
                label={documentConfig.label}
                type="text"
                inputMode="numeric"
                placeholder={documentConfig.placeholder}
                maxLength={documentConfig.maxLength}
                required
                disabled={isLoadingClient}
                value={form.document}
                onChange={handleDocumentChange}
                hasError={documentoTemErro}
                errorMessage={documentConfig.errorMessage}
              />
            </Section>

            <Section icon={MapPin} title="Endereço">
              <GenericInput
                id="street"
                label="Rua"
                type="text"
                placeholder="Ex: Rua das Gaivotas"
                required
                disabled={isLoadingClient}
                value={form.street}
                onChange={handleChange("street")}
                hasError={ruaTemErro}
                errorMessage="A rua não pode conter apenas espaços"
              />

              <GenericInput
                id="number"
                label="Número"
                type="text"
                placeholder="Ex: 120"
                maxLength={10}
                required
                disabled={isLoadingClient}
                value={form.number}
                onChange={handleChange("number")}
                hasError={numeroTemErro}
                errorMessage="O número não pode conter apenas espaços"
              />

              <div className="sm:col-span-2">
                <GenericInput
                  id="complement"
                  label="Complemento"
                  type="text"
                  placeholder="Ex: Sala 2, Bloco B"
                  disabled={isLoadingClient}
                  value={form.complement}
                  onChange={handleChange("complement")}
                />
              </div>

              <GenericSelect
                id="state"
                label="Estado"
                required
                disabled={isLoadingClient}
                value={form.stateId}
                onChange={handleStateChange}
                options={states}
                placeholder="Selecione o estado"
              />

              <GenericSelect
                id="city"
                label="Cidade"
                required
                disabled={isLoadingClient || !form.stateId || isLoadingCities}
                value={form.cityId}
                onChange={handleCityChange}
                options={cities}
                placeholder={getCityPlaceholder()}
              />
            </Section>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t bg-muted/40 px-6 py-4">
            <button
              type="button"
              onClick={() => navigate("/clientes")}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <button
              type="submit"
              form="form-cliente"
              disabled={!podeSalvar}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar cliente
                </>
              )}
            </button>
          </div>
        </form>
      </AdminCard>
    </div>
  );
}
