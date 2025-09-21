import Link from "next/link";
import React from "react";

const TitleBreadCrumbs = ({
  title,
  subTitle,
}: {
  title: string;
  subTitle: string;
}) => {
  return (
    <div className="pb-[50px]">
      <h1 className="md:pt-[50px] font-medium text-[44px] leading-[1] mb-[16px] font-jost">
        {title}
      </h1>
      <Link href={"/"} className="text-[#55585b] hover:underline">
        Home
      </Link>
      <span className="inline-block mx-1 p-[1.5px] bg-[#a8acb0] rounded-full"></span>
      <span className="text-[#55585b]">{subTitle}</span>
    </div>
  );
};

export default TitleBreadCrumbs;
