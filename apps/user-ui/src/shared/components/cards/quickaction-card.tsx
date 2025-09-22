import React from "react";

const QuickActionCard = ({ Icon, title, desc, onClick }: any) => {
  return (
    <div
      onClick={onClick}
      className="bg-white cursor-pointer p-4 rounded-md shadow-sm border border-gray-100 flex items-start gap-4"
    >
      <Icon className="w-6 h-6 text-blue-500 mt-1" />
      <div className="">
        <h4 className="text-sm font-semibold text-gray-800 mb-1">{title}</h4>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
  );
};

export default QuickActionCard;
