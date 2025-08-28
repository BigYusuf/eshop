import SideBarWrapper from "../../../shared/components/sidebar/sidebar";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full bg-black min-h-screen">
      <aside className="w-[280px] min-w-[250px] max-w-[300px] p-4 border-r border-r-slate-800 text-white">
        <div className="sticky top-0">
          <SideBarWrapper />
        </div>
      </aside>
      {children}
    </div>
  );
};

export default Layout;
