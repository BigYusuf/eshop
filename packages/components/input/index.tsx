import React, { forwardRef } from "react";
import clsx from "clsx";

interface BaseProps {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "outlined" | "filled";
  size?: "sm" | "md" | "lg";
  className?: string;
}

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement> & {
  type?: "text" | "number" | "password" | "email";
};

type TextareaProps = BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  type: "textarea";
};

type Props = InputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  ({ 
    label,
    error,
    helperText,
    type = "text",
    variant = "default",
    size = "md",
    className,
    id,
    ...props 
  }, ref) => {
    const baseStyles =
      "input-2";
    const sizeStyles = {
      sm: "p-1 text-sm",
      md: "p-2 text-base",
      lg: "p-3 text-lg",
    };
    const variantStyles = {
      default: "border-gray-700 focus:border-gray-400",
      outlined: "border-gray-500 focus:border-white",
      filled: "bg-gray-800 border-transparent focus:border-gray-400",
    };

    const inputClass = clsx(
      baseStyles,
      sizeStyles[size],
      variantStyles[variant],
      error && "border-red-500 focus:border-red-500",
      className
    );

    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-semibold text-gray-300 mb-1"
          >
            {label}
          </label>
        )}

        {type === "textarea" ? (
          <textarea
            id={inputId}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            aria-invalid={!!error}
            className={inputClass}
            {...(props as TextareaProps)}
          />
        ) : (
          <input
            id={inputId}
            type={type}
            ref={ref as React.Ref<HTMLInputElement>}
            aria-invalid={!!error}
            className={inputClass}
            {...(props as InputProps)}
          />
        )}

        {(error || helperText) && (
          <p className={clsx("mt-1 text-xs", error ? "text-red-500" : "text-gray-400")}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
