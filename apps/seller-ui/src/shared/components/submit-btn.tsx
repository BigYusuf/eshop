import React from "react";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  btnText?: string;
  className?: string;
  variant?: "black" | "primary";
  handleClick?: () => void;
  icon?: React.ElementType; // Lucide icon component
  iconPosition?: "left" | "right"; // control position
}

export default function SubmitButton({
  isLoading = false,
  loadingText = "Loading...",
  btnText = "Submit",
  className = "",
  variant = "black",
  handleClick,
  icon: Icon, // dynamic icon
  iconPosition = "left",
}: SubmitButtonProps) {
  const baseStyles =
    "w-full mt-4 py-2 !rounded cursor-pointer text-white transition-colors flex items-center justify-center gap-2";

  const variantStyles =
    variant === "black"
      ? isLoading
        ? "bg-gray-300"
        : "bg-black hover:bg-pryColor"
      : isLoading
      ? "bg-gray-300"
      : "bg-pryColor hover:bg-black";

  return (
    <button
      type="submit"
      onClick={handleClick}
      disabled={isLoading}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin w-4 h-4" />
          {loadingText}
        </>
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon className="w-4 h-4" />}
          {btnText}
          {Icon && iconPosition === "right" && <Icon className="w-4 h-4" />}
        </>
      )}
    </button>
  );
}
