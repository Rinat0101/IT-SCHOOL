"use client";

import Image from "next/image";

export default function Navbar() {
  return (
    <div className="w-full min-h-14 px-20 mb-10 flex items-center justify-between bg-white">
      {/* Logo */}
      <div>
        <Image
          src="/images/plain-logo.png"
          alt="ProCoding Logo"
          width={38}
          height={38}
          className="w-8 h-8 my-2"
        />
      </div>

      {/* Profile 
      <div>
        <Image
          src="/images/user.png"
          alt="User Avatar"
          width={34}
          height={34}
          className="w-8 h-8"
        />
      </div>
      */}
    </div>
  );
}