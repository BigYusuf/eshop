"use client";

import { Edit, Plus, Trash, X } from "lucide-react";

import { useApiQuery } from "apps/seller-ui/src/hooks/useApiQuery";
import PageHeader from "packages/components/page-header";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { useApiMutation } from "apps/seller-ui/src/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import Input from "packages/components/input";
import SubmitButton from "apps/seller-ui/src/shared/components/submit-btn";
import DeleteDiscountModal from "apps/seller-ui/src/shared/components/modals/delete-discount-modal";

type FormData = {
  discountType: string;
  discountCode: string;
  discountValue: number | string;
  publicName: string;
};

const DiscountCodes = () => {
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>(null);
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useApiQuery<any>(
    ["shop-discounts"],
    "/product/api/product/get-discount-codes"
  );
  const discounts = data?.discountCodes;
  // console.log("discounts", discounts);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      discountType: "percentage",
      discountCode: "",
      discountValue: "",
      publicName: "",
    },
  });

  const onCreate = (data: FormData) => {
    if (discounts?.length >= 8) {
      toast.error("You can only create up to 8 discount codes.");
      return;
    }
    createDiscountMutation.mutate(data);
  };
  const onUpdate = (data: FormData) => {
    updateDiscountMutation.mutate(data);
  };

  const handleEdit = async (discount: any) => {
    setSelectedDiscount(discount);
    setShowModal(true);
  };
  const handleDelete = async (discount: any) => {
    setSelectedDiscount(discount);
    setShowDeleteModal(true);
  };
  const createDiscountMutation = useApiMutation<{ token: string }, FormData>(
    "/product/api/product/create-discount-code",
    "post",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
        reset();
        setShowModal(false);
      },
      onError: (error: AxiosError) => {
        const errMessage =
          (error?.response?.data as { message?: string })?.message ||
          "Invalid credentials";
        setError(errMessage);
      },
    }
  );
  // UPDATE mutation
  const updateDiscountMutation = useApiMutation(
    (data: any) =>
      `/product/api/product/update-discount-code"/${selectedDiscount?.id}`,
    "put",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
        setShowModal(false);
        setSelectedDiscount(null);
        reset();
      },
      onError: (error: AxiosError) => {
        const errMessage =
          (error?.response?.data as { message?: string })?.message ||
          "Invalid credentials";
        setError(errMessage);
      },
    }
  );
  const deleteDiscountMutation = useApiMutation(
    () => `/product/api/product/delete-discount-code/${selectedDiscount?.id}`,
    "delete",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
        setShowDeleteModal(false);
        setSelectedDiscount(null);
      },
      onError: (error: AxiosError) => {
        const errMessage =
          (error?.response?.data as { message?: string })?.message ||
          "Failed to delete discount";
        setError(errMessage);
      },
    }
  );
