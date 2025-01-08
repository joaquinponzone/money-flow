import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/main-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeProvider } from "next-themes";
import { getUserSession } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "💸 Money Flow",
  description: "Money Flow is a simple bill tracker that helps you manage your bills and payments.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserSession();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {session && (
            <div className="border-b">
              <div className="container flex h-16 items-center justify-between">
                <MainNav />
                <ThemeToggle />
              </div>
            </div>
          )}
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
