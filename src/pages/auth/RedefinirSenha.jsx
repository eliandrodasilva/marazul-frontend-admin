import { AlertCircle, ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "../../components/AuthLayout";
import PasswordInput from "../../components/PasswordInput";
import SubmitButton from "../../components/SubmitButton";
import { CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import api from "../../config/axiosConfig";

export default function RedefinirSenha() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const hasMinLength = password.length >= 8;
  const hasLetterAndNumber = /[A-Za-z]/.test(password) && /\d/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";
  const isFormValid = hasMinLength && hasLetterAndNumber && passwordsMatch;
  const showMismatchError =
    confirmPassword.length > 0 && password !== confirmPassword;

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      await api.post("/api/auth/redefinir-senha", {
        token: token,
        novaSenha: password,
      });

      toast.success("Senha redefinida com sucesso!");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.error("Erro ao redefinir a senha", {
        description:
          error.response?.data?.message ||
          "O token pode ter expirado. Solicite um novo link.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <div className="flex justify-center">
          <div className="relative mt-1 rounded-2xl bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="h-10 w-10" />
          </div>
        </div>
        <h2 className="-mb-1 font-display text-xl font-bold text-foreground">
          Link Inválido
        </h2>
        <p className="px-4 text-sm leading-relaxed text-muted-foreground">
          Não foi possível identificar o token de segurança. Por favor, solicite
          um novo link de redefinição de senha para continuar
        </p>

        <Link to="/recuperar-senha" className="block w-full">
          <SubmitButton>Solicitar Novo Link</SubmitButton>
        </Link>

        <CardFooter className="flex justify-center pt-2">
          <div className="flex w-full justify-center border-t pt-6">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-accent transition-colors hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o login
            </Link>
          </div>
        </CardFooter>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <CardHeader className="flex flex-col items-center space-y-0 text-center">
        <div className="space-y-2 pt-4">
          <h2 className="-mb-1 font-display text-xl font-bold text-foreground">
            Redefinir sua Senha
          </h2>
          <p className="px-4 text-sm leading-relaxed text-muted-foreground">
            Escolha uma nova senha para acessar sua conta.
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleResetPassword} className="space-y-5 text-left">
          <PasswordInput
            id="password"
            label="Nova Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirmar Senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            hasError={showMismatchError}
            errorMessage="As senhas não coincidem"
          />

          <div className="space-y-1.5 rounded-xl border bg-muted/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              A senha deve conter:
            </p>

            <div className="mt-1 flex items-center gap-2 text-sm">
              {hasMinLength ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" />
              )}
              <span
                className={
                  hasMinLength
                    ? "font-medium text-success"
                    : "text-muted-foreground"
                }
              >
                Mínimo de 8 caracteres
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {hasLetterAndNumber ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" />
              )}
              <span
                className={
                  hasLetterAndNumber
                    ? "font-medium text-success"
                    : "text-muted-foreground"
                }
              >
                Combinação de letras e números
              </span>
            </div>
          </div>
          <SubmitButton
            isLoading={isLoading}
            isDisabled={!isFormValid}
            loadingText="Atualizando..."
          >
            Atualizar Senha
          </SubmitButton>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center pt-1">
        <div className="flex w-full justify-center border-t pt-5">
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
