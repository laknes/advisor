import { DocumentLocale, LocaleProvider, PageTransition, PersianUiTranslator } from "@/components";
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
      <PersianUiTranslator enabled={lang === 'fa'} />
      <PageTransition>{children}</PageTransition>
    </LocaleProvider>
  );
}
