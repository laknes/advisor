import type { Metadata } from "next";
import { SettingsService } from "@/server/services/SettingsService";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await SettingsService.getPublicSettingsMap();
    const title = String(settings.seo_title || settings.site_name || "سرمایه گذاری موسوی");
    const description = String(settings.seo_description || settings.site_tagline || "پلتفرم حرفه‌ای مشاوره سرمایه‌گذاری و مدیریت پورتفو");
    const faviconUrl = String(settings.site_favicon_url || "/favicon.ico");

    return {
      title,
      description,
      icons: {
        icon: faviconUrl,
        shortcut: faviconUrl,
        apple: faviconUrl,
      },
    };
  } catch {
    return {
      title: "سرمایه گذاری موسوی",
      description: "پلتفرم حرفه‌ای مشاوره سرمایه‌گذاری و مدیریت پورتفو",
      icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/favicon.ico",
      },
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className="scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#160022] text-secondary-100">
        {children}
      </body>
    </html>
  );
}
