import React, { useState } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

interface DynamicInputProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  options?: { value: string; label: string }[]; // for select dropdown
  register?: UseFormRegister<any>;
  errors?: FieldErrors<any>;
  rules?: any; // custom overrides

  // 🔹 Controlled input support
  value?: any;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

const DynamicInput: React.FC<DynamicInputProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  options,
  register,
  errors,
  rules = {},
  value,
  onChange,
}) => {
  const [visible, setVisible] = useState(false);

  // 🔹 Auto rules based on type
  const autoRules: Record<string, any> = {
    email: {
      pattern: {
        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: "Invalid email address",
      },
    },
    password: {
      minLength: {
        value: 6,
        message: "Password must be at least 6 characters",
      },
    },
    text: {
      minLength: { value: 2, message: "Too short" },
    },
    number: {
      pattern: {
        value: /^[0-9]+$/,
        message: "Only numbers allowed",
      },
    },
  };

  const mergedRules = { ...autoRules[type], ...rules };

  // Decide props → either react-hook-form or controlled
  const inputProps = register
    ? register(name, mergedRules)
    : { value, onChange };

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="label-text">
          {label}
        </label>
      )}

      {options && options.length > 0 ? (
        <select id={name} className="input-1" {...inputProps}>
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "password" ? (
        <div className="relative">
          <input
            id={name}
            type={visible ? "text" : "password"}
            placeholder={placeholder}
            className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
            {...inputProps}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400"
          >
            {visible ? <Eye /> : <EyeOff />}
          </button>
        </div>
      ) : (
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          className="input-1"
          {...inputProps}
        />
      )}

      {errors?.[name] && (
        <p className="error-text">{String(errors[name]?.message)}</p>
      )}
    </div>
  );
};

export default DynamicInput;
