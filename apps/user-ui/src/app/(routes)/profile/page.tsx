"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  Bell,
  CheckCircle,
  Clock,
  Gift,
  Inbox,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Pencil,
  PhoneCall,
  Receipt,
  Settings,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";

import useUser from "apps/user-ui/src/hooks/useUser";
import StatCard from "apps/user-ui/src/shared/components/cards/stat-card";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import Image from "next/image";
import QuickActionCard from "apps/user-ui/src/shared/components/cards/quickaction-card";
import ShippingAddressSection from "apps/user-ui/src/shared/components/shipping-address";

const ProfilePage = () => {
  const { user, isLoading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryTab = searchParams.get("active") || "Profile";
  const [activeTab, setActiveTab] = useState(queryTab);

  const NavItem = ({ label, Icon, active, danger, onClick }: any) => {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
          active
            ? "bg-blue-100 text-blue-600"
            : danger
            ? "text-red-500 hover:bg-red-50"
            : "text-gray-700 hover:bg-gray-100"
        } `}
      >
        <Icon className="w-4 h-4" />
        {label}
      </button>
    );
  };

  useEffect(() => {
    if (activeTab !== queryTab) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("active", activeTab);
      router.replace(`/profile?${newParams.toString()}`);
    }
  }, [activeTab]);

  const logOutHandler = async () => {
    await axiosInstance.get("/auth/api/logout-user").then((res) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/login");
    });
  };

  return (
    <div className="bg-gray-50 p-6 pb-14">
      <div className="md:max-w-7xl mx-auto">
        {/* Greeting Message */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back,{" "}
            <span className="text-blue-500">
              {isLoading ? (
                <Loader2 className="inline animate-spin w-5 h-5" />
              ) : (
                `${user?.firstName || "User"}`
              )}
            </span>{" "}
            👋
          </h1>
        </div>
        {/* Profile Overview */}
        <div className="gridder-3 gap-6">
          <StatCard title="Total Orders" count={10} Icon={Clock} />
          <StatCard title="Processing Orders" count={2} Icon={Truck} />
          <StatCard title="Completed Orders" count={4} Icon={CheckCircle} />
        </div>
        {/* Sidebar &content layout */}
        <div className="mt-10 flex flex-col md:flex-row gap-6">
          {/* Left Navigation */}
          <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 w-full md:w-1/5">
            <nav className="space-y-2">
              <NavItem
                label="Profile"
                Icon={User}
                active={activeTab === "Profile"}
                onClick={() => setActiveTab("Profile")}
              />
              <NavItem
                label="My Orders"
                Icon={ShoppingBag}
                active={activeTab === "My Orders"}
                onClick={() => setActiveTab("My Orders")}
              />
              <NavItem
                label="Inbox"
                Icon={Inbox}
                active={activeTab === "Inbox"}
                onClick={() => router.push("/inbox")}
              />
              <NavItem
                label="Notifications"
                Icon={Bell}
                active={activeTab === "Notifications"}
                onClick={() => setActiveTab("Notifications")}
              />
              <NavItem
                label="Shipping Address"
                Icon={MapPin}
                active={activeTab === "Shipping Address"}
                onClick={() => setActiveTab("Shipping Address")}
              />
              <NavItem
                label="Change Password"
                Icon={Lock}
                active={activeTab === "Change Password"}
                onClick={() => setActiveTab("Change Password")}
              />
              <NavItem
                label="Logout"
                Icon={LogOut}
                danger
                onClick={() => logOutHandler()}
              />
            </nav>
          </div>
          {/* Main Content */}
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 w-full md:w-[55%]">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {activeTab}
            </h2>
            {activeTab == "Profile" && !isLoading && user ? (
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex gap-3 items-center">
                  <Image
                    src={
                      user?.avatar?.url ||
                      "https://ik.imagekit.io/bigyusuf/shop/avatar/yusuf1.jpg?updatedAt=1758474272745"
                    }
                    alt={user?.id || "No user"}
                    width={60}
                    height={60}
                    className="w-16 h-16 rounded-full border border-gray-200"
                  />
                  <button className="flex items-center gap-1 text-blue-500 text-xs font-medium">
                    <Pencil className="w-4 h-4" /> Change Photo
                  </button>
                </div>
                <p className="">
                  <span className="font-semibold">Name:</span>{" "}
                  {user?.firstName + " " + user?.lastName}
                </p>
                <p className="">
                  <span className="font-semibold">Email: </span> {user?.email}
                </p>
                <p className="">
                  <span className="font-semibold">Joined:</span>{" "}
                  {new Date(user?.createdAt).toLocaleDateString()}
                </p>
                <p className="">
                  <span className="font-semibold">Earned Points:</span>{" "}
                  {user?.points || 0}
                </p>
              </div>
            ) :activeTab == "Shipping Address" && !isLoading && user ?(
                <ShippingAddressSection />
            ): null}
          </div>
          {/* Right Quick Panel */}
          <div className="w-full md:w-1/4 space-y-4">
            <QuickActionCard
              title={"Referral Program"}
              Icon={Gift}
              desc="Invite friends and earn rewards."
            />
            <QuickActionCard
              title={"Your Progress"}
              Icon={BadgeCheck}
              desc="View your earned achievements"
            />
            <QuickActionCard
              title={"Account Settings"}
              Icon={Settings}
              desc="Manage preferences and security."
            />
            <QuickActionCard
              title={"Billing History"}
              Icon={Receipt}
              desc="Check your recent payments."
            />
            <QuickActionCard
              title={"Support Center"}
              Icon={PhoneCall}
              desc="Need help? Contact support."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
