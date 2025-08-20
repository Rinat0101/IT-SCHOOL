'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/dashboard" })}
      className="
        w-full 
        rounded-lg 
        border 
        border-[#919EAB]/30 
        px-4 py-[6px] 
        text-[16px] 
        font-semibold 
        text-[#212B36] 
        transition 
        duration-200 
        hover:border-purple-600 
        hover:text-purple-600
      "
    >
      Logout
    </button>
  );
}