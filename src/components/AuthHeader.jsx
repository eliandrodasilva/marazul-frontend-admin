import logoMarazul from "../assets/logoMarazul.png";
import { CardTitle, CardDescription } from "./ui/card";

export default function AuthHeader() {
  return (
    <>
      <div className="flex flex-col items-center">
        <img
          src={logoMarazul}
          alt="Logo da Marazul"
          className="h-28 object-contain"
        />
      </div>
      <div className="-mt-2 space-y-1 text-center">
        <CardTitle className="font-display text-2xl font-bold tracking-tight text-foreground">
          Marazul
        </CardTitle>
        <CardDescription className="text-sm font-medium text-muted-foreground">
          Painel Administrativo
        </CardDescription>
      </div>
    </>
  );
}
