import { ArrowLeft, Bus, ClipboardCheck, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AdminCard, PageHeader, Section } from "../components/admin";
import GenericInput from "../components/GenericInput";
import GenericSelect from "../components/GenericSelect";
import FrotaService from "../services/FrotaService";

const PLACA_REGEX = /^[A-Z]{3}-?\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/;
const PREFIX_REGEX = /^[A-Za-z0-9]+$/;

function formatPlaca(raw) {
  const clean = raw
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 7);

  if (clean.length > 3 && /^[A-Z]{3}\d+$/.test(clean)) {
    return clean.slice(0, 3) + "-" + clean.slice(3);
  }

  return clean;
}

export default function CadastroFrota() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [isLoading, setIsLoading] = useState(Boolean(id));

  const [enums, setEnums] = useState({
    models: [],
    types: [],
    statuses: [],
  });

  const [form, setForm] = useState({
    prefix: "",
    licensePlate: "",
    model: "MARCOPOLO",
    year: "",
    type: "DD",
    seats: "",
    status: "ACTIVE",
    inspectionDate: "",
  });

  useEffect(() => {
    let active = true;
    FrotaService.getEnums().then((data) => {
      if (active && data) {
        setEnums(data);
        if (!isEditing) {
          setForm((prev) => ({
            ...prev,
            model:
              prev.model && data.models?.some((m) => m.value === prev.model)
                ? prev.model
                : data.models?.[0]?.value || "MARCOPOLO",
            type:
              prev.type && data.types?.some((t) => t.value === prev.type)
                ? prev.type
                : data.types?.[0]?.value || "DD",
            status:
              prev.status && data.statuses?.some((s) => s.value === prev.status)
                ? prev.status
                : data.statuses?.find((s) => s.value === "ACTIVE")?.value ||
                  data.statuses?.[0]?.value ||
                  "ACTIVE",
          }));
        }
      }
    });
    return () => {
      active = false;
    };
  }, [isEditing]);

  useEffect(() => {
    if (id) {
      FrotaService.getById(id)
        .then((data) => {
          if (data) {
            setForm({
              prefix: data.prefix || "",
              licensePlate: formatPlaca(data.licensePlate || ""),
              model: data.model || "MARCOPOLO",
              year: data.year ? String(data.year) : "",
              type: data.type || "DD",
              seats: data.seats ? String(data.seats) : "",
              status: data.status || "ACTIVE",
              inspectionDate: data.inspectionDate || "",
            });
          }
        })
        .catch(() => {
          toast.error("Erro ao carregar dados do veículo.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePlacaChange = (e) => {
    setForm((prev) => ({ ...prev, licensePlate: formatPlaca(e.target.value) }));
  };

  const handleNumeroChange = (field, maxLen) => (e) => {
    const numericValue = e.target.value.replace(/\D/g, "").slice(0, maxLen);
    setForm((prev) => ({ ...prev, [field]: numericValue }));
  };

  const handleSelectChange = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const placaValida = PLACA_REGEX.test(form.licensePlate.replace("-", ""));
  const placaTemErro = form.licensePlate.length > 0 && !placaValida;

  const prefixValido = PREFIX_REGEX.test(form.prefix.trim());
  const prefixTemErro = form.prefix.length > 0 && !prefixValido;

  const anoValido = form.year.length === 4 && Number(form.year) >= 1950;
  const anoTemErro = form.year.length > 0 && !anoValido;

  const assentosValidos = form.seats.length > 0 && Number(form.seats) > 0;
  const assentosTemErro = form.seats.length > 0 && !assentosValidos;

  const dataVistoriaValida = form.inspectionDate.trim() !== "";

  const isFormValid =
    prefixValido &&
    placaValida &&
    anoValido &&
    assentosValidos &&
    form.model !== "" &&
    form.type !== "" &&
    form.status !== "" &&
    dataVistoriaValida;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);

    const payload = {
      prefix: form.prefix.trim(),
      licensePlate: form.licensePlate.trim().toUpperCase(),
      model: form.model,
      type: form.type,
      year: Number(form.year),
      seats: Number(form.seats),
      status: form.status,
      inspectionDate: form.inspectionDate.trim(),
    };

    try {
      if (isEditing) {
        await FrotaService.update(id, payload);
        toast.success("Veículo atualizado com sucesso!");
      } else {
        await FrotaService.create(payload);
        toast.success("Veículo cadastrado com sucesso!");
      }
      navigate("/frota");
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 409) {
        toast.error("Conflito de cadastro", {
          description:
            data?.message ||
            data?.erro ||
            "Já existe um veículo cadastrado com esta placa.",
        });
      } else {
        toast.error(
          isEditing ? "Erro ao atualizar veículo" : "Erro ao cadastrar veículo",
          {
            description:
              data?.message ||
              data?.erro ||
              "Ocorreu um problema ao salvar os dados. Tente novamente.",
          },
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={isEditing ? "Edição de veículo" : "Cadastro de veículo"}
        subtitle="Preencha as informações do novo ônibus."
      />

      <AdminCard>
        <form id="form-frota" onSubmit={handleSubmit}>
          <div className="divide-y">
            <Section
              icon={Bus}
              title="Identificação"
              desc="Dados principais do veículo."
            >
              <GenericInput
                id="prefix"
                label="Prefixo"
                type="text"
                placeholder="Ex: 18001"
                pattern="[A-Za-z0-9]+"
                required
                value={form.prefix}
                onChange={handleChange("prefix")}
                hasError={prefixTemErro}
                errorMessage="Informe apenas letras e numeros"
              />

              <GenericInput
                id="licensePlate"
                label="Placa"
                type="text"
                placeholder="ABC-1234 ou ABC1D23"
                maxLength={8}
                required
                value={form.licensePlate}
                onChange={handlePlacaChange}
                hasError={placaTemErro}
                errorMessage="Formato inválido. Use ABC-1234 ou ABC1D23"
                className="uppercase"
              />

              <GenericSelect
                id="model"
                label="Marca"
                required
                value={form.model}
                onChange={handleSelectChange("model")}
                options={enums.models}
                placeholder="Selecione a marca"
              />

              <GenericSelect
                id="type"
                label="Tipo"
                required
                value={form.type}
                onChange={handleSelectChange("type")}
                options={enums.types}
                placeholder="Selecione o tipo"
              />

              <GenericInput
                id="year"
                label="Ano de fabricação"
                type="text"
                inputMode="numeric"
                placeholder="Ex: 2024"
                maxLength={4}
                required
                value={form.year}
                onChange={handleNumeroChange("year", 4)}
                hasError={anoTemErro}
                errorMessage="Informe um ano válido com 4 dígitos (mínimo 1950)"
              />

              <GenericInput
                id="seats"
                label="Quantidade de assentos"
                type="text"
                inputMode="numeric"
                placeholder="Ex: 46"
                maxLength={3}
                required
                value={form.seats}
                onChange={handleNumeroChange("seats", 3)}
                hasError={assentosTemErro}
                errorMessage="Informe uma quantidade válida de assentos"
              />
            </Section>

            <Section
              icon={ClipboardCheck}
              title="Situação"
              desc="Status e vistoria."
            >
              <GenericSelect
                id="status"
                label="Status"
                required
                value={form.status}
                onChange={handleSelectChange("status")}
                options={enums.statuses}
                placeholder="Selecione o status"
              />

              <GenericInput
                id="inspectionDate"
                label="Data de vistoria"
                type="date"
                required
                value={form.inspectionDate}
                onChange={handleChange("inspectionDate")}
              />
            </Section>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t bg-muted/40 px-6 py-4">
            <button
              type="button"
              onClick={() => navigate("/frota")}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <button
              type="submit"
              form="form-frota"
              disabled={!isFormValid || isLoading}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar veículo
                </>
              )}
            </button>
          </div>
        </form>
      </AdminCard>
    </div>
  );
}
