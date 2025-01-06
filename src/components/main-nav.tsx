"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "./sign-out";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";

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

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mx-24">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-sm font-medium transition-colors hover:text-primary ${
            pathname === item.href
              ? "text-primary font-black"
              : "text-muted-foreground"
          }`}
        >
          {item.label}
        </Link>
      ))}
      <SignOutButton />
    </nav>
  );
}