"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { Wand, X } from "lucide-react";
import toast from "react-hot-toast";

import Input from "packages/components/input";
import ImagePlaceHolder from "../../../../shared/components/image-placeholder.tsx";
import ColorSelector from "packages/components/color-selector";
import CustomSpecs from "packages/components/custom-specification";
import CustomProperties from "packages/components/custom-properties";
import RichTextEditor from "packages/components/rich-text-editor";
import SizeSelector from "packages/components/size-selector";
import PageHeader from "packages/components/page-header";
import { useApiQuery } from "apps/seller-ui/src/hooks/useApiQuery";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { enhancements } from "apps/seller-ui/src/data/ai.enhancements";

type UploadeImage = {
  fileId: string;
  fileUrl: string;
  file_url?: string;
};

const CreatProductPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<(UploadeImage | null)[]>([null]);
  const [openImageModal, setOpenImageModal] = useState<boolean>(false);
  const [picUploadingLoader, setPicUploadingLoader] = useState<boolean>(false);
  const [isChanged, setIsChanged] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [activeEffect, setActiveEffect] = useState<string | null>("e-bgremove");
  const [processing, setProcessing] = useState<boolean>(false);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    setValue,
  } = useForm();

  const { data, isLoading, isError } = useApiQuery<any>(
    ["categories"],
    "/product/api/product/get-categories"
  );
  const {
    data: discounts,
    isLoading: discountLoading,
    isError: discountError,
  } = useApiQuery<any>(
    ["shop-discounts"],
    "/product/api/product/get-discount-codes"
  );
  const discountCodes = discounts?.discountCodes;

  // console.log(data);
  const categories = data?.data || [];

  const selectedCategory = watch("categoryId");
  const regularPrice = watch("regularPrice");
  console.log("categories", categories);

  const converttoBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;
    try {
      setPicUploadingLoader(true);
      const fileName = await converttoBase64(file);
      const response = await axiosInstance.post(
        "/product/api/product/upload-product-image",
        { fileName }
      );
      const uploadedImage: UploadeImage = {
        fileId: response.data.fileId,
        fileUrl: response.data.fileUrl,
      };
      const updatedImages = [...images];
      updatedImages[index] = uploadedImage;

      if (index === images.length - 1 && images.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
    } finally {
      setPicUploadingLoader(false);
    }
  };

  const handleImageRemove = async (index: number) => {
    try {
      const updatedImages = [...images];
      const imageToDelete = updatedImages[index];
      if (imageToDelete && typeof imageToDelete === "object") {
        // delete picture
        await axiosInstance.delete(
          "/product/api/product/delete-product-image",
          {
            data: { fileId: imageToDelete.fileId! },
          }
        );
      }

      updatedImages.splice(index, 1);
      // Add null placeholder
      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue("images", images);
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = (data: any) => {
    console.log("data", data);
    createProductMutation.mutate(data);
  };

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post(
        `/product/api/product/create-product`,
        data,
        { withCredentials: true }
      );
      return response?.data;
    },
    onSuccess: () => {
      router.push("/dashboard/all-products");
    },
    onError: (error: AxiosError) => {
      const errMessage =
        (error?.response?.data as { message?: string })?.message ||
        "Invalid credentials";
      setError(errMessage);
      toast.error(errMessage);
    },
  });

  const handleSaveDraft = () => {};

  const applyTransformation = async (transformation: string) => {
    if (!selectedImage || processing) return;
    setProcessing(true);
    setActiveEffect(transformation);
    try {
      const transformedUrl = `${selectedImage}?tr=${transformation}`;
      setSelectedImage(transformedUrl);
    } catch (error) {
      console.log(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
    >

      {/* Header & Breadcrumbs */}
      <PageHeader
        title="Create Product"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Create Product" },
        ]}
      />
      {/* Content layout */}
      <div className="py-4 flex w-full gap-6">
        <div className="md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceHolder
              setOpenImageModal={setOpenImageModal}
              picUploadingLoader={picUploadingLoader}
              setSelectedImage={setSelectedImage}
              images={images}
              size="765 x 850"
              small={false}
              index={0}
              onImageChange={handleImageChange}
              onRemove={handleImageRemove}
            />
          )}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceHolder
                setOpenImageModal={setOpenImageModal}
                picUploadingLoader={picUploadingLoader}
                images={images}
                setSelectedImage={setSelectedImage}
                size="765 x 850"
                small
                index={index + 1}
                key={index}
                onImageChange={handleImageChange}
                onRemove={handleImageRemove}
              />
            ))}
          </div>
        </div>
        {/* Right side - form inputs */}
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            {/* Product input */}
            <div className="w-2/4">
              <Input
                label="Product Title *"
                error={errors.title?.message as string}
                placeholder="Enter product title"
                {...register("title", { required: "Title is required" })}
              />
              <div className="mt-2">
                <Input
                  label="Short Description* (Max 150 words)"
                  type="textarea"
                  placeholder="Enter product description for quick view"
                  rows={7}
                  cols={10}
                  // helperText="Max 500 characters"
                  {...register("shortDescription", {
                    required: "Short description is required",
                    validate: (val) => {
                      const wordCount = val.trim().split(/\s+/).length;
                      return (
                        wordCount <= 150 ||
                        `Short Description cannot exceed 150 words(Current)`
                      );
                    },
                  })}
                />
              </div>
              <div className="mt-2">
                <Input
                  label="Tags *"
                  error={errors.tags?.message as string}
                  placeholder="apple, shoe"
                  {...register("tags", {
                    required: "Seperate related product tags with a comma,",
                  })}
                />
                <div className="mt-2">
                  <Input
                    label="Warranty *"
                    error={errors.warranty?.message as string}
                    placeholder="1 Year / No Warranty"
                    {...register("warranty", {
                      required: "Warranty is required!",
                    })}
                  />
                </div>
                <div className="mt-2">
                  <Input
                    label="Slug *"
                    error={errors.slug?.message as string}
                    placeholder="product_slug"
                    {...register("slug", {
                      required: "Slug is required!",
                      pattern: {
                        value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                        message:
                          "Invalid slug format: Use only lowercase letters, numbers, and special characters",
                      },
                      minLength: {
                        value: 3,
                        message: "Slug must be at least 3 characters long",
                      },
                      maxLength: {
                        value: 50,
                        message: "Slug cannot be longer than 50 characters.",
                      },
                    })}
                  />
                </div>
                <div className="mt-2">
                  <Input
                    label="Brand"
                    error={errors.brand?.message as string}
                    placeholder="Apple"
                    {...register("brand")}
                  />
                </div>
                <div className="mt-2">
                  <ColorSelector control={control} errors={errors} />
                </div>
                <div className="mt-2">
                  <CustomSpecs control={control} errors={errors} />
                </div>
                <div className="mt-2">
                  <CustomProperties control={control} errors={errors} />
                </div>
                <div className="mt-2">
                  <label htmlFor="" className="label-text-1">
                    Cash On Delivery *
                  </label>
                  <select
                    className="input-2 p-2 text-base"
                    defaultValue={"yes"}
                    {...register("cashOnDelivery", {
                      required: "Cash on Delivery is required",
                    })}
                  >
                    <option className="bg-black" value="yes">
                      Yes
                    </option>
                    <option className="bg-black" value="no">
                      No
                    </option>
                  </select>
                  {errors?.cashOnDelivery && (
                    <p className="error-text">
                      {errors?.cashOnDelivery?.message as string}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="w-2/4">
              <label htmlFor="" className="label-text-1">
                Category *
              </label>
              {isLoading ? (
                <p className="text-gray-400">loading categories....</p>
              ) : isError ? (
                <p className="text-red-500">failed to load categories....</p>
              ) : (
                <Controller
                  name="categoryId"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <select className="input-2 p-2" {...field}>
                      <option value="" className="bg-black">
                        Select Category
                      </option>
                      {categories?.map(
                        (category: { name: string; id: string }) => (
                          <option
                            key={category.name}
                            value={category.id}
                            className="bg-black"
                          >
                            {category.name}
                          </option>
                        )
                      )}
                    </select>
                  )}
                />
              )}
              {errors?.categoryId && (
                <p className="error-text">
                  {errors?.categoryId?.message as string}
                </p>
              )}

              <div className="mt-2">
                <label className="label-text-1">Subcategory *</label>
                <Controller
                  name="subCategoryId"
                  control={control}
                  rules={{ required: "Subcategory is required" }}
                  render={({ field }) => {
                    const selectedCategoryObj = categories?.find(
                      (cat: { id: string }) => cat.id === selectedCategory
                    );
                    const subcategories =
                      selectedCategoryObj?.sub_categories || [];

                    return (
                      <select
                        className="input-2 p-2"
                        {...field}
                        disabled={!selectedCategory}
                      >
                        <option value="">Select Subcategory</option>
                        {subcategories.map(
                          (sub: { id: string; name: string }) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name}
                            </option>
                          )
                        )}
                      </select>
                    );
                  }}
                />
                {errors?.subCategoryId && (
                  <p className="error-text">
                    {errors?.subCategoryId?.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <label className="label-text-1">
                  Detailed Description * (Min 100 words)
                </label>
                <Controller
                  name="detailedDescription"
                  control={control}
                  rules={{
                    required: "Detailed Description is required",
                    validate: (val) => {
                      const wordCount = val
                        ?.split(/\s+/)
                        .filter((word: string) => word).length;
                      return (
                        wordCount >= 100 ||
                        `Description must be at least 100 words!`
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="mt-2">
                <Input
                  label="Video URL"
                  error={errors.videoUrl?.message as string}
                  placeholder="https://www.youtube.com/embed/xyz123"
                  {...register("videoUrl", {
                    pattern: {
                      value:
                        /^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                      message:
                        "Invalid Youtube embed URL! Use format: https://www.youtube.com/embed/xyz123",
                    },
                  })}
                />
              </div>
              <div className="mt-2">
                <Input
                  label="Regular Price"
                  error={errors.regularPrice?.message as string}
                  placeholder="20$"
                  {...register("regularPrice", {
                    valueAsNumber: true,
                    min: { value: 1, message: "Price must be at least 1" },
                    validate: (value) =>
                      !isNaN(value || "Only numbers are allowed"),
                  })}
                />
              </div>
              <div className="mt-2">
                <Input
                  label="Sale Price"
                  error={errors.salePrice?.message as string}
                  placeholder="15$"
                  {...register("salePrice", {
                    required: "Sale Price is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Sale Price must be at least 1" },
                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed";
                      if (regularPrice && value >= regularPrice) {
                        return "Sale Price must be less than Regular Price";
                      }
                      return true;
                    },
                  })}
                />
              </div>
              <div className="mt-2">
                <Input
                  label="Stock *"
                  error={errors.stock?.message as string}
                  placeholder="100"
                  {...register("stock", {
                    required: "Stock is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Stock must be at least 1" },
                    max: { value: 1000, message: "Stock cannot exceed 1,000" },
                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed";
                      if (!Number.isInteger(value)) {
                        return "Stock must be a whole number!";
                      }
                      return true;
                    },
                  })}
                />
              </div>
              <div className="mt-2">
                <SizeSelector control={control} errors={errors} />
              </div>
              <div className="mt-3">
                <label htmlFor="" className="label-text-1">
                  Select Discount Codes (Optional)
                </label>
                {discountLoading ? (
                  <p className="text-gray-400">loading discount codes...</p>
                ) : discountError ? (
                  <p className="text-red-500">failed to load discount....</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {discountCodes?.map((code: any) => (
                      <button
                        className={`input-1 rounded-md px-3 py-1 ${
                          watch("discountCodes")?.includes(code.id)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600"
                        }`}
                        type="button"
                        key={code?.id}
                        onClick={() => {
                          const currentSelection = watch("discountCodes") || [];

                          const updateSelection = currentSelection?.includes(
                            code?.id
                          )
                            ? currentSelection.filter(
                                (id: string) => id !== code.id
                              )
                            : [...currentSelection, code.id];
                          setValue("discountCodes", updateSelection);
                        }}
                      >
                        {code?.publicName} ({code?.discountValue}{" "}
                        {code?.discountType === "percentage" ? "%" : "$"})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {openImageModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black z-50 bg-opacity-60">
          <div className="bg-gray-800 rounded-lg text-white w-[450px] p-6">
            <div className="flex justify-between items-center pb-3 mb-4">
              <h2 className="text-lg font-semibold"> Enhance Product Image</h2>
              <X
                size={20}
                className="cursor-pointer"
                onClick={() => setOpenImageModal(!openImageModal)}
              />
            </div>
            <div className="relative w-full h-[250px] rounded-md overflow-hidden border border-gray-600">
              <Image
                alt="product-image-preview"
                src={selectedImage}
                layout="fill"
              />
            </div>
            {selectedImage && (
              <div className="mt-4 space-y-2">
                <h3 className="text-white text-sm font-semibold">
                  AI Enhancements
                </h3>
                <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto">
                  {enhancements?.map(({ label, effect }) => (
                    <button
                      key={effect}
                      onClick={() => applyTransformation(effect)}
                      className={`p-2 rounded-md flex items-center gap-2 ${
                        activeEffect === effect
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600 "
                      }`}
                      disabled={processing}
                    >
                      <Wand size={18} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-end gap-3">
        {isChanged && (
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-gray-700 text-white rounded-md"
          >
            Save Draft
          </button>
        )}
        <button
          type="submit"
          disabled={createProductMutation?.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          {createProductMutation?.isPending ? "Creating..." : "Create"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
};

export default CreatProductPage;
