import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonical?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

const SITE_NAME = 'wetalks.tr';
const SITE_URL = 'https://wetalks.tr';
const DEFAULT_TITLE = 'wetalks.tr — Ticaret, E-Ticaret, Teknoloji ve Girişimcilik';
const DEFAULT_DESCRIPTION = "Türkiye'de ticaret, e-ticaret, markalaşma, teknoloji ve girişimcilik üzerine sahadan notlar.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;
const TWITTER_HANDLE = '@wetalks';

function setMeta(selector: string, attr: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    const [attrName, attrVal] = selector.match(/\[([^=]+)="([^"]+)"\]/)
      ? [selector.match(/\[([^=]+)="/)![1], selector.match(/="([^"]+)"\]/)![1]]
      : [attr, ''];
    el.setAttribute(attrName, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(id: string, data: object) {
  let el = document.head.querySelector<HTMLScriptElement>(`script[data-seo="${id}"]`);
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('data-seo', id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd(id: string) {
  document.head.querySelector(`script[data-seo="${id}"]`)?.remove();
}

export function useSEO({
  title,
  description,
  ogImage,
  ogType = 'website',
  canonical,
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESCRIPTION;
    const image = ogImage || DEFAULT_OG_IMAGE;
    const url = canonical || SITE_URL;

    // ── Basic ──────────────────────────────────────────────
    document.title = fullTitle;
    setMeta('meta[name="description"]', 'content', desc);
    setLink('canonical', url);

    // ── Open Graph (Facebook, LinkedIn, Meta, WhatsApp) ────
    setMeta('meta[property="og:site_name"]', 'content', SITE_NAME);
    setMeta('meta[property="og:type"]', 'content', ogType);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', desc);
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[property="og:image:width"]', 'content', '1200');
    setMeta('meta[property="og:image:height"]', 'content', '630');
    setMeta('meta[property="og:image:alt"]', 'content', fullTitle);
    setMeta('meta[property="og:locale"]', 'content', 'tr_TR');

    if (ogType === 'article' && publishedTime) {
      setMeta('meta[property="article:published_time"]', 'content', publishedTime);
    }
    if (ogType === 'article' && modifiedTime) {
      setMeta('meta[property="article:modified_time"]', 'content', modifiedTime);
    }
    if (ogType === 'article' && author) {
      setMeta('meta[property="article:author"]', 'content', author);
    }
    if (ogType === 'article' && section) {
      setMeta('meta[property="article:section"]', 'content', section);
    }
    if (ogType === 'article' && tags?.length) {
      // Remove old tag metas, then add fresh ones
      document.head.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
      tags.forEach(tag => {
        const el = document.createElement('meta');
        el.setAttribute('property', 'article:tag');
        el.setAttribute('content', tag);
        document.head.appendChild(el);
      });
    }

    // ── Twitter / X Card ──────────────────────────────────
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:site"]', 'content', TWITTER_HANDLE);
    setMeta('meta[name="twitter:creator"]', 'content', TWITTER_HANDLE);
    setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'content', desc);
    setMeta('meta[name="twitter:image"]', 'content', image);
    setMeta('meta[name="twitter:image:alt"]', 'content', fullTitle);
    setMeta('meta[name="twitter:url"]', 'content', url);

    // ── Schema.org JSON-LD ────────────────────────────────
    if (ogType === 'article') {
      setJsonLd('article', {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title || DEFAULT_TITLE,
        description: desc,
        image,
        url,
        datePublished: publishedTime,
        dateModified: modifiedTime || publishedTime,
        author: {
          '@type': 'Person',
          name: author || SITE_NAME,
          url: SITE_URL,
        },
        publisher: {
          '@type': 'Person',
          name: SITE_NAME,
          url: SITE_URL,
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        ...(section ? { articleSection: section } : {}),
        ...(tags?.length ? { keywords: tags.join(', ') } : {}),
      });
      removeJsonLd('website');
    } else {
      setJsonLd('website', {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: desc,
        author: {
          '@type': 'Person',
          name: SITE_NAME,
          url: SITE_URL,
        },
      });
      removeJsonLd('article');
    }

    return () => {
      // Restore defaults on unmount
      document.title = DEFAULT_TITLE;
      setMeta('meta[name="description"]', 'content', DEFAULT_DESCRIPTION);
      setMeta('meta[property="og:type"]', 'content', 'website');
      setMeta('meta[property="og:url"]', 'content', SITE_URL);
      setMeta('meta[property="og:title"]', 'content', DEFAULT_TITLE);
      setMeta('meta[property="og:description"]', 'content', DEFAULT_DESCRIPTION);
      setMeta('meta[property="og:image"]', 'content', DEFAULT_OG_IMAGE);
      setMeta('meta[name="twitter:title"]', 'content', DEFAULT_TITLE);
      setMeta('meta[name="twitter:description"]', 'content', DEFAULT_DESCRIPTION);
      setMeta('meta[name="twitter:image"]', 'content', DEFAULT_OG_IMAGE);
      setLink('canonical', SITE_URL);
      document.head.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
      removeJsonLd('article');
    };
  }, [title, description, ogImage, ogType, canonical, publishedTime, modifiedTime, author, section, JSON.stringify(tags)]);
}
