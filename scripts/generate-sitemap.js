const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'https://api.fashioncarft.com/public/api';
const SITE_URL = 'https://gajlaxmifashion.in';
const OUTPUT_FILE = path.join(__dirname, '../src/sitemap.xml');

// Helper function to make HTTP requests
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// Helper function to format date for sitemap
function formatDate(date) {
    return new Date(date).toISOString();
}

// Helper function to escape XML
function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

// Generate sitemap XML
function generateSitemap(urls) {
    const currentDate = formatDate(new Date());
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    urls.forEach(url => {
        sitemap += `
<url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod || currentDate}</lastmod>
    <priority>${url.priority || '0.8'}</priority>
    <changefreq>${url.changefreq || 'weekly'}</changefreq>
</url>`;
    });

    sitemap += `
</urlset>`;

    return sitemap;
}

// Main function to generate sitemap
async function generateSitemapData() {
    const urls = [];
    
    try {
        console.log('🚀 Starting sitemap generation...');
        
        // Static pages with high priority
        const staticPages = [
            { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'daily' },
            { loc: `${SITE_URL}/collections`, priority: '0.9', changefreq: 'weekly' },
            { loc: `${SITE_URL}/cart`, priority: '0.7', changefreq: 'daily' },
            { loc: `${SITE_URL}/wishlist`, priority: '0.7', changefreq: 'daily' },
            { loc: `${SITE_URL}/compare`, priority: '0.6', changefreq: 'weekly' },
            { loc: `${SITE_URL}/checkout`, priority: '0.8', changefreq: 'monthly' },
            { loc: `${SITE_URL}/order/tracking`, priority: '0.6', changefreq: 'monthly' },
            { loc: `${SITE_URL}/order/details`, priority: '0.6', changefreq: 'monthly' },
            { loc: `${SITE_URL}/seller/become-seller`, priority: '0.7', changefreq: 'monthly' },
            { loc: `${SITE_URL}/seller/stores`, priority: '0.7', changefreq: 'weekly' },
            { loc: `${SITE_URL}/blogs`, priority: '0.8', changefreq: 'weekly' },
            { loc: `${SITE_URL}/faq`, priority: '0.7', changefreq: 'monthly' },
            { loc: `${SITE_URL}/contact-us`, priority: '0.7', changefreq: 'monthly' },
            { loc: `${SITE_URL}/offers`, priority: '0.8', changefreq: 'weekly' },
            { loc: `${SITE_URL}/about-us`, priority: '0.7', changefreq: 'monthly' },
            { loc: `${SITE_URL}/search`, priority: '0.6', changefreq: 'weekly' },
            { loc: `${SITE_URL}/privacy-policy`, priority: '0.5', changefreq: 'yearly' },
            { loc: `${SITE_URL}/return-exchange`, priority: '0.6', changefreq: 'monthly' },
            { loc: `${SITE_URL}/term-condition`, priority: '0.5', changefreq: 'yearly' },
            { loc: `${SITE_URL}/refund-and-cancellation`, priority: '0.6', changefreq: 'monthly' },
            { loc: `${SITE_URL}/shipping-delivery`, priority: '0.6', changefreq: 'monthly' },
            { loc: `${SITE_URL}/auth/login`, priority: '0.6', changefreq: 'monthly' },
            { loc: `${SITE_URL}/auth/register`, priority: '0.6', changefreq: 'monthly' },
            { loc: `${SITE_URL}/auth/forgot-password`, priority: '0.5', changefreq: 'monthly' },
            { loc: `${SITE_URL}/auth/login-with-number`, priority: '0.5', changefreq: 'monthly' },
            { loc: `${SITE_URL}/account/dashboard`, priority: '0.7', changefreq: 'weekly' },
            { loc: `${SITE_URL}/account/wallet`, priority: '0.6', changefreq: 'weekly' },
            { loc: `${SITE_URL}/account/notifications`, priority: '0.6', changefreq: 'weekly' },
            { loc: `${SITE_URL}/account/bank-details`, priority: '0.5', changefreq: 'monthly' },
            { loc: `${SITE_URL}/account/point`, priority: '0.6', changefreq: 'weekly' },
            { loc: `${SITE_URL}/account/order`, priority: '0.7', changefreq: 'weekly' },
            { loc: `${SITE_URL}/account/refund`, priority: '0.6', changefreq: 'monthly' },
            { loc: `${SITE_URL}/account/addresses`, priority: '0.6', changefreq: 'monthly' },
            { loc: `${SITE_URL}/account/downloads`, priority: '0.5', changefreq: 'monthly' }
        ];
        
        urls.push(...staticPages);
        console.log(`✅ Added ${staticPages.length} static pages`);

        // Fetch categories
        console.log('📂 Fetching categories...');
        try {
            const categoriesResponse = await makeRequest(`${API_BASE_URL}/category?paginate=1000&status=1`);
            if (categoriesResponse && categoriesResponse.data) {
                categoriesResponse.data.forEach(category => {
                    urls.push({
                        loc: `${SITE_URL}/category/${category.slug}`,
                        lastmod: category.updated_at ? formatDate(category.updated_at) : formatDate(category.created_at),
                        priority: '0.8',
                        changefreq: 'weekly'
                    });
                });
                console.log(`✅ Added ${categoriesResponse.data.length} categories`);
            }
        } catch (error) {
            console.log('⚠️  Could not fetch categories:', error.message);
        }

        // Fetch products
        console.log('🛍️  Fetching products...');
        try {
            const productsResponse = await makeRequest(`${API_BASE_URL}/product?paginate=1000&status=1`);
            if (productsResponse && productsResponse.data) {
                productsResponse.data.forEach(product => {
                    urls.push({
                        loc: `${SITE_URL}/product/${product.slug}`,
                        lastmod: product.updated_at ? formatDate(product.updated_at) : formatDate(product.created_at),
                        priority: '0.9',
                        changefreq: 'weekly'
                    });
                });
                console.log(`✅ Added ${productsResponse.data.length} products`);
            }
        } catch (error) {
            console.log('⚠️  Could not fetch products:', error.message);
        }

        // Fetch blogs
        console.log('📝 Fetching blogs...');
        try {
            const blogsResponse = await makeRequest(`${API_BASE_URL}/blog?paginate=1000&status=1`);
            if (blogsResponse && blogsResponse.data) {
                blogsResponse.data.forEach(blog => {
                    urls.push({
                        loc: `${SITE_URL}/blog/${blog.slug}`,
                        lastmod: blog.updated_at ? formatDate(blog.updated_at) : formatDate(blog.created_at),
                        priority: '0.7',
                        changefreq: 'monthly'
                    });
                });
                console.log(`✅ Added ${blogsResponse.data.length} blogs`);
            }
        } catch (error) {
            console.log('⚠️  Could not fetch blogs:', error.message);
        }

        // Fetch stores
        console.log('🏪 Fetching stores...');
        try {
            const storesResponse = await makeRequest(`${API_BASE_URL}/store?paginate=1000&status=1`);
            if (storesResponse && storesResponse.data) {
                storesResponse.data.forEach(store => {
                    urls.push({
                        loc: `${SITE_URL}/seller/store/${store.slug}`,
                        lastmod: store.updated_at ? formatDate(store.updated_at) : formatDate(store.created_at),
                        priority: '0.7',
                        changefreq: 'weekly'
                    });
                });
                console.log(`✅ Added ${storesResponse.data.length} stores`);
            }
        } catch (error) {
            console.log('⚠️  Could not fetch stores:', error.message);
        }

        // Fetch brands
        console.log('🏷️  Fetching brands...');
        try {
            const brandsResponse = await makeRequest(`${API_BASE_URL}/brand?paginate=1000&status=1`);
            if (brandsResponse && brandsResponse.data) {
                brandsResponse.data.forEach(brand => {
                    urls.push({
                        loc: `${SITE_URL}/brand/${brand.slug}`,
                        lastmod: brand.updated_at ? formatDate(brand.updated_at) : formatDate(brand.created_at),
                        priority: '0.7',
                        changefreq: 'weekly'
                    });
                });
                console.log(`✅ Added ${brandsResponse.data.length} brands`);
            }
        } catch (error) {
            console.log('⚠️  Could not fetch brands:', error.message);
        }

        // Fetch pages
        console.log('📄 Fetching custom pages...');
        try {
            const pagesResponse = await makeRequest(`${API_BASE_URL}/page?paginate=1000&status=1`);
            if (pagesResponse && pagesResponse.data) {
                pagesResponse.data.forEach(page => {
                    urls.push({
                        loc: `${SITE_URL}/page/${page.slug}`,
                        lastmod: page.updated_at ? formatDate(page.updated_at) : formatDate(page.created_at),
                        priority: '0.6',
                        changefreq: 'monthly'
                    });
                });
                console.log(`✅ Added ${pagesResponse.data.length} custom pages`);
            }
        } catch (error) {
            console.log('⚠️  Could not fetch custom pages:', error.message);
        }

        console.log(`\n🎉 Sitemap generation complete! Total URLs: ${urls.length}`);
        
        // Generate and write sitemap
        const sitemapXml = generateSitemap(urls);
        fs.writeFileSync(OUTPUT_FILE, sitemapXml);
        console.log(`📝 Sitemap written to: ${OUTPUT_FILE}`);
        
        // Also write to dist folder
        const distOutputFile = path.join(__dirname, '../dist/fastkart-frontend-rest/browser/sitemap.xml');
        fs.writeFileSync(distOutputFile, sitemapXml);
        console.log(`📝 Sitemap also written to: ${distOutputFile}`);
        
    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
        process.exit(1);
    }
}

// Run the script
generateSitemapData();
