import { useMutation } from "@tanstack/react-query";
import React from "react";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import FormField from "../../components/form-field";
import { shopCategories } from "apps/seller-ui/src/data/categories";
import SubmitButton from "../../components/submit-btn";

const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) => {
  type FormData = {
    name: string;
    description: string;
    address: string;
    openingHours: string;
    website?: string;
    category: string;
    country: string;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  console.log(sellerId);
  const shopCreateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!sellerId) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/create-shop`,
        data
      );
      return response?.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    },
  });

  const onSubmit = (data: FormData) => {
    const shopData = { ...data, sellerId };
    shopCreateMutation.mutate(shopData);
  };
  const countWords = (text: string) => text.trim().split(/\s+/).length;

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4">
          Setup new shop
        </h3>
        <div className="">
          <FormField<FormData>
            label="Shop Name"
            name="name"
            type="text"
            register={register}
            errors={errors}
            rules={{
              required: "Shop name is required",
              minLength: { value: 3, message: "Invalid Shop name" },
            }}
            placeholder="Enter valid Shop name"
          />
          <FormField<FormData>
            label="Description (Max 100 words)"
            name="description"
            as="textarea"
            register={register}
            errors={errors}
            rules={{
              required: "Description is required",
              minLength: { value: 5, message: "At least 5 characters" },
              validate: (text: any) =>
                countWords(text) <= 100 || "Description can't exceed 100 words",
            }}
            placeholder="Enter description"
          />
          <FormField<FormData>
            label="Shop Address"
            name="address"
            type="text"
            register={register}
            errors={errors}
            rules={{
              required: "Shop address is required",
              minLength: { value: 3, message: "Invalid Shop address" },
            }}
            placeholder="Enter valid Shop address"
          />
          <FormField<FormData>
            label="Opening Hours"
            name="openingHours"
            type="text"
            register={register}
            errors={errors}
            rules={{
              required: "Opening Hours is required",
            }}
            placeholder="e.g. Mon-Fri | 7AM - 5PM"
          />
          <FormField<FormData>
            label="Website"
            name="website"
            type="url"
            register={register}
            errors={errors}
            rules={{
              pattern: {
                value: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i,
                message: "Enter a valid website URL",
              },
            }}
            placeholder="Enter a valid website"
          />
          <FormField<FormData>
            label="Shop Categories"
            name="category"
            as="select"
            labelKey={"label"}
            valueKey={"value"}
            placeholder="Select Shop category"
            includePlaceholder
            options={shopCategories}
            register={register}
            errors={errors}
            rules={{ required: "Please select a category" }}
          />
        </div>
        <SubmitButton
          isLoading={shopCreateMutation?.isPending}
          loadingText="... creating new shop"
        />
        {shopCreateMutation?.isError &&
          shopCreateMutation.error instanceof AxiosError && (
            <p className="text-red-500 text-sm mt-2">
              {shopCreateMutation.error?.response?.data?.message ||
                shopCreateMutation.error?.message}
            </p>
          )}
      </form>
    </div>
  );
};

export default CreateShop;
