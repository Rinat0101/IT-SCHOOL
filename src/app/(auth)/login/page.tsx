"use client"; // Включаем client component для работы с useRouter

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const result = await signIn("credentials", { email, password, redirect: false });
  
      if (result?.error) {
        setError("Invalid credentials");
      } else {
        router.push("/dashboard");
      }
    };
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <form onSubmit={handleSubmit} className="p-6 bg-gray-100 rounded shadow-md w-80">
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          {error && <p className="text-red-500">{error}</p>}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-2 border rounded"/>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-2 border rounded"/>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
        </form>
      </div>
    );
  }