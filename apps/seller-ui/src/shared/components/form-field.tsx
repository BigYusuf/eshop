import React, { useState } from "react";
import {
  FieldErrors,
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

type BaseProps<T extends FieldValues> = {
  label?: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  rules?: RegisterOptions<T, Path<T>>;
  errors?: FieldErrors<T>;
  placeholder?: string;
  className?: string;
};

type InputProps<T extends FieldValues> = BaseProps<T> & {
  as?: "input";
  type?: string;
};

type TextAreaProps<T extends FieldValues> = BaseProps<T> & {
  as: "textarea";
  rows?: number;
};

type SelectProps<T extends FieldValues, O extends object> = BaseProps<T> & {
  as: "select";
  options: O[];
  valueKey: keyof O;
  labelKey: keyof O;
  includePlaceholder?: boolean;
};

type FormFieldProps<T extends FieldValues, O extends object = any> =
  | InputProps<T>
  | TextAreaProps<T>
  | SelectProps<T, O>;

export default function FormField<T extends FieldValues, O extends object = any>(
  props: FormFieldProps<T, O>
) {
  const {
    label,
    name,
    register,
    rules,
    errors,
    placeholder = "",
    className = "",
  } = props;

  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div>
      {label && (
        <label htmlFor={name} className="label-text">
          {label}
        </label>
      )}

      {props.as === "textarea" ? (
        <textarea
          id={name}
          rows={props.rows || 3}
          placeholder={placeholder}
          className={`inputt ${className}`}
          {...register(name, rules)}
        />
      ) : props.as === "select" ? (
        <select
          id={name}
          className={`inputt ${className}`}
          {...register(name, rules)}
        >
          {props.includePlaceholder && (
            <option value="">Select {label || name}</option>
          )}
          {props.options.map((opt, idx) => (
            <option key={idx} value={String(opt[props.valueKey])}>
              {String(opt[props.labelKey])}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative">
          <input
            id={name}
            type={
              props.type === "password"
                ? passwordVisible
                  ? "text"
                  : "password"
                : props.type || "text"
            }
            placeholder={placeholder}
            className={`inputt ${className}`}
            {...register(name, rules)}
          />
          {props.type === "password" && (
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400"
            >
              {passwordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          )}
        </div>
      )}

      {errors?.[name] && (
        <p className="error-text">{String(errors[name]?.message)}</p>
      )}
    </div>
  );
}
