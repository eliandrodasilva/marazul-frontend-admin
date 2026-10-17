import { cn } from "../lib/utils";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function GenericInput({
  id,
  label,
  labelColor,
  icon: Icon,
  type = "text",
  required = false,
  value,
  onChange,
  placeholder = "",
  hasError = false,
  errorMessage = "",
  className,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        style={labelColor ? { color: labelColor } : undefined}
        className="text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="text-accent"> *</span>}
      </Label>
      <div className="relative">
        {Icon && (
          <Icon
            className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
              hasError ? "text-destructive" : "text-muted-foreground"
            }`}
          />
        )}
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={cn(
            "h-10 w-full rounded-lg border border-input bg-card py-2.5 pr-3.5 text-sm text-foreground shadow-none outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15",
            Icon ? "pl-10" : "pl-3.5",
            hasError &&
              "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/15",
            className,
          )}
          {...props}
        />
      </div>
      {hasError && errorMessage && (
        <p className="mt-0.5 text-xs font-medium text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
