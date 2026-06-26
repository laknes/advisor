import { prisma } from '@/lib/db';
import { SettingsService } from '@/server/services/SettingsService';

interface ExternalPrice {
  symbol?: string;
  name?: string;
  market?: string;
  currentPrice?: number | string;
  price?: number | string;
  previousClose?: number | string;
  dayHigh?: number | string;
  high?: number | string;
  dayLow?: number | string;
  low?: number | string;
  volume?: number | string;
  marketCap?: number | string;
  change?: number | string;
  changePercent?: number | string;
}

const providers = [
  { key: 'tsetmc', label: 'بورس تهران', marketSlug: 'iran-stocks' },
  { key: 'forex', label: 'فارکس', marketSlug: 'forex' },
  { key: 'gold', label: 'طلا', marketSlug: 'gold' },
  { key: 'currency', label: 'ارز', marketSlug: 'currency' },
  { key: 'crypto', label: 'کریپتو', marketSlug: 'crypto' },
];

const freeMarketDataProviders = [
  { key: 'alpha_vantage', label: 'Alpha Vantage', docsKey: 'alpha_vantage_docs_url' },
  { key: 'finnhub', label: 'Finnhub', docsKey: 'finnhub_docs_url' },
  { key: 'twelve_data', label: 'Twelve Data', docsKey: 'twelve_data_docs_url' },
  { key: 'polygon', label: 'Polygon / Massive', docsKey: 'polygon_docs_url' },
  { key: 'coingecko', label: 'CoinGecko Demo API', docsKey: 'coingecko_docs_url' },
];

function toNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined;
  const normalized = typeof value === 'string' ? value.replace(/,/g, '') : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readPriceItems(payload: unknown): ExternalPrice[] {
  if (Array.isArray(payload)) return payload as ExternalPrice[];
  if (payload && typeof payload === 'object') {
    const objectPayload = payload as Record<string, unknown>;
    if (Array.isArray(objectPayload.prices)) return objectPayload.prices as ExternalPrice[];
    if (Array.isArray(objectPayload.data)) return objectPayload.data as ExternalPrice[];
    if (Array.isArray(objectPayload.results)) return objectPayload.results as ExternalPrice[];
  }
  return [];
}

export class MarketDataService {
  static async getIntegrationStatus() {
    const settings = await SettingsService.getSettings(false);
    const settingsMap = Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
    const [priceCount, latestPrice] = await Promise.all([
      prisma.price.count(),
      prisma.price.findFirst({ orderBy: { timestamp: 'desc' }, include: { market: true } }),
    ]);

    const paymentGateways = [
      { key: 'zarinpal', label: 'Zarinpal', enabled: Boolean(settingsMap.zarinpal_enabled), configured: Boolean(settingsMap.zarinpal_merchant_id) },
      { key: 'zibal', label: 'Zibal', enabled: Boolean(settingsMap.zibal_enabled), configured: Boolean(settingsMap.zibal_merchant) },
      { key: 'idpay', label: 'IDPay', enabled: Boolean(settingsMap.idpay_enabled), configured: Boolean(settingsMap.idpay_api_key) },
      { key: 'payir', label: 'Pay.ir', enabled: Boolean(settingsMap.payir_enabled), configured: Boolean(settingsMap.payir_api_key) },
    ];

    const marketProviders = providers.map((provider) => ({
      key: provider.key,
      label: provider.label,
      enabled: Boolean(settingsMap[`${provider.key}_enabled`]),
      configured: Boolean(settingsMap[`${provider.key}_prices_url`]),
    }));

    const freeProviders = freeMarketDataProviders.map((provider) => ({
      key: provider.key,
      label: provider.label,
      enabled: Boolean(settingsMap[`${provider.key}_enabled`]),
      configured: provider.key === 'coingecko'
        ? Boolean(settingsMap[`${provider.key}_base_url`])
        : Boolean(settingsMap[`${provider.key}_api_key`]),
      baseUrl: settingsMap[`${provider.key}_base_url`] || '',
      docsUrl: settingsMap[provider.docsKey] || '',
    }));

    return {
      payments: {
        defaultGateway: settingsMap.payment_default_gateway || 'zarinpal',
        callbackConfigured: Boolean(settingsMap.payment_callback_url),
        gateways: paymentGateways,
      },
      marketData: {
        enabled: Boolean(settingsMap.market_data_enabled),
        refreshSeconds: Number(settingsMap.market_data_refresh_seconds || 300),
        defaultFreeProvider: settingsMap.market_data_default_free_provider || 'alpha_vantage',
        freeProviders,
        providers: marketProviders,
        priceCount,
        latestPrice,
      },
    };
  }

  static async syncConfiguredPrices() {
    const allSettings = Object.fromEntries((await SettingsService.getSettings(false)).map((setting) => [setting.key, setting.value]));

    if (!allSettings.market_data_enabled) {
      return { updated: 0, providers: [] };
    }

    const results: Array<{ provider: string; updated: number; error?: string }> = [];

    for (const provider of providers) {
      if (!allSettings[`${provider.key}_enabled`] || !allSettings[`${provider.key}_prices_url`]) continue;

      try {
        const market = await prisma.market.findFirst({
          where: { slug: provider.marketSlug },
        });

        if (!market) {
          results.push({ provider: provider.key, updated: 0, error: `Market ${provider.marketSlug} not found` });
          continue;
        }

        const response = await fetch(String(allSettings[`${provider.key}_prices_url`]), {
          headers: allSettings[`${provider.key}_api_key`]
            ? { Authorization: `Bearer ${String(allSettings[`${provider.key}_api_key`])}` }
            : undefined,
          cache: 'no-store',
        });

        if (!response.ok) {
          results.push({ provider: provider.key, updated: 0, error: `HTTP ${response.status}` });
          continue;
        }

        const items = readPriceItems(await response.json());
        let updated = 0;

        for (const item of items) {
          const symbol = item.symbol || item.name;
          const currentPrice = toNumber(item.currentPrice ?? item.price);
          if (!symbol || currentPrice === undefined) continue;

          await prisma.price.create({
            data: {
              marketId: market.id,
              symbol,
              currentPrice,
              previousClose: toNumber(item.previousClose),
              dayHigh: toNumber(item.dayHigh ?? item.high),
              dayLow: toNumber(item.dayLow ?? item.low),
              volume: toNumber(item.volume),
              marketCap: toNumber(item.marketCap),
              change: toNumber(item.change),
              changePercent: toNumber(item.changePercent),
            },
          });
          updated += 1;
        }

        results.push({ provider: provider.key, updated });
      } catch (error) {
        results.push({ provider: provider.key, updated: 0, error: error instanceof Error ? error.message : 'Sync failed' });
      }
    }

    return {
      updated: results.reduce((sum, result) => sum + result.updated, 0),
      providers: results,
    };
  }
}
