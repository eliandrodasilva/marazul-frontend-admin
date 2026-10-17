import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function GenericSelect({
  id,
  label,
  labelColor,
  icon: Icon,
  required = false,
  disabled = false,
  value,
  onChange,
  options = [],
  placeholder = "Selecione uma opção",
  hasError = false,
  errorMessage = "",
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
            className={`pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 ${
              hasError ? "text-destructive" : "text-muted-foreground"
            }`}
          />
        )}

        <Select
          required={required}
          disabled={disabled}
          value={value}
          onValueChange={onChange}
        >
          <SelectTrigger
            id={id}
            className={`h-10 w-full rounded-lg border bg-card py-2.5 pr-3.5 text-sm text-foreground shadow-none outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/15 ${
              Icon ? "pl-10" : "pl-3.5"
            } ${
              hasError
                ? "border-destructive focus:border-destructive focus:ring-destructive/15"
                : "border-input"
            }`}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="rounded-lg border bg-popover text-popover-foreground shadow-lg">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasError && errorMessage && (
        <p className="mt-0.5 text-xs font-medium text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
