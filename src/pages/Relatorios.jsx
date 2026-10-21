import { BarChart3 } from "lucide-react";
import { Empty, ListCard, PageHeader } from "../components/admin";

export default function Relatorios() {
  return (
    <>
      <PageHeader title="Relatórios" />
      <ListCard title="Relatórios" count={0}>
        <Empty
          icon={BarChart3}
          title="Nenhum relatório disponível"
          text="Os relatórios aparecerão aqui."
          to="/dashboard"
          cta="Voltar ao dashboard"
        />
      </ListCard>
    </>
  );
}
