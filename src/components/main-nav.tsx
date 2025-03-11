"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "./sign-out";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { HomeIcon, ListMinus, ListPlus } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/expenses", label: "Expenses" },
  { href: "/incomes", label: "Incomes" },
];

export function MainNav() {
  const pathname = usePathname();
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      setHasSession(!!user);
    }

    checkSession();
  }, []);

  if (!hasSession) {
    return null;
  }

  const icons = {
    Dashboard: <HomeIcon className="size-7" />,
    Expenses: <ListMinus className="size-7" />,
    Incomes: <ListPlus className="size-7" />,
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-primary border-b-[3px] border-black">
      <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`neo-brutalism flex items-center px-3 py-2 text-sm font-bold transition-all ${
                pathname === item.href
                  ? "bg-white"
                  : "bg-primary hover:bg-white"
              }`}
            >
              <span className="md:hidden">
                {icons[item.label as keyof typeof icons]}
              </span>
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="flex items-center space-x-6">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
}