import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
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
