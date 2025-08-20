"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <main className="flex items-center justify-center">
        {/* Desktop Form */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-white rounded-2xl dialog-shadow min-h-[32rem] h-full max-w-[24rem] w-full p-6 gap-6 pt-2">
          {/* Logo + Heading */}
          <div className="flex flex-col items-center">
            <img src="/images/logo.png" alt="ProCoding Logo" className="w-[14.75rem] h-auto" />
            <h2 className="text-2xl font-semibold text-center text-[#000000]">Log In</h2>
          </div>

          {/* Error message */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full items-center">
            {/* Email */}
            <div className="relative w-full h-12">
              <input
                type="email"
                id="email"
                required
                placeholder=" " // keep a single space for :placeholder-shown
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer absolute inset-0 w-full h-full rounded-lg border border-[#919EAB52]
               bg-transparent px-4 py-3 text-[#000000] outline-none
               focus:border-[#3880E8] transition-colors"
              />
              <label
                htmlFor="email"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2
               bg-white px-1 text-sm text-gray-500 transition-all
               peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-[12px] peer-focus:text-[#3880E8]
               peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2
               peer-[:not(:placeholder-shown)]:text-[12px]"
              >
                Email
              </label>
            </div>

            {/* Password */}
            <div className="relative w-full h-12">
              <input
                type="password"
                id="password"
                required
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer absolute inset-0 w-full h-full rounded-lg border border-[#919EAB52]
               bg-transparent px-4 py-3 text-[#000000] outline-none
               focus:border-[#3880E8] transition-colors"
              />
              <label
                htmlFor="password"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2
               bg-white px-1 text-sm text-gray-500 transition-all
               peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-[12px] peer-focus:text-[#3880E8]
               peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2
               peer-[:not(:placeholder-shown)]:text-[12px]"
              >
                Password
              </label>
            </div>

            {/* Bottom Section */}
            <div className="flex justify-between items-center w-full text-sm">
              <label className="flex items-center gap-2 text-[#000000]">
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#" className="text-blue-2 font-bold hover:underline">
                Forgot Password
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full text-white bg-blue-1 py-2 rounded-lg btn-shadow"
            >
              Login
            </button>
          </form>
        </div>

        {/* Mobile/Tablet Message */}
        <div className="lg:hidden flex flex-col items-center justify-center text-center p-8">
          <p className="text-xl font-semibold text-gray">
            You can only truly enjoy our platform using big screens.
          </p>
        </div>
      </main>
    </div>
  );
}
