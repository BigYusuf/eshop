import React from "react";

type BankIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;                // width & height (px)
  color?: string;               // stroke/fill color
  strokeWidth?: number;         // for outline
  variant?: "outline" | "solid";
  className?: string;
};

export default function BankIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.8,
  variant = "outline",
  className,
  ...rest
}: BankIconProps) {
  if (variant === "solid") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...rest}
      >
        {/* Roof */}
        <path d="M3 9.5L12 3l9 6.5v1.5H3V9.5Z" />
        {/* Columns */}
        <rect x="5" y="11.5" width="2" height="7" rx="0.5" />
        <rect x="9" y="11.5" width="2" height="7" rx="0.5" />
        <rect x="13" y="11.5" width="2" height="7" rx="0.5" />
        <rect x="17" y="11.5" width="2" height="7" rx="0.5" />
        {/* Base */}
        <rect x="3" y="20" width="18" height="1.8" rx="0.4" />
      </svg>
    );
  }

  // outline
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* Roof */}
      <path d="M3 10l9-6 9 6" />
      <path d="M4 10h16" />
      {/* Columns */}
      <path d="M6 10v8" />
      <path d="M10 10v8" />
      <path d="M14 10v8" />
      <path d="M18 10v8" />
      {/* Base */}
      <rect x="3" y="19" width="18" height="2" rx="0.4" />
    </svg>
  );
}
