import "./globals.css";
import "../styles/prism.css";
import React from "react";
// eslint-disable-next-line camelcase
import { Inter, Space_Grotesk } from "next/font/google";
import type { Metadata } from "next";
import { ThemeProvider } from "@/context/themeProvider";
import { constructMetadata } from "@/lib/metadata";
import { SessionProvider } from "next-auth/react"; 

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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} custom-scrollbar relative`}
      >
        <SessionProvider>
          {" "}
          <ThemeProvider> {children} </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
