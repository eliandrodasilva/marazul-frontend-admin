import { Map } from "lucide-react";
import { Empty, ListCard, PageHeader } from "../components/admin";

export default function Viagens() {
  return (
    <>
      <PageHeader title="Viagens" />
      <ListCard title="Viagens" count={0}>
        <Empty
          icon={Map}
          title="Nenhuma viagem programada"
          text="As viagens aparecerão aqui."
          to="/frota"
          cta="Ver frota"
        />
      </ListCard>
    </>
  );
}
