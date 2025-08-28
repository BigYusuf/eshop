import React from "react";

interface SidebarProps {
  title: string;
  children: React.ReactNode;
}

const SidebarMenu = ({ title, children }: SidebarProps) => {
  return (
    <div className="block">
      <h3 className="text-xs tracking-[0.04rem] pl-1">{title}</h3>
      {children}
    </div>
  );
};

export default SidebarMenu;
