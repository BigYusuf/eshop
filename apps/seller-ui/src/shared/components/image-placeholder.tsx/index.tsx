"use client";
import { Loader2, Pencil, WandSparkles, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

type ImagePlaceHolderProps = {
  size: string;
  small?: boolean;
  picUploadingLoader?: boolean;
  onImageChange: (file: File | null, index: number) => void;
  onRemove: (index: number) => void;
  defaultImage?: string | null;
  index?: any;
  images?: any;
  setOpenImageModal: (openImageModal: boolean) => void;
  setSelectedImage: (selectedImage: string) => void;
};
const ImagePlaceHolder = ({
  size,
  small,
  onImageChange,
  onRemove,
  defaultImage = null,
  index = null,
  setOpenImageModal,
  setSelectedImage,
  images,
  picUploadingLoader,
}: ImagePlaceHolderProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file: any = event.target.files?.[0];

    setImagePreview(URL.createObjectURL(file));
    onImageChange(file, index!);
  };
  return (
    <div
      className={`relative w-full flex flex-col rounded-lg justify-center items-center cursor-pointer bg-[1e1e1e] border border-gray-600 ${
        small ? "h-[180px]" : "h-[450px]"
      }`}
    >
      <input
        type="file"
        accept="image/*"
        id={`image-upload-${index}`}
        onChange={handleFileChange}
        className="hidden"
      />
      {imagePreview ? (
        <>
          <button
            disabled={picUploadingLoader}
            type="button"
            onClick={() => onRemove?.(index!)}
            className="absolute top-3 right-3 p-2 !rounded bg-red-500 shadow-lg cursor-pointer"
          >
            <X size={16} />
          </button>
          <button
            onClick={() => {
              setOpenImageModal(true);
              setSelectedImage(images[index].fileUrl);
            }}
            className={`absolute top-3 right-[70px] p-2 !rounded ${
              picUploadingLoader ? "bg-gray-300" : "bg-blue-500"
            } shadow-lg cursor-pointer`}
          >
            {picUploadingLoader ? (
              <Loader2 size={16} />
            ) : (
              <WandSparkles size={16} />
            )}
          </button>
        </>
      ) : (
        <label
          htmlFor={`image-upload-${index}`}
          className="absolute top-3 right-3 p-2 !rounded bg-slate-700 shadow-lg cursor-pointer"
        >
          <Pencil size={16} />
        </label>
      )}

      {imagePreview ? (
        <Image
          src={imagePreview}
          width={400}
          height={300}
          alt="uploaded"
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <>
          <p
            className={`text-gray-400 font-semibold ${
              small ? "text-xl" : "text-4xl"
            }`}
          >
            {size}
          </p>
          <p
            className={`text-gray-500 pt-2 text-center ${
              small ? "text-sm" : "text-lg"
            }`}
          >
            Please choose an image <br /> according to the expected ratio
          </p>
        </>
      )}
    </div>
  );
};

export default ImagePlaceHolder;
