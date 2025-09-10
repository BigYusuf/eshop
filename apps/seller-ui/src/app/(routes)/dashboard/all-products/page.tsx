"use client";
import React, { useMemo, useState } from "react";
import {
  useReactTable,
  flexRender,
  getFilteredRowModel,
  getCoreRowModel,
} from "@tanstack/react-table";
import {
  Search,
  Pencil,
  Eye,
  Trash,
  Plus,
  BarChart,
  Star,
  ChevronRight,
} from "lucide-react";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "packages/components/page-header";
import { useRouter } from "next/navigation";
import DeleteConfirmModal from "apps/seller-ui/src/shared/components/modals/delete-confirmation-modal";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const fetchProducts = async () => {
  const res = await axiosInstance.get(
    "/product/api/product/get-shop-products"
  );
  return res?.data?.products;
};
const ProductList = () => {
  const [error, setError] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });
  console.log("products", products);

  const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: any) => {
          return (
            <Image
              src={row.original.images[0]?.url}
              alt={row.original.images[0]?.id || "pou"}
              className="w-12 h-12 rounded-md object-cover"
              width={200}
              height={200}
            />
          );
        },
      },
      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }: any) => {
          const truncatedTitle =
            row.original?.title.length > 25
              ? `${row.original?.title.substring(0, 25)} ...`
              : row.original.title;
          return (
            <Link
              className="text-blue-400 hover:underline"
              title={row.original.title}
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: any) => <span>${row.original.salePrice}</span>,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => (
          <span
            className={row.original.stock < 10 ? "text-red-500" : "text-white"}
          >
            {row.original.stock} left
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }: any) => (
          <span className={"text-white"}>{row.original.category?.name}</span>
        ),
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }: any) => (
          <div className={"flex gap-1 items-center text-yellow-400"}>
            <Star fill="fde047" size={18} />{" "}
            <span className={"text-white"}>{row.original.ratings || 5}</span>
          </div>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }: any) => (
          <div className={"flex gap-3"}>
            <Link
              href={`/product/${row.original.id}`}
              className="text-blue-400 transition hover:text-blue-300"
            >
              <Eye size={18} />
            </Link>
            <Link
              href={`/product/${row.original.id}`}
              className="text-yellow-400 transition hover:text-yellow-300"
            >
              <Pencil size={18} />
            </Link>
            <button
              onClick={() => console.log("open")}
              className="text-green-400 transition hover:text-green-300"
            >
              <BarChart size={18} />
            </button>
            <button
              onClick={() => openDeleteModal(row.original)}
              className="text-red-400 transition hover:text-red-300"
            >
              <Trash size={18} />
            </button>
          </div>
        ),
      },
    ],
    []
  );
  const openDeleteModal = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(!showDeleteModal);
  };
  const router = useRouter();

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const deleteMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.patch(
        `/product/api/product/delete-product/${selectedProduct.id}`,
        data
      );
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
    },
    onError: (error: AxiosError) => {
      const errMessage =
        (error?.response?.data as { message?: string })?.message ||
        "Invalid credentials";
      setError(errMessage);
      toast.error(errMessage);
    },
  });
  const restoreMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.patch(
        `/product/api/product/restore-product/${selectedProduct.id}`,
        data
      );
      return response?.data;
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
      console.log(data);
      //   toast.success("")
    },
    onError: (error: AxiosError) => {
      const errMessage =
        (error?.response?.data as { message?: string })?.message ||
        "Invalid credentials";
      setError(errMessage);
      toast.error(errMessage);
    },
  });

  return (
    <div className="w-full min-h-screen p-8">
      {/* Header & Breadcrumbs */}
      <PageHeader
        createIcon={Plus}
        createLabel="Add Product"
        onCreate={() => router.push("/dashboard/create-product")}
        title="All Products"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "All Products" },
        ]}
      />

      <div className="mb-4 flex p-2 items-center bg-gray-900 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search products..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full text-white bg-transparent outline-none"
        />
      </div>

      <div className="overflow-x-auto p-4 bg-gray-900 rounded-lg">
        {isLoading ? (
          <p className="text-center text-white">Loading products...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th className="text-left p-3" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:bg-gray-900 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td className="p-3" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {showDeleteModal && (
          <DeleteConfirmModal
            isLoading={deleteMutation?.isPending || restoreMutation?.isPending}
            product={selectedProduct}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={() => deleteMutation.mutate(selectedProduct?.id)}
            onRestore={() => restoreMutation.mutate(selectedProduct?.id)}
          />
        )}
      </div>
    </div>
  );
};

export default ProductList;
