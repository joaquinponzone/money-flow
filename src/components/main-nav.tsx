"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/expenses", label: "Expenses" },
  { href: "/incomes", label: "Incomes" },
];

export function MainNav() {
  const pathname = usePathname();

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
    </nav>
  );
} 