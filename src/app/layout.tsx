import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import type { JSX, ReactNode } from "react";

import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Button } from "@/components/ui/button";

import { Providers } from "./providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "School Relocation Planner",
  description:
    "Evaluate long-term lease scenarios, curriculum capacity, and financial statements for the 2028 relocation.",
};

/**
 * Check if current route is an auth route
 */
function isAuthRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/reset-password')
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): Promise<JSX.Element> {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || '/';

  // Don't show AppShell on auth routes
  if (isAuthRoute(pathname)) {
    return (
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Providers>{children}</Providers>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <AppShell
            header={
              <AppHeader
                title="School Relocation Planner"
                description="Plan, simulate, and compare relocation scenarios with confidence."
                environment="development"
                actions={
                  <Button variant="secondary" size="sm">
                    New Scenario
                  </Button>
                }
              />
            }
            sidebar={<AppSidebar />}
            footer={<AppFooter />}
          >
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
