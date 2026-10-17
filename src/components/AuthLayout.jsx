import { Card } from "./ui/card";

export default function AuthLayout({ children, className = "" }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 text-foreground">
      <Card
        className={`w-full max-w-100 rounded-2xl border bg-card px-5 py-6 text-center shadow-[0_1px_3px_oklch(0.2_0_0/0.04)] ${className}`}
      >
        {children}
      </Card>
    </div>
  );
}
