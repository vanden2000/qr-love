import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Container({
  children,
  className = "",
  size = "sm",
}: ContainerProps) {
  const sizeStyles = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
  };

  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 ${sizeStyles[size]} ${className}`}
    >
      {children}
    </div>
  );
}
