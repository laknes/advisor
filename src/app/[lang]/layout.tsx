import { LocaleProvider, PageTransition } from "@/components";
import { use } from "react";

export default function LocaleLayout({
  children,
  params: paramsPromise,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const params = use(paramsPromise);
  const lang = params.lang === "en" ? "en" : "fa";
  const dir = lang === "fa" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} className="scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#160022] text-secondary-100">
        <LocaleProvider initialLocale={lang}>
          <PageTransition>{children}</PageTransition>
        </LocaleProvider>
      </body>
    </html>
  );
}
