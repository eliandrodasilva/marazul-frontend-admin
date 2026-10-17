import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function PasswordInput({
  id,
  label = "Senha",
  value,
  onChange,
  placeholder = "••••••••",
  hasError = false,
  errorMessage = "",
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="text-sm font-medium text-foreground"
      >
        {label}
      </Label>
      <div className="relative">
        <Lock
          className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
            hasError ? "text-destructive" : "text-muted-foreground"
          }`}
        />
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`h-10 w-full rounded-lg border bg-card py-2.5 pl-10 pr-10 text-sm text-foreground shadow-none outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15 ${
            hasError
              ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/15"
              : "border-input"
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {hasError && errorMessage && (
        <p className="mt-0.5 text-xs font-medium text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
