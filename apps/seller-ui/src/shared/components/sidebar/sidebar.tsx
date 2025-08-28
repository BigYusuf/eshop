"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BellPlus,
  BellRing,
  CalendarPlus,
  LayoutPanelLeft,
  ListOrdered,
  LogOut,
  Mail,
  PackageSearch,
  Settings,
  SquarePlus,
  TicketPercent,
  Wallet,
} from "lucide-react";

import useSidebar from "../../../hooks/useSidebar";
import useSeller from "../../../hooks/useSeller";
import Box from "../box";
import { Sidebar } from "./sidebar-styles";
import SidebarItem from "./sidebar-item";
import SidebarMenu from "./sidebar-menu";

const SideBarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const { seller } = useSeller();
  const pathName = usePathname();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? "#0085ff" : "#969696";

  return (
    <Box
      css={{
        height: "100vh",
        zIndex: 202,
        position: "sticky",
        padding: "8px",
        top: 0,
        overflowY: "scroll",
        scrollbarWidth: "none",
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link className="flex justify-center text-center gap-2" href={"/"}>
            <h2 className="text-xl font-bold text-blue-400">Meta </h2>
            <Box>
              <h3 className="text-xl font-medium text-[#ecedee]">
                {seller?.shop?.name || "..."}
              </h3>
              <h5 className="text-xs font-medium text-[#ecedeecf] overflow-hidden whitespace-nowrap text-ellipsis max-w-[170px]">
                {seller?.shop?.address || "..."}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className="block my-3 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            title="Dashboard"
            href="/dashboard"
            isActive={activeSidebar === "/dashboard"}
            icon={
              <LayoutPanelLeft size={26} color={getIconColor("/dashboard")} />
            }
          />
          <div className="block mt-2">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                title="Orders"
                href="/dashboard/orders"
                isActive={activeSidebar === "/dashboard/orders"}
                icon={
                  <ListOrdered
                    size={26}
                    color={getIconColor("/dashboard/orders")}
                  />
                }
              />
              <SidebarItem
                title="Payments"
                href="/dashboard/payments"
                isActive={activeSidebar === "/dashboard/payments"}
                icon={
                  <Wallet
                    size={26}
                    color={getIconColor("/dashboard/payments")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Products">
              <SidebarItem
                title="Create Product"
                href="/dashboard/create-product"
                isActive={activeSidebar === "/dashboard/create-product"}
                icon={
                  <SquarePlus
                    size={24}
                    color={getIconColor("/dashboard/create-product")}
                  />
                }
              />

              <SidebarItem
                title="All Product"
                href="/dashboard/all-products"
                isActive={activeSidebar === "/dashboard/all-products"}
                icon={
                  <PackageSearch
                    size={22}
                    color={getIconColor("/dashboard/all-products")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Events">
              <SidebarItem
                title="Create Event"
                href="/dashboard/create-event"
                isActive={activeSidebar === "/dashboard/create-event"}
                icon={
                  <CalendarPlus
                    size={24}
                    color={getIconColor("/dashboard/create-event")}
                  />
                }
              />

              <SidebarItem
                title="All Events"
                href="/dashboard/all-events"
                isActive={activeSidebar === "/dashboard/all-events"}
                icon={
                  <BellPlus
                    size={22}
                    color={getIconColor("/dashboard/all-events")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem
                title="Inbox"
                href="/dashboard/inbox"
                isActive={activeSidebar === "/dashboard/inbox"}
                icon={
                  <Mail size={24} color={getIconColor("/dashboard/inbox")} />
                }
              />

              <SidebarItem
                title="Settings"
                href="/dashboard/settings"
                isActive={activeSidebar === "/dashboard/settings"}
                icon={
                  <Settings
                    size={22}
                    color={getIconColor("/dashboard/settings")}
                  />
                }
              />
              <SidebarItem
                title="Notifications"
                href="/dashboard/notifications"
                isActive={activeSidebar === "/dashboard/notifications"}
                icon={
                  <BellRing
                    size={24}
                    color={getIconColor("/dashboard/notifications")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Extras">
              <SidebarItem
                title="Discount Codes"
                href="/dashboard/discount-codes"
                isActive={activeSidebar === "/dashboard/discount-codes"}
                icon={
                  <TicketPercent
                    size={24}
                    color={getIconColor("/dashboard/discount-codes")}
                  />
                }
              />

              <SidebarItem
                title="Logout"
                href="/dashboard/logout"
                isActive={activeSidebar === "/dashboard/logout"}
                icon={
                  <LogOut size={22} color={getIconColor("/dashboard/logout")} />
                }
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SideBarWrapper;
