// Curated high-resolution, perfectly matched e-commerce, logistics, and tech photos
export const CURATED_NEWS_IMAGES = {
  temu: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200', // Warehouse packaging & parcels
  amazon: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=1200', // Amazon FBA robotic distribution center
  customs: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200', // Port shipping containers & cargo ship
  tradeMinistry: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200', // Global export / business strategy analytics
  openai: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200', // AI neural model / digital commerce assistant interface
  shopify: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1200', // Digital checkout & POS card payments
  etsy: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=1200', // Handcrafted artisan studio
  worldef: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200', // Tech summit conference
  defaultCommerce: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200'
};

// Known bad or irrelevant or 404 image IDs that shouldn't appear on news
const BAD_NEWS_IMAGE_PATTERNS = [
  'photo-1556742049',    // broken 404 URL on Unsplash
  'photo-1534528741775', // portrait
  'photo-1507003211169', // portrait
  'photo-1539571696357', // portrait
  'photo-1544005313',    // portrait
  'photo-1566492031773', // portrait
  'photo-1535713875002', // avatar
  'photo-1522071820081', // 3 students laughing around laptop
  'photo-1620712943543', // abstract purple brain / skeleton
  'photo-1618005182384'  // abstract liquid wave
];

export function getCuratedNewsCover(article: { id?: string; title?: string; categoryId?: string; coverImage?: string }): string {
  const title = (article.title || '').toLowerCase();
  const id = (article.id || '').toLowerCase();
  const categoryId = (article.categoryId || '').toLowerCase();
  const currentCover = article.coverImage || '';

  // 1. Direct article ID matches or known titles
  if (title.includes('b2b') || title.includes('toptan')) {
    return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200';
  }
  if (title.includes('ödeme') || title.includes('fraud') || title.includes('kalkan')) {
    return 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1200';
  }
  if (title.includes('fasttrack') || title.includes('dağıtım hattı')) {
    return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200';
  }
  if (title.includes('ppc') || title.includes('reklam fonu') || title.includes('reklam ve')) {
    return 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=1200';
  }
  if (title.includes('ticaret bakanlığı') || title.includes('teşvik paket') || title.includes('komisyon desteği') || title.includes('tebliğ')) {
    return CURATED_NEWS_IMAGES.tradeMinistry;
  }
  if (id === 'article_gundem_1' || title.includes('temu')) {
    return CURATED_NEWS_IMAGES.temu;
  }
  if (id === 'article_gundem_2' || (title.includes('amazon') && title.includes('fba'))) {
    return CURATED_NEWS_IMAGES.amazon;
  }
  if (
    id === 'article_gundem_4' || 
    title.includes('openai') || 
    title.includes('alışveriş asistanı') || 
    (title.includes('yapay zeka') && (title.includes('asistan') || title.includes('modelini')))
  ) {
    return CURATED_NEWS_IMAGES.openai;
  }
  if (id === 'article_gundem_5' || title.includes('gümrük') || title.includes('muafiyet')) {
    return CURATED_NEWS_IMAGES.customs;
  }
  if (title.includes('shopify') || categoryId === 'dijital-ticaret' || (article as any).tags?.includes('dijital-ticaret')) {
    return CURATED_NEWS_IMAGES.shopify;
  }
  if (title.includes('etsy')) {
    return CURATED_NEWS_IMAGES.etsy;
  }
  if (title.includes('worldef') || title.includes('zirve')) {
    return CURATED_NEWS_IMAGES.worldef;
  }

  // 2. Check if current cover is one of the bad / avatar / abstract / 404 images
  const isBadCover = BAD_NEWS_IMAGE_PATTERNS.some(pat => currentCover.includes(pat));
  if (isBadCover || !currentCover) {
    if (categoryId === 'amazon') return CURATED_NEWS_IMAGES.amazon;
    if (categoryId === 'yapay-zeka') return CURATED_NEWS_IMAGES.openai;
    if (categoryId === 'etsy') return CURATED_NEWS_IMAGES.etsy;
    if (categoryId === 'dijital-ticaret') return CURATED_NEWS_IMAGES.shopify;
    if (categoryId === 'lojistik' || categoryId === 'gundem') return CURATED_NEWS_IMAGES.temu;
    return CURATED_NEWS_IMAGES.defaultCommerce;
  }

  return currentCover;
}

export function sanitizeArticle<T extends { id?: string; title?: string; categoryId?: string; coverImage?: string }>(art: T): T {
  const correctedCover = getCuratedNewsCover(art);
  if (correctedCover !== art.coverImage) {
    return { ...art, coverImage: correctedCover };
  }
  return art;
}
