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
    Dashboard: <HomeIcon className="size-8" />,
    Expenses: <ListMinus className="size-8" />,
    Incomes: <ListPlus className="size-8" />,
  };

  return (
    <nav className="flex items-center space-x-6 justify-start mx-4 md:mx-24 w-full">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-sm font-medium transition-colors ${
            pathname === item.href
              ? "text-secondary font-black bg-primary rounded-lg p-2"
              : "text-foreground"
          }`}
        >
          <span className="hidden md:block">{item.label}</span>
          <span className="block md:hidden">{icons[item.label as keyof typeof icons]}</span>
        </Link>
      ))}
      <ThemeToggle />
      <SignOutButton />
    </nav>
  );
}