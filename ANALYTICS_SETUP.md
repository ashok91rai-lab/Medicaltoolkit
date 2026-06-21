# MedicalToolKit — Analytics Setup Guide

## Step 1: Google Analytics 4 (GA4)

1. Go to: https://analytics.google.com
2. Click "Start measuring" → Create account → Create property
3. Property name: "MedicalToolKit"
4. Select "Web" → Enter your site URL
5. Copy your **Measurement ID** (format: G-XXXXXXXXXX)
6. Open `/js/analytics.js`
7. Replace `G-XXXXXXXXXX` with your actual ID

## Step 2: Google Search Console

1. Go to: https://search.google.com/search-console
2. Click "Add property" → Enter: https://medicaltoolkit.pages.dev
3. Select "HTML tag" verification method
4. Copy the verification code (just the content value, e.g. `abc123xyz`)
5. Open ALL HTML files and replace `REPLACE_WITH_GSC_CODE` with your code
6. Click "Verify" in Search Console
7. Submit your sitemap: https://medicaltoolkit.pages.dev/sitemap.xml

## Step 3: Bing Webmaster Tools

1. Go to: https://www.bing.com/webmasters
2. Add your site URL
3. Select "HTML Meta Tag" verification
4. Copy the content value
5. Replace `REPLACE_WITH_BING_CODE` in all HTML files

## Step 4: Submit Sitemap

After verification, submit sitemap to both:
- Google: Search Console → Sitemaps → https://medicaltoolkit.pages.dev/sitemap.xml
- Bing: Webmaster Tools → Sitemaps → Submit

## What Gets Tracked Automatically

- Page views (all pages)
- Calculator usage events
- Scroll depth (25%, 50%, 75%, 90%)
- Article reads + completions
- Search queries
- Outbound link clicks
- Core Web Vitals (LCP, CLS, FID)
