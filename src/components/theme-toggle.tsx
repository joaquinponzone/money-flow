"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <>
      <div 
        className="flex items-center justify-center h-10 w-10 rounded-lg md:hidden"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <Sun className="size-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute size-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </div>
      <Button
        variant="ghost"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="hidden md:flex items-center justify-center h-10 w-10 rounded-full"
      >
        <Sun className="size-8 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute size-8 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </>
  )
}