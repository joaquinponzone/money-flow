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
    <nav className="sticky top-0 z-50 w-full border-b-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 md:h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors md:hover:bg-accent ${
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground md:hover:text-foreground"
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