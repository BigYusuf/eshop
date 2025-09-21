import ProductDetails from "apps/user-ui/src/shared/modules/product/product-details";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { Metadata } from "next";
import React from "react";

async function fetchProductDetails(slug: string) {
  const response = await axiosInstance.get(
    `/product/api/product/get-product/${slug}`
  );
  return response?.data?.product;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await fetchProductDetails(params?.slug);

  return {
    title: `${product?.title.toUpperCase()} | Eshop Marketplace`,
    description:
      product?.shortDescription ||
      `Discover high-quality products on Eshop Marketplace`,
    openGraph: {
      title: product?.title,
      description: product?.shortDescription || "",
      images: [product?.images?.[0]?.url || "/default-image.jpg"],
      type: "website",
    },
  };
}
const page = async ({ params }: { params: { slug: string } }) => {
  const productDetails = await fetchProductDetails(params?.slug);
  console.log("productDetail", productDetails);
  return <ProductDetails productDetails={productDetails} />;
};

export default page;
