import type { Metadata } from "next";
import Script from "next/script";
import { ExtensionErrorFilter } from "@/components/ExtensionErrorFilter";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SettingsService } from "@/server/services/SettingsService";
import "./globals.css";

const disableInjectedWalletsScript = `
(function () {
  if (window.__advisorInjectedWalletsDisabled) return;
  window.__advisorInjectedWalletsDisabled = true;

  function isWalletNoise(value) {
    var text = '';
    try {
      text = value && value.stack ? String(value.message || '') + ' ' + String(value.stack || '') : String(value || '');
    } catch (_) {}
    return text.indexOf('Failed to connect to MetaMask') !== -1
      || text.indexOf('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/') !== -1
      || text.indexOf('scripts/inpage.js') !== -1
      || text.indexOf('MetaMask') !== -1
      || text.indexOf('ethereum#initialized') !== -1
      || text.indexOf('eip6963') !== -1;
  }

  window.addEventListener('error', function (event) {
    if (isWalletNoise(event.error) || isWalletNoise(event.message) || isWalletNoise(event.filename)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('unhandledrejection', function (event) {
    if (isWalletNoise(event.reason)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  function blockInjectedProperty(name) {
    try {
      Object.defineProperty(window, name, {
        configurable: true,
        enumerable: false,
        get: function () {
          return undefined;
        },
        set: function () {
          return true;
        }
      });
    } catch (_) {
      try {
        window[name] = undefined;
        delete window[name];
      } catch (_) {}
    }
  }

  function disableWalletAccess() {
    blockInjectedProperty('ethereum');
    blockInjectedProperty('web3');
  }

  function stopWalletProviderEvent(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  disableWalletAccess();
  window.addEventListener('ethereum#initialized', stopWalletProviderEvent, true);
  window.addEventListener('eip6963:announceProvider', stopWalletProviderEvent, true);
  window.addEventListener('eip6963:requestProvider', stopWalletProviderEvent, true);

  var checks = 0;
  var intervalId = window.setInterval(function () {
    disableWalletAccess();
    checks += 1;
    if (checks > 100) window.clearInterval(intervalId);
  }, 100);
})();
`;

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
    <html lang="fa" dir="rtl" data-theme="night" className="scroll-smooth theme-night" suppressHydrationWarning>
      <head>
        <Script id="disable-injected-wallets" strategy="beforeInteractive">
          {disableInjectedWalletsScript}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-[#160022] text-secondary-100">
        <ExtensionErrorFilter />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
