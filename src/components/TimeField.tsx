import { AlertCircle } from "lucide-react";

export interface TimeFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  invalid?: boolean;
}

export default function TimeField({
  label,
  value,
  onChange,
  placeholder,
  error,
  invalid,
}: TimeFieldProps) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-500 mb-1">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border-0 bg-slate-100 px-3 py-2.5 font-mono text-sm text-slate-800 outline-none transition-all ${
          invalid
            ? "ring-2 ring-rose-400 focus:ring-rose-500"
            : "ring-1 ring-slate-200 focus:ring-2 focus:ring-teal-500 focus:bg-white"
        }`}
      />
      {invalid && error ? (
        <span className="mt-1 flex items-start gap-1 text-xs text-rose-600">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          {error}
        </span>
      ) : null}
    </label>
  );
}
