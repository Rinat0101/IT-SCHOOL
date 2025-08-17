// components/Breadcrumbs.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";

export type Crumb = {
  label: string;   
  href?: string;  
};

type Props = {
  items: Crumb[];
  className?: string;
};

const Breadcrumbs: React.FC<Props> = ({ items, className = "" }) => {
  const router = useRouter();

  if (!items?.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
      <ol className="flex items-center gap-2 text-gray-600">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;

          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <button
                  type="button"
                  onClick={() => router.push(item.href!)}
                  className="hover:text-[#7E22CE] transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <span className={isLast ? "text-gray-500" : ""}>{item.label}</span>
              )}

              {!isLast && <span className="select-none">&gt;</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;