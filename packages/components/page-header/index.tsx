import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ElementType, ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  titleIcon?: ReactNode; // 👈 can be Lucide, emoji, custom SVG, anything
  breadcrumb: { label: string; href?: string }[];
  onCreate?: () => void;
  createLabel?: string;
  createIcon?: ElementType; // still Lucide or any React component
}

export default function PageHeader({
  title,
  titleIcon,
  breadcrumb,
  onCreate,
  createLabel = "Create",
  createIcon: CreateIcon,
}: PageHeaderProps) {
  return (
    <div className="mb-4">
      {/* Top Section */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          {titleIcon && <span className="text-xl">{titleIcon}</span>}
          <h2 className="dash-title">{title}</h2>
        </div>

        {onCreate && (
          <button
            onClick={onCreate}
            className="bg-blue-600 rounded-lg px-4 py-2 flex hover:bg-blue-700 gap-2 items-center text-white"
          >
            {CreateIcon && <CreateIcon size={18} />}
            {createLabel}
          </button>
        )}
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center text-sm">
        {breadcrumb.map((item, idx) => (
          <div key={idx} className="flex items-center">
            {item.href ? (
              <Link
                href={item.href}
                className="text-[#80deea] cursor-pointer hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-white">{item.label}</span>
            )}
            {idx < breadcrumb.length - 1 && (
              <ChevronRight size={18} className="opacity-70 text-white mx-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
