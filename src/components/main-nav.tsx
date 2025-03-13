"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HomeIcon, ListMinus, ListPlus, Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { User } from "@supabase/supabase-js";
import { UserProfileDropdown } from "./user-profile-dropdown";
import { createBrowserClient } from "@supabase/ssr";

const navItems = [
  { href: "/", label: "Dashboard", icon: <HomeIcon className="size-5" /> },
  { href: "/expenses", label: "Expenses", icon: <ListMinus className="size-5" /> },
  { href: "/incomes", label: "Incomes", icon: <ListPlus className="size-5" /> },
];

export function MainNav() {
  const pathname = usePathname();
  const [hasSession, setHasSession] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    async function checkSession() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      setHasSession(!!user);
      setUser(user);
    }

    checkSession();
  }, []);

  // Close mobile menu when pathname changes (navigation occurs)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!hasSession) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full shadow-md bg-background dark:border-b">
      <div className="flex h-16 items-center justify-between md:justify-end md:gap-8 px-4 max-w-7xl mx-auto">
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        
        <Link href="/" className="hidden md:flex items-center text-2xl md:text-3xl w-full gap-4">
          {/* <HomeIcon className="size-5" /> */}
          💸
        </Link>

        {/* Desktop navigation */}
        <div className="flex items-center justify-end w-full">
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/50 border border-transparent hover:border-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                  pathname === item.href
                    ? "bg-accent dark:bg-accent/50 border shadow-sm"
                    : "text-foreground hover:text-foreground"
                }`}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <UserProfileDropdown user={user} />
          </div>
        </div>
        {/* User info and actions */}
      </div>
      
      {/* Mobile navigation menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t p-4 space-y-2 animate-in slide-in-from-top duration-300">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-accent ${
                pathname === item.href
                  ? "bg-accent border shadow-sm"
                  : "text-foreground hover:text-foreground"
              }`}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t mt-3">
            <span className="text-xs text-muted-foreground block mb-2">
              {user?.email && `Logged in as ${user.email}`}
            </span>
          </div>
        </div>
      )}
    </nav>
  );
}