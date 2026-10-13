import type { Metadata } from "next";
import { Geist_Mono, Lora, Poppins } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Body text in Lora and headings in Poppins, as in the Anthropic brand guidelines.
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Lets pages use relative paths (like the canonical tag) in URL-based metadata.
  metadataBase: new URL(SITE_URL),
  title: { default: "HookHub", template: "%s · HookHub" },
  description: "Browse community Claude Code hooks by the event they react to.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
