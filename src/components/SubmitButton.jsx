import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

export default function SubmitButton({
  isLoading,
  isDisabled,
  loadingText = "Processando...",
  children,
  icon: Icon,
}) {
  return (
    <Button
      type="submit"
      disabled={isDisabled || isLoading}
      className="mt-2 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
    >
      {isLoading ? (
        <>
          {loadingText} <Loader2 className="h-4 w-4 animate-spin" />
        </>
      ) : (
        <>
          {children} {Icon && <Icon className="h-4 w-4" />}
        </>
      )}
    </Button>
  );
}
