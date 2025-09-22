"use client";
import { useQuery } from "@tanstack/react-query";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useUser from "apps/user-ui/src/hooks/useUser";
import TitleBreadCrumbs from "apps/user-ui/src/shared/components/title-bread-crumbs";
import { useStore } from "apps/user-ui/src/store";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import React, { useEffect, useState } from "react";

const CartPage = () => {
  const user = useUser();
  const location = useLocationTracking();

  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state) => state.addToCart);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [discountedProductId, setDiscountedProductId] = useState<string>("");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponCode, setCouponCode] = useState<string>("");

  const cart = useStore((state) => state.cart);
  const decreaseQty = (id: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };
  const increaseQty = (id: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item
      ),
    }));
  };
  const removeItem = (id: string) => {
    removeFromCart(id, user?.user, location || null, deviceInfo || null);
  };
  // Each cart item should have: price, quantity
  const subtotal = cart.reduce(
    (total: number, item: any) => total + item.salePrice * (item.quantity || 1),
    0
  );

  const handleCouponCode = () => {
    // Example: Simple coupon logic
    if (couponCode === "DISCOUNT10") {
      // 10% off on the first product in the cart
      if (cart.length > 0) {
        const firstProduct = cart[0];
        const discount = (firstProduct.salePrice * 10) / 100;
        setDiscountedProductId(firstProduct.id);
        setDiscountPercent(10);
        setDiscountAmount(discount * (firstProduct.quantity || 1));
      }
    } else {
      // Invalid or no coupon
      setDiscountedProductId("");
      setDiscountPercent(0);
      setDiscountAmount(0);
    }
  };
  const { data: addresses } = useQuery({
    queryKey: ["shipping-addressess"],
    queryFn: async () => {
      const res = await axiosInstance("/api/auth/get-user-addresses");
      return res.data?.addresses;
    },
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (addresses?.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((addr: any) => addr?.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr?.id);
      }
    }
  }, [addresses, selectedAddressId]);

  return (
    <div className="w-full bg-white min-h-screen p-4">
      <div className="w-[90%] md:w-[80%] mx-auto min-h-screen">
        <TitleBreadCrumbs title="Shopping Cart" subTitle="Cart" />

        {cart.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">
            Your cart is empty! Start adding products.
          </div>
        ) : (
          <div className="flex w-full gap-10 items-start">
            {/* Table wrapper */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-[#f1f3f4]">
                  <tr className="text-left text-gray-700">
                    <th className="py-3 px-6">Product</th>
                    <th className="py-3 px-6 text-center">Price</th>
                    <th className="py-3 px-6 text-center">Quantity</th>
                    <th className="py-3 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart?.map((item: any) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      {/* Product */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <Image
                            src={item?.images[0]?.url}
                            alt={item?.title}
                            width={80}
                            height={80}
                            className="rounded-md border"
                          />
                          <div>
                            <span className="font-medium block">
                              {item?.title}
                            </span>
                            {item?.selectedOptions?.length > 0 && (
                              <div className="text-sm text-gray-500 mt-1 space-x-3">
                                {item?.selectedOptions?.color && (
                                  <span>
                                    Color:{" "}
                                    <span
                                      style={{
                                        backgroundColor:
                                          item?.selectedOptions?.color,
                                      }}
                                      className="inline-block w-3 h-3 rounded-full border ml-1"
                                    />
                                  </span>
                                )}
                                {item?.selectedOptions?.size && (
                                  <span>
                                    Size: {item?.selectedOptions?.size}
                                  </span>
                                )}
                                {/* {item.selectedOptions.map((opt: any) => (
                                  <span key={opt.name}>
                                    {opt.name}: {opt.value}
                                  </span>
                                ))} */}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 text-center">
                        {item?.id === discountedProductId ? (
                          <div>
                            <span className="text-gray-400 line-through block text-sm">
                              ${item?.salePrice.toFixed(2)}
                            </span>
                            <span className="text-green-600 font-semibold">
                              $
                              {(
                                (item?.salePrice * (100 - discountPercent)) /
                                100
                              ).toFixed(2)}
                            </span>
                            <div className="text-xs text-green-700">
                              Discount Applied
                            </div>
                          </div>
                        ) : (
                          <span className="font-medium">
                            ${item?.salePrice.toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center items-center border rounded-full w-[100px] mx-auto">
                          <button
                            onClick={() => decreaseQty(item?.id)}
                            className="px-3 py-1 hover:bg-gray-100 rounded-l-full"
                          >
                            -
                          </button>
                          <span className="px-2">{item?.quantity}</span>
                          <button
                            onClick={() => increaseQty(item?.id)}
                            className="px-3 py-1 hover:bg-gray-100 rounded-r-full"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#818487] border border-[#818487] hover:border-red-500 hover:text-red-500 cursor-pointer px-5 py-2 rounded-md transition"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className=" p-6 shadow-md w-full lg:w-[30%] rounded-lg bg-[#f9f9f9]">
              {/* Total Amount Calculation */}
              {discountAmount > 0 && (
                <div className="w-full flex justify-between items-center text-[#010f1c] text-base font-medium pb-1">
                  <span className="font-jost">
                    Discount ({discountPercent}%)
                  </span>
                  <span className="text-green-600">
                    - ${discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-[#010f1c] text-[20px] font-[550] pb-3 ">
                <span className="font-jost">Subtotal</span>
                <span>${(subtotal - discountAmount).toFixed(2)}</span>
              </div>
              <hr className="my-4 text-slate-200" />
              <div className="mb-4">
                <h4 className="mb-[7px] font-medium text-base">
                  Have a Coupon?
                </h4>
                <div className="flex">
                  <input
                    type="text"
                    className=" w-full border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter coupon code"
                    onChange={(e: any) => setCouponCode(e.target.value)}
                    value={couponCode}
                  />
                  <button
                    onClick={handleCouponCode}
                    className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition"
                  >
                    Apply
                  </button>
                  {error && (
                    <p className="text-red-500 text-sm mt-2">
                      {error || "Invalid coupon code."}
                    </p>
                  )}
                </div>
                <hr className="my-4 text-slate-200" />

                <div className="mb-4">
                  <h4 className="mb-[7px] font-medium text-base">
                    Select Shipping Address
                  </h4>
                  {addresses?.length !== 0 && (
                    <select
                      onChange={(e: any) =>
                        setSelectedAddressId(e.target.value)
                      }
                      value={selectedAddressId}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {addresses?.map((address: any) => (
                        <option key={address?.id} value={address?.id}>
                          {address?.label} - {address?.city} -{" "}
                          {address?.country}
                        </option>
                      ))}
                    </select>
                  )}
                  {addresses?.length === 0 && (
                    <p className="text-sm text-slate-800">
                      Please add an address from profile to create order!
                    </p>
                  )}
                </div>
                <hr className="my-4 text-slate-200" />
                <div className="mb-4">
                  <h4 className="mb-[7px] font-medium text-base">
                    Select Payment Method
                  </h4>
                  <select
                    onChange={(e: any) => setSelectedAddressId(e.target.value)}
                    value={selectedAddressId}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={"credit_card"}>Online Payment</option>
                    <option value={"cash_on_delivery"}>Cash on Delivery</option>
                  </select>
                </div>
                <hr className="my-4 text-slate-200" />
                <div className="flex justify-between items-center text-[#010f1c] text-[20px] font-[550] pb-3 ">
                  <span className="font-jost">Total</span>
                  <span>${(subtotal - discountAmount).toFixed(2)}</span>
                </div>

                <button
                  disabled={loading}
                  className="w-full bg-[#010f1c] flex items-center justify-center gap-2 cursor-pointer text-white py-3 rounded-md font-medium hover:bg-[#007bff] transition disabled:opacity-50"
                >
                  {loading && <Loader2 className="animate-spin w-5 h-5 " />}
                  {loading ? "Processing..." : "Proceed to Checkout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
