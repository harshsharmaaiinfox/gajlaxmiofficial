# Sitemap Generation

This project includes an automated sitemap generation script that creates a comprehensive XML sitemap for your Gajlaxmi Fashion e-commerce website.

## What's Included

The generated sitemap includes:

### Static Pages (34 URLs)
- Homepage (`/`)
- Collections (`/collections`)
- Shopping pages (`/cart`, `/wishlist`, `/compare`, `/checkout`)
- Order management (`/order/tracking`, `/order/details`)
- Seller pages (`/seller/become-seller`, `/seller/stores`)
- Blog pages (`/blogs`)
- Account pages (`/account/*`)
- Authentication pages (`/auth/*`)
- Legal pages (`/privacy-policy`, `/terms-conditions`, etc.)
- Support pages (`/contact-us`, `/faq`, `/about-us`)

### Dynamic Content
- **Products**: All product pages (`/product/{slug}`) - Currently 1000+ products
- **Categories**: All category pages (`/category/{slug}`) - Currently 3 categories
- **Stores**: All seller store pages (`/seller/store/{slug}`) - Currently 8 stores
- **Custom Pages**: CMS pages (`/page/{slug}`) - Currently 5 pages
- **Blogs**: Blog posts (`/blog/{slug}`) - Currently 0 blogs
- **Brands**: Brand pages (`/brand/{slug}`) - Currently 0 brands

## How to Use

### Generate Sitemap
```bash
npm run generate-sitemap
```

Or run directly:
```bash
node scripts/generate-sitemap.js
```

### Output Files
The script generates sitemaps in two locations:
- `src/sitemap.xml` - Source sitemap
- `dist/fastkart-frontend-rest/browser/sitemap.xml` - Production sitemap

## Configuration

The script is configured to:
- **API Base URL**: `https://api.fashioncarft.com/public/api`
- **Site URL**: `https://gajlaxmifashion.in`
- **Pagination**: Fetches up to 1000 items per endpoint
- **Status Filter**: Only includes active/published content (`status=1`)

## SEO Features

Each URL includes:
- **Priority**: Based on page importance (0.5-1.0)
- **Change Frequency**: How often the page is updated
- **Last Modified**: Actual last update date from API
- **Proper XML Escaping**: Safe for search engines

## Priority Levels

- **1.0**: Homepage
- **0.9**: Collections, Products
- **0.8**: Checkout, Blogs, Offers
- **0.7**: Cart, Wishlist, Account pages, Categories, Stores
- **0.6**: Compare, Order tracking, Auth pages, Custom pages
- **0.5**: Legal pages, Password reset

## Change Frequencies

- **Daily**: Homepage, Cart, Wishlist
- **Weekly**: Collections, Products, Categories, Stores, Account pages
- **Monthly**: Checkout, Blogs, Legal pages, Auth pages, Custom pages
- **Yearly**: Terms, Privacy Policy

## Automation

Consider setting up automated sitemap generation:
1. **Daily**: For active e-commerce sites
2. **Weekly**: For moderate content updates
3. **Monthly**: For stable sites

You can add this to your CI/CD pipeline or set up a cron job.

## Troubleshooting

If the script fails:
1. Check API connectivity
2. Verify API endpoints are accessible
3. Ensure proper authentication if required
4. Check console output for specific error messages

## Total URLs Generated

Current sitemap contains **1,050 URLs**:
- 34 Static pages
- 1,000 Products
- 3 Categories
- 8 Stores
- 5 Custom pages
- 0 Blogs
- 0 Brands

The script automatically handles pagination and will include all available content from your API.
