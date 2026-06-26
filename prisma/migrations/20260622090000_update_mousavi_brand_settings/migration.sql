UPDATE "site_settings"
SET
  "value" = '"سرمایه گذاری موسوی"'::jsonb,
  "label" = 'نام فارسی سایت',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "key" = 'site_name';

INSERT INTO "site_settings" ("id", "key", "value", "group", "label", "description", "type", "isPublic", "createdAt", "updatedAt")
VALUES
  ('setting_site_name_en', 'site_name_en', '"mousavi invest"'::jsonb, 'general', 'English site name', NULL, 'text', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('setting_site_logo_url', 'site_logo_url', '""'::jsonb, 'general', 'Site logo URL', 'آدرس لوگوی سایت را وارد کنید. می‌تواند مسیر public مثل /logo.png یا لینک کامل تصویر باشد.', 'url', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('setting_site_favicon_url', 'site_favicon_url', '"/favicon.ico"'::jsonb, 'general', 'Favicon URL', 'آدرس favicon سایت را وارد کنید. می‌تواند مسیر public مثل /favicon.ico یا لینک کامل تصویر باشد.', 'url', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE
SET
  "label" = EXCLUDED."label",
  "description" = EXCLUDED."description",
  "type" = EXCLUDED."type",
  "isPublic" = EXCLUDED."isPublic",
  "updatedAt" = CURRENT_TIMESTAMP;

UPDATE "site_settings"
SET
  "value" = '"سرمایه گذاری موسوی | mousavi invest"'::jsonb,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "key" = 'seo_title';

UPDATE "site_settings"
SET
  "value" = '"پلتفرم حرفه‌ای مشاوره سرمایه‌گذاری"'::jsonb,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "key" = 'site_tagline';
