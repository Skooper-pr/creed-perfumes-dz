import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://creed-perfumes-dz.netlify.app';

// Static store routes
const staticRoutes = [
  '',
  '/products',
  '/cart',
  '/checkout',
  '/track',
  '/contact',
  '/faq',
];

// Initial product catalog slugs
const productSlugs = [
  'creed-aventus',
  'creed-silver-mountain-water',
  'creed-green-irish-tweed',
  'creed-millesime-imperial',
  'creed-viking',
  'creed-aventus-for-her',
  'creed-carmina',
  'creed-wind-flowers',
];

async function generate() {
  const slugs = new Set(productSlugs);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/products?select=slug`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          data.forEach((p) => {
            if (p.slug) slugs.add(p.slug);
          });
        }
      }
    } catch (e) {
      console.warn('Could not fetch live products from Supabase for sitemap, using initial dataset.');
    }
  }

  const currentDate = new Date().toISOString().split('T')[0];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes
  .map(
    (route) => `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
${Array.from(slugs)
  .map(
    (slug) => `  <url>
    <loc>${baseUrl}/products/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml.trim(), 'utf-8');
  console.log(`✅ sitemap.xml generated with ${staticRoutes.length + slugs.size} URLs.`);
}

generate();