// whenever selectedDiscount changes, reset the form with its values
useEffect(() => {
  if (selectedDiscount) {
    reset({
      discountCode: selectedDiscount.discountCode || "",
      publicName: selectedDiscount.publicName || "",
      discountType: selectedDiscount.discountType || "percentage",
      discountValue: selectedDiscount.discountValue || "",
    });
  }
}, [selectedDiscount, reset]);
  return (
    <div className="w-full min-h-screen p-8">
      <PageHeader
        title="Discount Codes"
        // titleIcon="🛍️"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Discount Codes" },
        ]}
        onCreate={() => {
          setSelectedDiscount(null);
          setShowModal(!showModal);
        }}
        createLabel="Create Discount"
        createIcon={Plus}
      />
      <div className="container-1 mt-8 bg-gray-900">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Discount Codes
        </h3>
        {isLoading ? (
          <p className="text-gray-400">loading discounts....</p>
        ) : isError ? (
          <p className="text-red-500">failed to load discounts....</p>
        ) : (
          <table className="w-full text-white">
            <thead className="">
              <tr className="border-b border-gray-800">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Value</th>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {discounts?.map((item: any) => (
                <tr
                  key={item?.id}
                  className="border-b border-gray-800 hover:bg-gray-800 transition"
                >
                  <td className="p-3">{item?.publicName}</td>
                  <td className="p-3 capitalize">
                    {item?.discountType === "percentage"
                      ? "Percentage (%)"
                      : "Flat ($)"}
                  </td>
                  <td className="p-3 capitalize">
                    {item?.discountType === "percentage"
                      ? `${item?.discountValue}%`
                      : `$${item?.discountValue}`}
                  </td>
                  <td className="p-3">{item?.discountCode}</td>
                  <td className="p-3 flex items-center gap-8">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-400 hover:text-blue-300 transition"
                    >
                      <Edit size={18} />{" "}
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <Trash size={18} />{" "}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && discounts?.length === 0 && (
          <p className="text-gray-400 w-full pt-4 block text-center">
            No Discount Available!
          </p>
        )}
      </div>
      {/* Create Discount Modal */}
      {/* {showModal && (
        <div className="fixed flex top-0 left-0 w-full h-full bg-black bg-opacity-50 items-center justify-center">
          <div className="container-1 bg-gray-800 w-[450px]">
            <div className="flex border-b pb-3 justify-between items-center border-gray-700">
              <h3 className="text-xl text-white">Create Discount Code</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 gap-4">
             
              <div className="mt-2">
                <Input
                  label="Title (Public Name)"
                  placeholder="Enter title"
                  error={errors.publicName?.message as string}
                  {...register("publicName", {
                    required: "Title is required",
                  })}
                />
              </div>
              <div className="mt-2">
                <label className="label-text-1">Discount Type</label>
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field }) => (
                    <select className="input-2 border-gray-600 p-2">
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount ($)</option>
                    </select>
                  )}
                />
              </div>
              <div className="mt-2">
                <Input
                  label="Discount Value"
                  type="number"
                  placeholder="Enter discount value"
                  error={errors.discountValue?.message as string}
                  {...register("discountValue", {
                    required: "Discount Value is required",
                  })}
                />
              </div>
              <div className="mt-2">
                <Input
                  label="Discount Code"
                  placeholder="Enter discount code"
                  error={errors.discountCode?.message as string}
                  {...register("discountCode", {
                    required: "Discount Code is required",
                  })}
                />
              </div>
              <SubmitButton
                isLoading={createDiscountMutation?.isPending}
                loadingText="Creating..."
                btnText="Create"
                icon={Plus}
                variant="primary"
              />

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </form>
          </div>
        </div>
      )} */}
      {showModal && (
        <div className="fixed flex top-0 left-0 w-full h-full bg-black bg-opacity-50 items-center justify-center">
          <div className="container-1 bg-gray-800 w-[450px]">
            <div className="flex border-b pb-3 justify-between items-center border-gray-700">
              <h3 className="text-xl text-white">
                {selectedDiscount
                  ? "Update Discount Code"
                  : "Create Discount Code"}
              </h3>
              <button
                onClick={() => {
                  setSelectedDiscount(null);
                  setShowModal(false);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(selectedDiscount ? onUpdate : onCreate)}
              className="mt-4 gap-4"
            >
              {/* title */}
              <div className="mt-2">
                <Input
                  label="Title (Public Name)"
                  placeholder="Enter title"
                  error={errors.publicName?.message as string}
                  {...register("publicName", {
                    required: "Title is required",
                  })}
                />
              </div>

              <div className="mt-2">
                <label className="label-text-1">Discount Type</label>
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field }) => (
                    <select {...field} className="input-2 border-gray-600 p-2">
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount ($)</option>
                    </select>
                  )}
                />
              </div>

              <div className="mt-2">
                <Input
                  label="Discount Value"
                  type="number"
                  placeholder="Enter discount value"
                  error={errors.discountValue?.message as string}
                  {...register("discountValue", {
                    required: "Discount Value is required",
                  })}
                />
              </div>

              <div className="mt-2">
                <Input
                  label="Discount Code"
                  placeholder="Enter discount code"
                  error={errors.discountCode?.message as string}
                  {...register("discountCode", {
                    required: "Discount Code is required",
                  })}
                />
              </div>

              <SubmitButton
                isLoading={
                  selectedDiscount
                    ? updateDiscountMutation?.isPending
                    : createDiscountMutation?.isPending
                }
                loadingText={selectedDiscount ? "Updating..." : "Creating..."}
                btnText={selectedDiscount ? "Update" : "Create"}
                icon={selectedDiscount ? Edit : Plus}
                variant="primary"
              />

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </form>
          </div>
        </div>
      )}
      {showDeleteModal && selectedDiscount && (
        <DeleteDiscountModal
          discount={selectedDiscount}
          onClose={() => {
            setSelectedDiscount(null);
            setShowDeleteModal(false);
          }}
          isLoading={deleteDiscountMutation?.isPending}
          onConfirm={() => deleteDiscountMutation.mutate(selectedDiscount?.id)}
        />
      )}
    </div>
  );
};

export default DiscountCodes;
