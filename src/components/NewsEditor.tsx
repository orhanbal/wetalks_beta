/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { handleImageErrorGlobal } from '../App';
import { Article, Category, ArticleStatus } from '../types';
import { useToast } from './Toast';
import { auth } from '../lib/selfhosted';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Quote, 
  Code, 
  Link, 
  Eye, 
  Settings, 
  Save, 
  Send, 
  Sparkles,
  ArrowLeft,
  FileText,
  TrendingUp,
  Globe,
  Sliders,
  Play,
  Wand2,
  Image as ImageIcon,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface NewsEditorProps {
  articleToEdit?: Article | null;
  categories: Category[];
  onSaveNews: (newsData: Partial<Article> & { sourceName?: string; sourceUrl?: string; trInterest?: number; eCommerceImpact?: number; sellerImpact?: number }, status: ArticleStatus) => void;
  onCancel: () => void;
}

export default function NewsEditor({
  articleToEdit,
  categories,
  onSaveNews,
  onCancel
}: NewsEditorProps) {
  const toast = useToast();
  const [title, setTitle] = useState(articleToEdit?.title || '');
  const [summary, setSummary] = useState(articleToEdit?.summary || '');
  const [content, setContent] = useState(articleToEdit?.content || '');
  const [coverImage, setCoverImage] = useState(articleToEdit?.coverImage || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800');
  const [categoryId, setCategoryId] = useState(articleToEdit?.categoryId || 'gundem');
  const [publicationType, setPublicationType] = useState<'news' | 'article' | 'series' | 'interview' | 'event'>(articleToEdit?.publicationType || 'news');
  const [tagInput, setTagInput] = useState(articleToEdit?.tags.join(', ') || 'gundem, analiz');
  const [seoTitle, setSeoTitle] = useState(articleToEdit?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(articleToEdit?.seoDescription || '');

  // Haber-Spesifik Ek Alanlar (News-Specific Extra Fields)
  const [sourceName, setSourceName] = useState((articleToEdit as any)?.sourceName || 'WeTalks Gündem Serisi');
  const [sourceUrl, setSourceUrl] = useState((articleToEdit as any)?.sourceUrl || 'https://wetalks.tr');
  const [trInterest, setTrInterest] = useState<number>((articleToEdit as any)?.trInterest || 85);
  const [eCommerceImpact, setECommerceImpact] = useState<number>((articleToEdit as any)?.eCommerceImpact || 90);
  const [sellerImpact, setSellerImpact] = useState<number>((articleToEdit as any)?.sellerImpact || 80);

  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [showSEOParams, setShowSEOParams] = useState<boolean>(false);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [isScrapingUrl, setIsScrapingUrl] = useState<boolean>(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState<boolean>(false);

  const getApiHeaders = async () => {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  // Auto-fetch & rewrite news from URL
  const handleFetchFromUrl = async () => {
    if (!sourceUrl.trim() || !sourceUrl.startsWith('http')) {
      toast.error('Lütfen geçerli bir kaynak URL giriniz (http:// veya https://).');
      return;
    }
    setIsScrapingUrl(true);
    try {
      const response = await fetch('/api/news/fetch-url', {
        method: 'POST',
        headers: await getApiHeaders(),
        body: JSON.stringify({ url: sourceUrl.trim() })
      });
      const res = await response.json();
      if (!res.success || !res.data) {
        toast.error(res.error || 'Haber linki çekilemedi.');
        return;
      }

      const fetched = res.data;
      if (fetched.siteName) setSourceName(fetched.siteName);
      if (fetched.ogImage) setCoverImage(fetched.ogImage);

      toast.info('Haber kaynağı çekildi, şimdi WeTalks çizgisiyle yeniden yazılıyor... 🤖');

      // Now rewrite with AI
      const rewriteResponse = await fetch('/api/news/rewrite-ai', {
        method: 'POST',
        headers: await getApiHeaders(),
        body: JSON.stringify({
          title: fetched.title,
          description: fetched.description,
          bodyText: fetched.bodyText,
          sourceName: fetched.siteName,
          sourceUrl: fetched.sourceUrl
        })
      });

      const rewriteRes = await rewriteResponse.json();
      if (rewriteRes.success && rewriteRes.data) {
        const d = rewriteRes.data;
        setTitle(d.title || fetched.title);
        setSummary(d.summary || fetched.description);
        setContent(d.content || fetched.bodyText);
        if (d.category) setCategoryId(d.category);
        if (d.tags && Array.isArray(d.tags)) setTagInput(d.tags.join(', '));
        if (!fetched.ogImage && d.curatedImage) {
          setCoverImage(d.curatedImage);
        }
        toast.success('Haber başarıyla çekildi ve WeTalks üslubuyla yeniden yazıldı! 🚀');
      } else {
        if (!title && fetched.title) setTitle(fetched.title);
        if (!summary && fetched.description) setSummary(fetched.description);
        if (!content && fetched.bodyText) setContent(fetched.bodyText);
        toast.success('Haber bilgileri çekilip alanlara aktarıldı.');
      }
    } catch (err: any) {
      console.error('[News Scrape]', err);
      toast.error('Haber linki taranırken bir hata oluştu.');
    } finally {
      setIsScrapingUrl(false);
    }
  };

  // Generate Cover with AI Imagen
  const handleGenerateAiCover = async () => {
    if (!title.trim() && !summary.trim()) {
      toast.error('Görsel üretimi için en azından haber başlığı girmelisiniz.');
      return;
    }
    setIsGeneratingCover(true);
    try {
      const prompt = `Editorial photo for e-commerce news: "${title}". ${summary ? summary.substring(0, 100) : ''}`;
      const response = await fetch('/api/news/generate-cover', {
        method: 'POST',
        headers: await getApiHeaders(),
        body: JSON.stringify({ prompt, topic: categoryId })
      });
      const res = await response.json();
      if (res.success && res.imageUrl) {
        setCoverImage(res.imageUrl);
        if (res.isAiGenerated) {
          toast.success('Habere özel yapay zeka kapak görseli başarıyla üretildi! 🎨');
        } else {
          toast.info(res.notice || 'Konuya tam uyumlu editoryal stok görsel atandı.');
        }
      } else {
        toast.error('Görsel oluşturulamadı.');
      }
    } catch (e) {
      console.error('[AI Cover Generation]', e);
      toast.error('Görsel servisine bağlanılamadı.');
    } finally {
      setIsGeneratingCover(false);
    }
  };

  // Gemini AI Editorial Auto-Assist
  const handleAiAutoAssist = async () => {
    if (!title.trim() && !content.trim()) {
      toast.error('Lütfen analiz için en azından haber başlığı veya içeriği yazın.');
      return;
    }
    setIsAiGenerating(true);
    try {
      const response = await fetch('/api/ai/editorial-assist', {
        method: 'POST',
        headers: await getApiHeaders(),
        body: JSON.stringify({ title, content })
      });
      const res = await response.json();
      if (res.success && res.data) {
        const { suggestedSummary, seoTitle: aiSeoTitle, seoDescription: aiSeoDesc, tags: aiTags } = res.data;
        if (suggestedSummary && !summary) setSummary(suggestedSummary);
        if (aiSeoTitle) setSeoTitle(aiSeoTitle);
        if (aiSeoDesc) setSeoDescription(aiSeoDesc);
        if (aiTags && Array.isArray(aiTags) && aiTags.length > 0) {
          setTagInput(aiTags.join(', '));
        }
        setShowSEOParams(true);
        toast.success('Yapay zeka haber önerileri uygulandı! ✨');
      } else {
        toast.info('Editoryal öneri servisi yanıt veremedi, mevcut alanlar korundu.');
      }
    } catch (e) {
      console.warn('[Gemini AI]', e);
      toast.error('AI asistanına bağlanırken bir sorun oluştu.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Suggested news cover images (premium, high-resolution & commerce/logistics focused)
  const presetCovers = [
    { name: 'Depo & E-Ticaret Lojistiği', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200' },
    { name: 'Amazon & FBA Dağıtım Merkezi', url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=1200' },
    { name: 'Konteyner Limanı & Sınır Ötesi Kargo', url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200' },
    { name: 'El Emeği & Üretici Atölyesi (Etsy)', url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=1200' },
    { name: 'Yapay Zeka Alışveriş Asistanı', url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200' },
    { name: 'Ödeme Sistemleri & Finans', url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&q=80&w=1200' },
  ];

  const handleInsertShortcut = (type: string) => {
    const textarea = document.getElementById('news-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selected = currentText.substring(start, end);

    let replacement = '';
    switch (type) {
      case 'bold':
        replacement = `**${selected || 'Kalın Başlık'}**`;
        break;
      case 'italic':
        replacement = `*${selected || 'İtalik vurgulanmış'}*`;
        break;
      case 'heading':
        replacement = `\n### ${selected || 'Haber Bölüm Analizi'}\n`;
        break;
      case 'quote':
        replacement = `\n> ${selected || 'Alıntı kaynak veya beyan.'}\n`;
        break;
      case 'code':
        replacement = `\`${selected || 'sabit_terim'}\``;
        break;
      case 'link':
        replacement = `[${selected || 'Orijinal Kaynak Bağlantısı'}](${sourceUrl})`;
        break;
    }

    const newContent = currentText.substring(0, start) + replacement + currentText.substring(end);
    setContent(newContent);
    
    // Reset focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  const handleAction = (status: ArticleStatus) => {
    if (!title.trim()) {
      toast.error('Lütfen haber başlığı girin.');
      return;
    }

    const calculatedReadTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 180));
    const processedTags = tagInput
      .split(',')
      .map(t => t.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter(t => t.length > 0);

    onSaveNews({
      id: articleToEdit?.id || 'article_' + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      summary: summary.trim() || title.substring(0, 100) + '...',
      content: content.trim() || 'Haber analizi içeriği boş bırakılamaz.',
      coverImage,
      categoryId, // defaulted to 'gundem' or can select related channel
      publicationType,
      tags: processedTags,
      readTime: calculatedReadTime,
      seoTitle: seoTitle.trim() || title.trim() + ' | WeTalks Gündem',
      seoDescription: seoDescription.trim() || summary.trim().substring(0, 150),
      sourceName: sourceName.trim(),
      sourceUrl: sourceUrl.trim(),
      trInterest,
      eCommerceImpact,
      sellerImpact
    }, status);
  };

  const handleLoadTemplate = () => {
    setContent(`### ❓ Ne Oldu?
Kritik gelişmenin özeti ve olayın çıkış noktası burada yer alacaktır.

### 🎯 Neden Önemli?
Bu haber dijital ticaret oyuncuları ve sektörel dengeler açısından hangi kırılma noktalarını barındırıyor?

### 👥 Kimleri Etkiler?
Bu gelişmeden doğrudan veya dolaylı etkilenecek kitleler, platform satıcıları ve hacim sahibi KOBİ'ler.

### 🇹🇷 Türkiye Pazarı İçin Anlamı
Yerel satıcılar, lojistik süreçleri veya düzenleyici kuruluşlar (Ticaret Bakanlığı vb.) açısından yerel izdüşümü.

### 💡 Satıcılar İçin Fırsatlar & Riskler
* **Fırsat:** Bu aksiyon sonucunda doğan ilk satıcı avantajları.
* **Risk:** Alınması gereken acil önlemler ve gümrük düzenleme riskleri.

> "Kaynak: ${sourceName} adresinden toplanan verilerin WeTalks modelleri ve editör kadrosu tarafından hazırlanan derin yorumudur."`);
  };

  const renderFormattedPreview = () => {
    if (!content.trim()) return <p className="text-zinc-400 italic font-sans text-xs">Analiz gövdesi boş...</p>;
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-sans font-black text-zinc-900 dark:text-zinc-50 mt-5 mb-2.5 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-850 pb-1">{trimmed.replace('### ', '')}</h3>;
      }
      if (trimmed.startsWith('#### ')) {
        return <h4 key={idx} className="text-sm font-sans font-bold text-zinc-900 dark:text-zinc-100 mt-4 mb-2">{trimmed.replace('#### ', '')}</h4>;
      }
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-4 border-emerald-500 pl-4 py-1 italic my-4 text-zinc-650 dark:text-zinc-400 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-r-lg text-xs leading-relaxed">
            {trimmed.replace('> ', '')}
          </blockquote>
        );
      }
      if (trimmed.startsWith('* ')) {
        return (
          <ul key={idx} className="list-disc list-inside pl-4 my-2 text-xs text-zinc-700 dark:text-zinc-300">
            <li className="mt-1">{trimmed.replace('* ', '')}</li>
          </ul>
        );
      }
      if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ')) {
        return (
          <ol key={idx} className="list-decimal list-inside pl-4 my-2 text-xs text-zinc-700 dark:text-zinc-300">
            <li className="mt-1">{trimmed.substring(3)}</li>
          </ol>
        );
      }
      return <p key={idx} className="text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed mb-3">{line}</p>;
    });
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-950 min-h-screen">
      {/* Editorial Top Status */}
      <div className="border-b border-zinc-150 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 py-3.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <button 
            onClick={onCancel}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-950 dark:hover:text-white text-xs font-bold font-sans cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Vazgeç ve Listeye Dön
          </button>
          
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-wider">Modül: WeTalks Haber ve Gündem Yazarı</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Form Fields */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850 pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="text-emerald-500 w-5.5 h-5.5" />
                  {articleToEdit ? 'Gündem Haberini Düzenle' : 'Yeni Haber Analizi Yaz'}
                </h1>
                <p className="text-[11px] text-zinc-400 mt-1">E-ticaret ve dijital ticaret akışlarını AI destekli özgün yorumlarla harmanlayın.</p>
              </div>
            </div>

            {/* Input Başlık */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Haber Başlığı</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Temu’nun Avrupa Hamlesi Türk Satıcıları ve Üreticileri Nasıl Etkileyecek?"
                className="w-full bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-zinc-50 transition-all font-sans"
              />
            </div>

            {/* Input Kısa Özet */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Kısa Özet / Alt Başlık</label>
              <textarea 
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Haber listelerinde ve kartlarda görüntülenecek 1-2 cümlelik çarpıcı özet..."
                rows={2}
                className="w-full bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-zinc-100 transition-all font-sans"
              />
            </div>

            {/* Editor Toolbar & Textarea */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-150 dark:border-zinc-850 pb-2 bg-zinc-50/50 dark:bg-zinc-900/20 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-wrap items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => handleInsertShortcut('bold')}
                    className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350 transition-colors"
                    title="Kalın"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleInsertShortcut('italic')}
                    className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350 transition-colors"
                    title="İtalik"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleInsertShortcut('heading')}
                    className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350 transition-colors"
                    title="Alt Başlık"
                  >
                    <Heading1 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleInsertShortcut('quote')}
                    className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350 transition-colors"
                    title="Alıntı Blok"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleInsertShortcut('link')}
                    className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350 transition-colors"
                    title="Link Ekle"
                  >
                    <Link className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAiAutoAssist}
                    disabled={isAiGenerating}
                    className="flex items-center gap-1.5 text-[10px] font-bold font-sans px-2.5 py-1 rounded bg-gradient-to-r from-orange-500/20 to-purple-500/20 hover:from-orange-500/30 hover:to-purple-500/30 border border-orange-500/30 text-orange-400 transition-all cursor-pointer disabled:opacity-50"
                    title="Gemini AI ile otomatik özet, etiket ve SEO önerisi üret"
                  >
                    <Sparkles className="w-3 h-3 text-orange-400" />
                    <span>{isAiGenerating ? 'Analiz Ediliyor...' : 'Gemini AI Asistan'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadTemplate}
                    className="text-[10px] font-bold font-sans px-2.5 py-1 rounded bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    🗞️ Analiz Şablonu Yükle
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded hover:bg-emerald-500/5 cursor-pointer transition-all"
                  >
                    <Eye className="w-3 h-3" />
                    {previewMode ? 'Yazıcıya Dön' : 'Önizleme Aktif'}
                  </button>
                </div>
              </div>

              {previewMode ? (
                <div className="p-5 min-h-[350px] border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/40 prose prose-zinc dark:prose-invert max-w-none">
                  <h2 className="text-xl font-serif font-black text-zinc-900 dark:text-white mt-0 mb-4">{title || 'Haber Başlığı Girişi Bekleniyor...'}</h2>
                  {renderFormattedPreview()}
                </div>
              ) : (
                <div className="relative">
                  <textarea 
                    id="news-editor-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Analiz ve haber yorumlarını buraya yazın... Kısa alt başlıklar, ne olduğu, Türkiye pazarı için anlamı ve satıcı önerileri formatında hazırlamanız önerilir."
                    rows={16}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-805 p-4 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-zinc-250 font-mono leading-relaxed"
                  />
                  {!content && (
                    <div className="absolute top-24 left-4 right-4 pointer-events-none text-center bg-zinc-100/50 dark:bg-zinc-950/50 border border-dashed border-zinc-250 p-6 rounded-xl space-y-2">
                      <p className="text-xs text-zinc-400 font-sans">Henüz içerik yazmadınız.</p>
                      <button 
                        type="button" 
                        onClick={handleLoadTemplate}
                        className="pointer-events-auto text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3.5 rounded-lg font-sans transition-colors"
                      >
                        WeTalks Analiz Formatı İle Başla
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Metadata Fields */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Action Save/Publish Area */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Haberi Yayınla / Kaydet</span>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleAction('Draft')}
                  className="w-full py-2.5 rounded-xl border border-zinc-255 dark:border-zinc-750 hover:bg-zinc-100 dark:hover:bg-zinc-850/50 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Taslak Sakla
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('Published')}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Hemen Yayınla
                </button>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-[10px] text-zinc-450 leading-relaxed font-sans mt-1">İlke: AI Gündem analizleri doğrudan yayına alınabilir veya taslak olarak saklanıp baş editör onayına gönderilebilir.</p>
              </div>
            </div>

            {/* Orijinal Kaynak Bilgileri */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                ORİJİNAL HABER KAYNAĞI
              </h4>

              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold block uppercase">Kaynak Adı / Platform</span>
                  <input 
                    type="text"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    placeholder="Örn: Trendyol Satıcı Akademisi"
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2 rounded-lg text-xs font-semibold focus:outline-none dark:text-zinc-200 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold block uppercase">Orijinal Haber URL</span>
                    <button
                      type="button"
                      onClick={handleFetchFromUrl}
                      disabled={isScrapingUrl || !sourceUrl.trim()}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      {isScrapingUrl ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Taranıyor...
                        </>
                      ) : (
                        <>
                          <Globe className="w-3 h-3" />
                          URL'den Çek & Yeniden Yaz
                        </>
                      )}
                    </button>
                  </div>
                  <input 
                    type="text"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="Örn: https://shopify.com/editions/news..."
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2 rounded-lg text-xs font-semibold focus:outline-none dark:text-zinc-200 font-sans"
                  />
                </div>
              </div>
            </div>

            {/* AI Değerlendirme ve Skor Modülü */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                AI HABER DEĞERLENDİRME SKORU
              </h4>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-sans font-bold">
                    <span className="text-zinc-450 dark:text-zinc-400 uppercase">🇹🇷 TÜRKİYE İLGİSİ</span>
                    <span className="text-emerald-600 dark:text-emerald-400">%{trInterest}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={trInterest} 
                    onChange={(e) => setTrInterest(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-sans font-bold">
                    <span className="text-zinc-450 dark:text-zinc-400 uppercase">📈 E-TİCARET ETKİSİ</span>
                    <span className="text-indigo-600 dark:text-indigo-400">%{eCommerceImpact}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={eCommerceImpact} 
                    onChange={(e) => setECommerceImpact(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-sans font-bold">
                    <span className="text-zinc-450 dark:text-zinc-400 uppercase">👤 SATICIYA YANSIMASI</span>
                    <span className="text-amber-600 dark:text-amber-400">%{sellerImpact}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sellerImpact} 
                    onChange={(e) => setSellerImpact(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg outline-none"
                  />
                </div>

                <div className="p-3 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">ORTALAMA GÜNDEM SKORU</span>
                  <span className="text-sm font-sans font-black px-2 pb-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {Math.round((trInterest + eCommerceImpact + sellerImpact) / 3)}
                  </span>
                </div>
              </div>
            </div>

            {/* Kapak Görseli ve Presetler */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">HABER KAPAK GÖRSELİ (URL)</span>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Örn: https://images.unsplash.com/..."
                  className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-lg text-xs font-semibold focus:outline-none dark:text-zinc-100 font-sans"
                />
                <button
                  type="button"
                  onClick={handleGenerateAiCover}
                  disabled={isGeneratingCover}
                  title="Yapay Zeka ile Görsel Üret"
                  className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isGeneratingCover ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>AI Görsel</span>
                    </>
                  )}
                </button>
              </div>

              {coverImage && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <img src={coverImage} alt="Cover Preview" className="object-cover w-full h-full" referrerPolicy="no-referrer" onError={(e) => handleImageErrorGlobal(e, 'cover')} />
                </div>
              )}

              <div className="space-y-1.5 pt-1.5">
                <span className="text-[9px] font-sans font-bold text-zinc-405 dark:text-zinc-450 block uppercase">Önerilen Hazır Kapaklar:</span>
                <div className="flex flex-col gap-1">
                  {presetCovers.map((pic, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoverImage(pic.url)}
                      className={`text-[9.5px] p-1 px-2.5 text-left rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 font-sans font-semibold text-zinc-650 dark:text-zinc-350 transition-colors ${coverImage === pic.url ? 'bg-zinc-200 dark:bg-zinc-800 text-emerald-600 font-bold' : ''}`}
                    >
                      {pic.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Kanallar & Etiketler */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Kategori Kanalı & Etiketler</span>
              
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">İLİŞKİLİ KANAL</span>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2 rounded-lg text-xs focus:outline-none dark:text-zinc-200 font-sans text-stone-700"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 pt-1.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">YAYIN BİÇİMİ / TÜRÜ</span>
                <select
                  value={publicationType}
                  onChange={(e) => setPublicationType(e.target.value as any)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2 rounded-lg text-xs focus:outline-none dark:text-zinc-200 font-sans font-bold text-[#0D62FE]"
                >
                  <option value="news">⚡ Haberler (Gündem)</option>
                  <option value="article">📝 Makaleler (Köşe Yazısı)</option>
                  <option value="series">📚 Yazı Dizileri (Serili)</option>
                  <option value="interview">🎙️ Röportajlar (Söyleşi)</option>
                  <option value="event">📅 Etkinlikler (Zirve/Fuar)</option>
                </select>
              </div>

              <div className="space-y-1 pt-1.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">ETİKETLER (VİRGÜLLE AYIRIN)</span>
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e-ticaret, gundem, lojistik"
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2 rounded-lg text-xs font-semibold focus:outline-none dark:text-zinc-200 font-sans text-stone-750"
                />
              </div>
            </div>

            {/* SEO Section Toggle */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 text-left">
              <button 
                type="button"
                onClick={() => setShowSEOParams(!showSEOParams)}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider"
              >
                <span>🌐 SEO Ayarları</span>
                <span className="text-[10px] text-zinc-400 lowercase">{showSEOParams ? 'Gizle' : 'Göster'}</span>
              </button>

              {showSEOParams && (
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-zinc-400 block uppercase">SEO Başlığı</span>
                    <input 
                      type="text" 
                      placeholder="Başlık girilmezse haber başlığı kullanılır"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2 rounded-lg text-xs focus:outline-none dark:text-zinc-200 font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-zinc-400 block uppercase">Meta Açıklaması</span>
                    <textarea 
                      placeholder="Meta açıklaması girilmezse kısa özet kullanılır"
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2 rounded-lg text-xs focus:outline-none dark:text-zinc-200 font-sans"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
