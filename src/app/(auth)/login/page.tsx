"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) setError("Invalid credentials");
    else router.push("/courses");
  };

  return (
    <div className="bg-white dark:bg-[#0b0f17]">
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        {/* 4rem = navbar height */}

        {/* Desktop Form */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-white dark:bg-[#1a1f29] rounded-2xl dialog-shadow dark:shadow-2xl dark:border dark:border-gray-700 h-full max-w-[24rem] w-full p-6 gap-6">
          <div className="flex flex-col items-center">
            <img src="/images/logo.png" alt="ProCoding Logo" className="w-[14.75rem] h-auto" data-no-dark-bg />
            <h2 className="text-2xl font-semibold text-center text-[#000000] dark:text-gray-100">Log In</h2>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full items-center">
            {/* Email */}
            <div className="relative w-full h-12">
              <input
                type="email"
                id="email"
                required
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer absolute inset-0 w-full h-full rounded-lg border border-[#919EAB52] dark:border-gray-600 bg-transparent px-4 py-3 text-[#000] dark:text-gray-100 outline-none focus:border-[#3880E8] dark:focus:border-[#F4B8FF] transition-colors"
              />
              <label
                htmlFor="email"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-[#1a1f29] px-1 text-sm text-gray-500 dark:text-gray-400 transition-all
                peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-[12px] peer-focus:text-[#3880E8] dark:peer-focus:text-[#F4B8FF]
                peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-[12px]"
              >
                Email
              </label>
            </div>

            {/* Password */}
            <div className="relative w-full h-12">
              <input
                type={showPw ? "text" : "password"}
                id="password"
                required
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer absolute inset-0 w-full h-full rounded-lg border border-[#919EAB52] dark:border-gray-600 bg-transparent px-4 py-3 pr-12 text-[#000] dark:text-gray-100 outline-none focus:border-[#3880E8] dark:focus:border-[#F4B8FF] transition-colors"
              />
              <label
                htmlFor="password"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-[#1a1f29] px-1 text-sm text-gray-500 dark:text-gray-400 transition-all
                peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-[12px] peer-focus:text-[#3880E8] dark:peer-focus:text-[#F4B8FF]
                peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-[12px]"
              >
                Password
              </label>

              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Image
                  src={showPw ? "/icons/eye-off.svg" : "/icons/eye.svg"}
                  alt="toggle password visibility"
                  width={20}
                  height={20}
                />
              </button>
            </div>

            {/* Forgot password */}
            <div className="flex w-full justify-end">
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-blue-2 font-semibold hover:underline text-sm"
              >
                Forgot Password
              </button>
            </div>

            <button type="submit" className="w-full text-white bg-blue-1 py-2 rounded-lg btn-shadow">
              Login
            </button>
          </form>
        </div>

        {/* Mobile/Tablet message */}
        <div className="lg:hidden flex flex-col items-center justify-center text-center p-8">
          <p className="text-xl font-semibold text-gray dark:text-gray-200">
            You can only truly enjoy our platform using big screens.
          </p>
        </div>
      </main>

      {/* Forgot password popover - centered text + blue button */}
      {forgotOpen && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setForgotOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#1a1f29] rounded-xl shadow-lg p-6 w-[92%] max-w-sm text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">Forgot Password</h3>
            <p className="text-sm text-[#1B2633] dark:text-gray-300 mb-4">
              In case you forgot your credentials, please contact us at <br />
              <a href="mailto:support@procoding.com" className="text-blue-600 dark:text-[#F4B8FF] underline">
                support@procoding.com
              </a>
            </p>
            <button
              className="w-full px-4 py-2 rounded-lg bg-blue-1 text-white font-medium hover:opacity-90 transition"
              onClick={() => setForgotOpen(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}