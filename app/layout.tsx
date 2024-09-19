import "./globals.css";
import "../styles/prism.css";
import React from "react";
// eslint-disable-next-line camelcase
import { Inter, Space_Grotesk } from "next/font/google";
import type { Metadata } from "next";
import { ThemeProvider } from "@/context/themeProvider";
import { constructMetadata } from "@/lib/metadata";
import Providers from "@/components/shared/Providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} custom-scrollbar relative  min-h-screen bg-slate-50  antialiased  `}
      >
        <Providers>
          <ThemeProvider>
            {authModal} <div className=" mx-auto h-full  ">{children}</div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
