import React from "react";
import { Controller, useFieldArray } from "react-hook-form";
import Input from "../input";
import { PlusCircle, Trash2 } from "lucide-react";

const CustomSpecs = ({ control, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "customSpecification",
  });
  return (
    <div>
      <label htmlFor="" className="label-text-1">
        Custom Specifications
      </label>

      <div className="flex flex-col gap-3">
        {fields?.map((item, index) => (
          <div className="flex gap-2 items-center" key={index}>
            <Controller
              name={`customSpecification.${index}.name`}
              control={control}
              rules={{ required: "Specification name is required" }}
              render={({ field }) => (
                <Input
                  label="Specification Name"
                  placeholder="e.g. Battery Life, Weight, Material"
                  {...field}
                />
              )}
            />
            <Controller
              name={`customSpecification.${index}.value`}
              control={control}
              rules={{ required: "Value is required" }}
              render={({ field }) => (
                <Input
                  label="Value"
                  placeholder="e.g. 5000mAh, 19kg, Metal"
                  {...field}
                />
              )}
            />
            <button
              type="button"
              className="text-red-500 hover:text-red-700"
              onClick={() => remove(index)}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        <button
          onClick={() => append({ name: "", value: "" })}
          className="flex gap-2 items-center text-blue-500 hover:text-blue-700"
        >
          <PlusCircle size={20} /> Add Specification
        </button>
      </div>
      {errors?.customSpecification && (
        <p className="error-text">
          {errors?.customSpecification?.message as string}
        </p>
      )}
    </div>
  );
};

export default CustomSpecs;
