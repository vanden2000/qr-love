import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-full text-sm font-medium tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const variantStyles = {
    primary:
      "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm shadow-rose-900/10",
    secondary:
      "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 focus:ring-zinc-600",
    outline:
      "border border-zinc-700 text-zinc-200 hover:bg-zinc-800/60 focus:ring-zinc-500",
    ghost:
      "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40 focus:ring-zinc-600",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
