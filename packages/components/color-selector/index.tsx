import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";

const defaultColors = [
  "#000000", // Black
  "#ffffff", // White
  "#ff0000", // Red
  "#00ff00", // Green
  "#0000ff", // Blue
  "#ffff00", // Yellow
  "#ff00ff", // Magenta
  "#00ffff", // Cyan
];

const ColorSelector = ({ control, errors }: any) => {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState("#ffffff");
  return (
    <div className="mt-2">
      <label htmlFor="" className="block label-text-1">
        Colors
      </label>
      <Controller
        name="colors"
        control={control}
        render={({ field }) => (
          <div className="flex gap-3 flex-wrap">
            {[...defaultColors, ...customColors].map((color) => {
              const isSelected = (field.value || []).includes(color);
              const isLightColor = ["#fff", "#ffff00"].includes(color);
              return (
                <button
                  type="button"
                  key={color}
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-md my-1 items-center justify-center border-2 transition ${
                    isSelected ? "scale-110 border-white" : "border-transparent"
                  }${isLightColor ? "border-gray-600" : ""} `}
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((x: string) => x !== color)
                        : [...(field.value || []), color]
                    )
                  }
                />
              );
            })}

            {/* Add new color */}
            <button
              type="button"
              onClick={()=>setShowColorPicker(!showColorPicker)}
              className="flex w-8 h-8 rounded-full justify-center items-center transition border-2 border-gray-500 bg-gray-800 hover:bg-gray-700"
            >
              <Plus size={16} color="white" />
            </button>

            {/* Color picker */}
            {showColorPicker && (
              <div className="relative flex items-center gap-2">
                <input
                  type="color"
                  className="w-10 h-10 p-0 border-none cursor-pointer"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                />
                <button
                  onClick={() => {
                    setCustomColors([...customColors, newColor]);
                    setShowColorPicker(false);
                  }}
                  type="button"
                  className="px-3 bg-gray-700 text-white rounded-md text-sm"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};
export default ColorSelector;
