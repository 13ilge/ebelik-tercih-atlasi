if (
  !process.env.NEXT_PUBLIC_SITE_URL &&
  process.env.VERCEL &&
  process.env.NODE_ENV === "production"
) {
  console.warn(
    "[site] NEXT_PUBLIC_SITE_URL tanımlı değil; canonical/sitemap için VERCEL_URL kullanılıyor. Özel alan adı için bu değişkeni ayarlayın."
  );
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");
