import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { site } from "@/lib/site";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "ATFU COLLECTION | Bespoke tailoring in Kisumu, Kenya", template: "%s | ATFU COLLECTION" },
  description: "ATFU COLLECTION is a bespoke tailoring and fashion brand in Migosi, Kisumu, Kenya. A Tailor from Ukwala.",
  openGraph: { siteName: site.name, type: "website", locale: "en_KE" },
};

// Runs before paint so the saved theme never flashes. Defaults to dark.
const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem('atfu-theme')||'dark'}catch(e){document.documentElement.dataset.theme='dark'}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${display.variable} ${sans.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
        <WhatsAppFab />
      </body>
    </html>
  );
}
