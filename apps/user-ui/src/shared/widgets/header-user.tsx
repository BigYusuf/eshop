import { UserIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

const HeaderUser = ({ user, isLoading }: { user: any; isLoading: boolean }) => {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={user ? "/profile" : "/login"}
        className="w-[50px] h-[50px] flex border-2 items-center justify-center rounded-full border-grayBg"
      >
        <UserIcon color="black" />
      </Link>
      <Link href="/login">
        <span className="block font-medium">Hello</span>
        <span className="font-semibold capitalize">
          {isLoading ? "..." : user ? user?.firstName : "SIgn in"}
        </span>
      </Link>
    </div>
  );
};

export default HeaderUser;
