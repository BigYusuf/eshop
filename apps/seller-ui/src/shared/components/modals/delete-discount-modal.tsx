import { Loader2, X } from "lucide-react";
import React from "react";

const DeleteDiscountModal = ({
  discount,
  onClose,
  onConfirm,
  isLoading,
}: {
  discount: any;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm?: any;
}) => {
  return (
    <div className="fixed flex top-0 left-0 w-full h-full bg-black bg-opacity-50 items-center justify-center">
      <div className="container-1 bg-gray-800 w-[450px]">
        <div className="flex border-b pb-3 justify-between items-center border-gray-700">
          <h3 className="text-xl text-white">Delete Discount Code</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        {/* warning message  */}
        <p className="text-gray-300 mt-4">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-white">
            {discount?.publicName}
          </span>
          ?
          <br />
          This action ** cannot be undone**
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 text-white rounded-md transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 ${
              isLoading
                ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            } px-4 py-2 text-white rounded-md transition font-semibold`}
            onClick={onConfirm}
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDiscountModal;
