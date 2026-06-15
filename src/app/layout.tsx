import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مشاور پورتفو",
  description: "پلتفرم حرفه‌ای مشاوره سرمایه‌گذاری و مدیریت پورتفو",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
