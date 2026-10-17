import { ArrowLeft, ArrowRight, MailCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import AuthHeader from "../../components/AuthHeader";
import AuthLayout from "../../components/AuthLayout";
import GenericInput from "../../components/GenericInput";
import SubmitButton from "../../components/SubmitButton";
import { CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import api from "../../config/axiosConfig";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRecoverPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("/api/auth/recuperar-senha", { email });
      toast.info("Processando sua solicitação...");

      setIsSubmitted(true);
    } catch (error) {
      if (error.response && error.response.status === 500) {
        toast.error("Erro no servidor", {
          description:
            "Ocorreu um problema tentar enviar o e-mail. Tente mais tarde.",
        });
      } else {
        setIsSubmitted(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout>
        <div className="flex justify-center">
          <div className="relative mt-1 rounded-2xl bg-accent/10 p-4 text-accent">
            <MailCheck className="h-10 w-10" />
          </div>
        </div>
        <h2 className="-mb-1 font-display text-xl font-bold text-foreground">
          E-mail enviado!
        </h2>
        <p className="px-4 text-sm leading-relaxed text-muted-foreground">
          Enviamos um link de recuperação para o endereço de e-mail informado.
          Por favor, verifique sua caixa de entrada ou spam para continuar.
        </p>

        <Link to="/login" className="block w-full">
          <SubmitButton>
            <ArrowLeft className="h-4 w-4" /> Voltar ao Login
          </SubmitButton>
        </Link>

        <CardFooter className="flex justify-center pt-2">
          <div className="flex w-full justify-center border-t pt-6">
            <p className="text-sm text-muted-foreground">
              Não recebeu o e-mail?{" "}
              <button
                onClick={handleRecoverPassword}
                disabled={isLoading}
                className="cursor-pointer font-medium text-accent hover:underline"
              >
                Reenviar e-mail
              </button>
            </p>
          </div>
        </CardFooter>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <CardHeader className="flex flex-col items-center space-y-0">
        <AuthHeader />
        <div className="space-y-2 pt-6 text-center">
          <p className="px-2 text-sm leading-relaxed text-muted-foreground">
            Digite o seu e-mail associado à sua conta para receber um link de
            recuperação para a senha
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleRecoverPassword} className="space-y-6 text-left">
          <div className="space-y-2">
            <GenericInput
              id="email"
              label="E-mail"
              type="email"
              icon={MailCheck}
              placeholder="nome@marazul.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <SubmitButton
            isLoading={isLoading}
            isDisabled={!isEmailValid}
            loadingText="Enviando..."
            icon={ArrowRight}
          >
            Enviar Link de Recuperação
          </SubmitButton>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center pt-2">
        <div className="flex w-full justify-center border-t pt-6">
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para o login
          </Link>
        </div>
      </CardFooter>
    </AuthLayout>
  );
}
