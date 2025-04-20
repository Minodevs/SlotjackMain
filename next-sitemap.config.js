/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://dulcet-tanuki-9e2ad9.netlify.app',
  generateRobotsTxt: true,
  exclude: ['/admin/*', '/server-sitemap.xml'],
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://dulcet-tanuki-9e2ad9.netlify.app/server-sitemap.xml',
    ],
  },
  generateIndexSitemap: false,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
} 