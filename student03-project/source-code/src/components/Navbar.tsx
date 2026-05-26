"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();

  function logout() {
    document.cookie = "token=; path=/; max-age=0";
    localStorage.clear();
    router.push("/login");
  }

  return (
    <nav className="bg-red-600 text-white px-6 py-3 flex items-center justify-between shadow">
      <div
        className="cursor-pointer flex items-center gap-3"
        onClick={() => router.push("/dashboard")}
      >
        <Image
          src="/dhl-logo.png"
          alt="DHL"
          width={80}
          height={32}
          className="object-contain"
        />
        <span className="font-semibold text-base">Knowledge Base</span>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="text-white hover:bg-red-700"
          onClick={() => router.push("/dashboard")}
        >
          Dashboard
        </Button>
        <Button
          variant="ghost"
          className="text-white hover:bg-red-700"
          onClick={() => router.push("/upload")}
        >
          Upload
        </Button>
        <Button
          variant="ghost"
          className="text-white hover:bg-red-700"
          onClick={() => router.push("/logs")}
        >
          Logs
        </Button>
        <Button
          variant="outline"
          className="text-red-600 bg-white hover:bg-gray-100"
          onClick={logout}
        >
          Logout
        </Button>
      </div>
    </nav>
  );
}
