// Public origin of the production site. Used for the absolute URLs that
// robots.txt and sitemap.xml need. When the site gets a custom domain, set the
// SITE_URL environment variable (or change the default below).
export const SITE_URL = (process.env.SITE_URL ?? "https://hookhub-beta.vercel.app").replace(/\/+$/, "");
