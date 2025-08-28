import { Loader2, X } from "lucide-react";
import React from "react";

const DeleteConfirmModal = ({
  product,
  onClose,
  onConfirm,
  onRestore,
  isLoading,
}: {
  product: any;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm?: any;
  onRestore?: any;
}) => {
  return (
    <div className="fixed flex top-0 left-0 w-full h-full bg-black bg-opacity-50 items-center justify-center">
      <div className="container-1 bg-gray-800 w-[450px]">
        <div className="flex border-b pb-3 justify-between items-center border-gray-700">
          <h3 className="text-xl text-white">
            {!product?.isDeleted ? "Delete " : "Restore "}Product
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        {/* warning message  */}
        <p className="text-gray-300 mt-4">
          Are you sure you want to{" "}
          {!product?.isDeleted ? "delete " : "restore "}
          <span className="font-semibold text-white">{product?.title}</span>
          ?
          <br />
          {!product.isDeleted
            ? "This product will be moved to a **delete state** and permanently removed **after 24 hours**. You can recover it within this time."
            : "This product will be restored from **delete state**. Product will be available to users."}
        </p>
        {/* Action button */}
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
                : product?.isDeleted
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } px-4 py-2 text-white rounded-md transition font-semibold`}
            onClick={!product?.isDeleted ? onConfirm : onRestore}
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLoading
              ? "Deleting..."
              : product?.isDeleted
              ? "Restore"
              : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
