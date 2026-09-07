import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium uppercase tracking-wider text-zinc-400"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-sm transition-colors focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/60 ${
          error ? "border-rose-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  );
}
