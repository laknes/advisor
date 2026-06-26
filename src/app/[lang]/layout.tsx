import { DocumentLocale, LocaleProvider, PageTransition } from "@/components";
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

  return (
    <LocaleProvider initialLocale={lang}>
      <DocumentLocale lang={lang} />
      <PageTransition>{children}</PageTransition>
    </LocaleProvider>
  );
}
