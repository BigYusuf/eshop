"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import DynamicInput from "../widgets/dynamic-input";
import axiosInstance from "../../utils/axiosInstance";

const ShippingAddressSection = () => {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const [editAddress, setEditAddress] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      label: "Home",
      name: "",
      street: "",
      city: "",
      zip: "",
      state: "",
      country: "Nigeria",
      isDefault: false,
    },
  });

  const { data: addresses, isLoading } = useQuery({
    queryKey: ["shipping-addressess"],
    queryFn: async () => {
      const res = await axiosInstance("/api/auth/get-user-addresses");
      return res.data?.addresses;
    },
    staleTime: 1000 * 60 * 30,
  });

  const { mutate: newAddressMutation, isPending: newAddressLoading } =
    useMutation({
      mutationFn: async (data: any) => {
        const response = await axiosInstance.post(
          `/api/auth/user-create-address`,
          data
        );
        return response?.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["shipping-addressess"] });
        reset();
        setShowModal(false);
      },
    });

  const { mutate: deleteAddress, isPending: delAddressLoading } = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(
        `/api/auth/user-delete-address/${id}`
      );
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-addressess"] });
      reset();
    },
  });
  const { mutate: updateAddress, isPending: updateAddressLoading } =
    useMutation({
      mutationFn: async (data: any) => {
        const response = await axiosInstance.put(
          `/api/auth/user-update-address/${editAddress.id}`,
          data
        );
        return response?.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["shipping-addressess"] });
        reset();
        setEditAddress(null);
        setShowModal(false);
      },
    });

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      isDefault: data?.isDefault === "true" ? true : false,
    };

    if (editAddress) {
      updateAddress(payload);
    } else {
      newAddressMutation(payload);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Saved Address</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
        >
          <Plus className="w-4 h-4" />
          Add New Address
        </button>
      </div>

      {/* Address List */}
      <div className="">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading Addresses...</p>
        ) : !addresses || addresses?.length === 0 ? (
          <p className="text-sm text-gray-500">No saved address found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses?.map((address: any) => (
              <div
                className="border border-gray-200 rounded-md p-4 relative"
                key={address?.id}
              >
                {address?.isDefault && (
                  <span className="absolute top-2 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin className="w-5 h-5 mt-0.5 text-gray-500" />
                  <div className="">
                    <p className="font-medium">
                      {address.street} - {address?.name}
                    </p>
                    <p className="">
                      {address.street}, {address?.name}, {address?.zip},{" "}
                      {address?.country}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4 items-center justify-between">
                  <button
                    disabled={delAddressLoading}
                    className={`flex items-center gap-1 !cursor-pointer text-xs text-gray-500 hover:text-gray-700 `}
                    onClick={() => {
                      setEditAddress(address);
                      reset({
                        ...address,
                        isDefault: address.isDefault ? "true" : "false", // keep consistent with select options
                      });
                      setShowModal(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button
                    disabled={delAddressLoading}
                    className={`flex items-center gap-1 !cursor-pointer text-xs ${
                      delAddressLoading
                        ? "text-gray-500"
                        : " text-red-500 hover:text-red-700"
                    }`}
                    onClick={() => deleteAddress(address?.id)}
                  >
                    {delAddressLoading ? (
                      <Loader className="w-4 h-4" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}{" "}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 ">
          <div className="bg-white w-full max-w-md p-6 rounded-md shadow-md relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => {
                setEditAddress(null);
                setShowModal(false);
              }}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {editAddress ? "Edit Address" : "Add New Address"}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <DynamicInput
                name="label"
                register={register}
                errors={errors}
                options={[
                  { value: "Home", label: "Home" },
                  { value: "Work", label: "Work" },
                  { value: "Other", label: "Other" },
                ]}
                rules={{ required: "Please select a label" }}
              />
              <DynamicInput
                name="name"
                register={register}
                placeholder="Name"
                errors={errors}
                rules={{ required: "Name is required!" }}
              />
              <DynamicInput
                name="street"
                register={register}
                placeholder="Street "
                errors={errors}
                rules={{ required: "Street is required!" }}
              />
              <DynamicInput
                name="city"
                register={register}
                placeholder="City"
                errors={errors}
                rules={{ required: "City is required!" }}
              />
              <DynamicInput
                name="zip"
                register={register}
                placeholder="Zip Code"
                errors={errors}
                rules={{ required: "Zip Code is required!" }}
              />
              <DynamicInput
                name="country"
                register={register}
                errors={errors}
                options={[{ value: "Nigeria", label: "Nigeria" }]}
                rules={{ required: "Please select a country" }}
              />
              <DynamicInput
                name="state"
                register={register}
                placeholder="State "
                errors={errors}
                rules={{ required: "State is required!" }}
              />
              <DynamicInput
                name="isDefault"
                register={register}
                errors={errors}
                options={[
                  { value: "true", label: "Set as Default" },
                  { value: "false", label: "Not Default" },
                ]}
                rules={{ required: "Please select a default address" }}
              />
              <button
                type="submit"
                disabled={newAddressLoading || updateAddressLoading}
                className={`w-full text-white text-sm py-2 rounded-md transition ${
                  newAddressLoading || updateAddressLoading
                    ? "bg-gray-600"
                    : "hover:bg-blue-800 bg-blue-600"
                }`}
              >
                {newAddressLoading || updateAddressLoading
                  ? "Saving..."
                  : editAddress
                  ? "Update Address"
                  : "Save Address"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingAddressSection;
