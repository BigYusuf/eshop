import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { Plus, X } from "lucide-react";

import Input from "../input";

const CustomProperties = ({ control, errors }: any) => {
  const [properties, setProperties] = useState<
    { label: string; values: string[] }[]
  >([]);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  return (
    <div>
      <div className="flex flex-col gap-3">
        <Controller
          name={`customProperties`}
          control={control}
          render={({ field }) => {

            useEffect(() => {
              field.onChange(properties);
            }, [properties]);
            
            const AddProperty = () => {
              if (!newLabel.trim()) return;
              setProperties([...properties, { label: newLabel, values: [] }]);
              setNewLabel("");
            };

            const AddValue = (index: number) => {
              if (!newValue.trim()) return;
              const updatedProperties = [...properties];
              updatedProperties[index].values.push(newValue);
              setProperties(updatedProperties);
              setNewValue("");
            };

            const removeProperty = (index: number) => {
              setProperties(properties.filter((_, i) => i !== index));
            };
            return (
              <div className="mt-2">
                <label htmlFor="" className="label-text-1">
                  Custom Properties
                </label>

                <div className="flex flex-col gap-3">
                  {/* Existing Properties */}
                  {properties?.map((property, index) => (
                    <div
                      className="border border-gray-700 p-3 rounded-lg bg-gray-900"
                      key={index}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">
                          {property?.label}
                        </span>
                        <button
                          onClick={() => removeProperty(index)}
                          type="button"
                        >
                          <X size={18} className="text-red-500" />
                        </button>
                      </div>
                      {/* Add Values to Property */}
                      <div className="flex items-center mt-2 gap-2">
                        <input
                          placeholder="Enter Value..."
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          type="text"
                          className="border outline-none border-gray-700 bg-gray-800 w-full p-2 rounded-md text-white"
                        />
                        <button
                          type="button"
                          onClick={() => AddValue(index)}
                          className="px-3 py-1 text-white rounded-md bg-blue-500 hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                      {/* Show values */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {property.values.map((value, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-700 text-white rounded-md"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Add new Property */}
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      placeholder="Enter property label (e.g. Material, Warranty)"
                      value={newLabel}
                      onChange={(e: any) => setNewLabel(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={AddProperty}
                      className="flex items-center px-3 py-2 text-white rounded-md bg-blue-500 hover:bg-blue-700"
                    >
                      <Plus size={20} /> Add
                    </button>
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>
      {errors?.customProperties && (
        <p className="error-text">
          {errors?.customProperties?.message as string}
        </p>
      )}
    </div>
  );
};

export default CustomProperties;
