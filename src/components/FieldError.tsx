import { AlertCircle } from "lucide-react";

export interface FieldErrorProps {
  message: string;
}

export default function FieldError({ message }: FieldErrorProps) {
  return (
    <span className="flex items-start gap-1 text-xs text-rose-600 bg-rose-50/60 rounded-lg px-3 py-2 ring-1 ring-rose-100">
      <AlertCircle size={12} className="mt-0.5 shrink-0" />
      {message}
    </span>
  );
}
