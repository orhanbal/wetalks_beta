/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Article, Category, ArticleStatus, ArticleSeries } from '../types';
import { useToast } from './Toast';
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
  FileText
} from 'lucide-react';
import { DUMMY_ARTICLE_BODY } from '../data';

interface EditorProps {
  articleToEdit?: Article | null;
  categories: Category[];
  series?: ArticleSeries[];
  onSaveArticle: (articleData: Partial<Article>, status: ArticleStatus) => void;
  onCancel: () => void;
  onAddSeries?: (title: string, description: string) => string;
}

export default function Editor({
  articleToEdit,
  categories,
  series = [],
  onSaveArticle,
  onCancel,
  onAddSeries
}: EditorProps) {
  const toast = useToast();
  const [title, setTitle] = useState(articleToEdit?.title || '');
  const [summary, setSummary] = useState(articleToEdit?.summary || '');
  const [content, setContent] = useState(articleToEdit?.content || '');
  const [coverImage, setCoverImage] = useState(articleToEdit?.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800');
  const [categoryId, setCategoryId] = useState(articleToEdit?.categoryId || categories[0]?.id || '');
  const [tagInput, setTagInput] = useState(articleToEdit?.tags.join(', ') || '');
  const [seoTitle, setSeoTitle] = useState(articleToEdit?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(articleToEdit?.seoDescription || '');

  const [selectedSeriesId, setSelectedSeriesId] = useState(articleToEdit?.seriesId || '');
  const [newSeriesTitle, setNewSeriesTitle] = useState('');
  const [newSeriesDesc, setNewSeriesDesc] = useState('');
  const [showNewSeriesForm, setShowNewSeriesForm] = useState(false);

  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [showSEOParams, setShowSEOParams] = useState<boolean>(false);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  // Gemini AI Editorial Auto-Assist for standard articles
  const handleAiAutoAssist = async () => {
    if (!title.trim() && !content.trim()) {
      toast.error('Lütfen analiz için makale başlığı veya gövde metni girin.');
      return;
    }
    setIsAiGenerating(true);
    try {
      const response = await fetch('/api/ai/editorial-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        toast.success('Yapay zeka editoryal önerileri başarıyla uygulandı! ✨');
      } else {
        toast.info('Editoryal öneri servisi yanıt veremedi, varsayılan alanlar korundu.');
      }
    } catch (e) {
      console.warn('[Gemini AI]', e);
      toast.error('AI asistanına bağlanırken bir sorun oluştu.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Suggested cover images to make it look professional instead of typing URLs
  const presetCovers = [
    { name: 'Yapay Zeka / Soyut', url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800' },
    { name: 'Teknoloji / Kod', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800' },
    { name: 'Girişimcilik / Ofis', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800' },
    { name: 'Ticaret / Web3', url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=800' },
    { name: 'Yaşam / Doğa', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800' }
  ];

  const handleInsertShortcut = (type: string) => {
    const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selected = currentText.substring(start, end);

    let replacement = '';
    switch (type) {
      case 'bold':
        replacement = `**${selected || 'Kalın yazı'}**`;
        break;
      case 'italic':
        replacement = `*${selected || 'İtalik yazı'}*`;
        break;
      case 'heading':
        replacement = `\n### ${selected || 'Başlık Yazısı'}\n`;
        break;
      case 'quote':
        replacement = `\n> ${selected || 'Alıntı metni buraya yazılacak.'}\n`;
        break;
      case 'code':
        replacement = `\`${selected || 'kod_satiri'}\``;
        break;
      case 'codeblock':
        replacement = `\n\`\`\`javascript\n${selected || '// Kod bloğu içeriği'}\n\`\`\`\n`;
        break;
      case 'link':
        replacement = `[${selected || 'Link Başlığı'}](https://example.com)`;
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

  const handleLoadDummyContent = () => {
    setContent(DUMMY_ARTICLE_BODY);
  };

  const handleAction = (status: ArticleStatus) => {
    if (!title.trim()) {
      toast.error('Lütfen bir makale başlığı girin.');
      return;
    }

    const calculatedReadTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 180));
    const processedTags = tagInput
      .split(',')
      .map(t => t.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter(t => t.length > 0);

    onSaveArticle({
      id: articleToEdit?.id || 'article_' + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      summary: summary.trim() || title.substring(0, 100) + '...',
      content: content.trim() || 'Makale gövdesi boş bırakılamaz.',
      coverImage,
      categoryId,
      seriesId: selectedSeriesId || undefined,
      tags: processedTags,
      readTime: calculatedReadTime,
      seoTitle: seoTitle.trim() || title.trim() + ' | WeTalks',
      seoDescription: seoDescription.trim() || summary.trim().substring(0, 150)
    }, status);
  };

  // Safe inner markdown-like parsed representation
  const renderFormattedPreview = () => {
    if (!content.trim()) return <p className="text-zinc-400 italic">Gövde içeriği boş...</p>;
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} className="text-xl font-sans font-bold text-zinc-900 dark:text-zinc-50 mt-6 mb-3">{trimmed.replace('### ', '')}</h3>;
      }
      if (trimmed.startsWith('#### ')) {
        return <h4 key={idx} className="text-lg font-sans font-semibold text-zinc-900 dark:text-zinc-100 mt-4 mb-2">{trimmed.replace('#### ', '')}</h4>;
      }
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-4 border-md-primary/50 dark:border-zinc-300 pl-4 py-1 italic my-4 text-zinc-650 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/40 rounded-r-lg">
            {trimmed.replace('> ', '')}
          </blockquote>
        );
      }
      if (trimmed.startsWith('* ')) {
        return (
          <ul key={idx} className="list-disc list-inside pl-4 my-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li className="mt-1">{trimmed.replace('* ', '')}</li>
          </ul>
        );
      }
      if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ')) {
        return (
          <ol key={idx} className="list-decimal list-inside pl-4 my-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li className="mt-1">{trimmed.substring(3)}</li>
          </ol>
        );
      }
      if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
        return (
          <pre key={idx} className="bg-zinc-900 text-emerald-400 font-mono text-xs p-3 rounded-xl overflow-x-auto my-4">
            <code>{trimmed.replace(/```/g, '')}</code>
          </pre>
        );
      }
      if (line === '') return <div key={idx} className="h-3" />;
      return <p key={idx} className="text-sm dark:text-zinc-250 leading-relaxed my-2 select-text">{line}</p>;
    });
  };

  return (
    <div id="article-editor-root" className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-40 animate-in fade-in duration-300">
      
      {/* Upper header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-150 dark:border-zinc-900 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
            title="Vazgeç"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-650 dark:text-zinc-300" />
          </button>
          <div>
            <h2 className="text-xl font-serif font-bold text-zinc-900 dark:text-white">
              {articleToEdit ? 'Makaleyi Güncelle' : 'Yeni Makale Oluştur'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Düşüncelerinizi modern aralıklar, görsel referansları ve SEO bilgileriyle bezeyin.
            </p>
          </div>
        </div>

        {/* Action button groupings */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            id="editor-btn-draft"
            onClick={() => handleAction('Draft')}
            className="flex items-center gap-1.5 border border-zinc-250 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Taslak Kaydet
          </button>

          <button
            id="editor-btn-publish"
            onClick={() => handleAction('Pending')}
            className="flex items-center gap-1.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90 cursor-pointer shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            Yayına Gönder
          </button>
        </div>
      </div>

      {/* Editor Body split details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Inputs and settings */}
        <div className="space-y-5">
          {/* Form Segment: General */}
          <div className="bg-zinc-50/50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-zinc-150/70 dark:border-zinc-850/50 space-y-4">
            
            {/* Title field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">MAKALE BAŞLIĞI *</label>
              <input
                id="editor-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: 2026'da Minimalist Yaşam Felsefesi"
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-zinc-800 dark:text-zinc-50 font-sans font-semibold placeholder-zinc-400"
              />
            </div>

            {/* Summary field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 font-sans">KISA ÖZET / GİRİŞ</label>
              <textarea
                id="editor-summary-input"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Kartlarda görüntülenecek 1-2 cümlelik vurucu bir açıklama yazın..."
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-3 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-800 dark:text-zinc-50 font-sans text-zinc-700 dark:text-zinc-300 font-medium placeholder-zinc-400"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">KATEGORİ</label>
                <select
                  id="editor-category-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-3 rounded-xl text-xs sm:text-sm focus:outline-none dark:text-zinc-200 font-sans"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Tags list */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">ETİKETLER (VİRGÜLLE AYIRIN)</label>
                <input
                  id="editor-tags-input"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="tasarim, yazilim, minimalizm"
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-3 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-800 dark:text-zinc-100 font-sans"
                />
              </div>
            </div>

            {/* Yazı Dizisi (Article Series) Selector */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-sans">
                    📚 YAZI DİZİSİ (SERİ) İLİŞKİLENDİRME
                  </span>
                  <span className="block text-[11px] text-zinc-400">
                    Bu makaleyi sıralı bir yazı dizisinin parçası yapın. Yazı dizileri kendi içlerindeki menülerle kolayca okunabilir.
                  </span>
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowNewSeriesForm(!showNewSeriesForm)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-250 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-850/50 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showNewSeriesForm ? 'Kapat' : '+ Yeni Dizi Oluştur'}
                </button>
              </div>

              {showNewSeriesForm ? (
                <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase font-mono">Yeni Yazı Dizisi Tanımı</span>
                  <div className="space-y-2">
                    <input 
                      type="text"
                      placeholder="Dizi Başlığı (Örn: Modern Çağda Stoacılık Rehberi)"
                      value={newSeriesTitle}
                      onChange={(e) => setNewSeriesTitle(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-800 dark:text-zinc-50"
                    />
                    <textarea 
                      placeholder="Dizi Kısa Sloganı / Tanımı"
                      value={newSeriesDesc}
                      onChange={(e) => setNewSeriesDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-zinc-800 dark:text-zinc-350"
                    />
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (!newSeriesTitle.trim()) {
                            toast.error('Lütfen bir dizi başlığı yazın.');
                            return;
                          }
                          if (onAddSeries) {
                            const newId = onAddSeries(newSeriesTitle.trim(), newSeriesDesc.trim());
                            setSelectedSeriesId(newId);
                            toast.success(`"${newSeriesTitle.trim()}" dizisi oluşturuldu.`);
                            setNewSeriesTitle('');
                            setNewSeriesDesc('');
                            setShowNewSeriesForm(false);
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shadow-sm"
                      >
                        Diziyi Oluştur ve Seç
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <select
                    value={selectedSeriesId}
                    onChange={(e) => setSelectedSeriesId(e.target.value)}
                    className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl text-xs sm:text-sm focus:outline-none dark:text-zinc-200 font-sans"
                  >
                    <option value="">-- Bağımsız Makale (Herhangi Bir Diziye Ait Değil) --</option>
                    {series.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                  {selectedSeriesId && (
                    <button
                      type="button"
                      onClick={() => setSelectedSeriesId('')}
                      className="text-xs text-red-500 hover:underline shrink-0 font-semibold"
                    >
                      Seçimi Temizle
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Cover Image Selection & Preview */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">KAPAK GÖRSELİ (URL)</label>
              <input
                id="editor-cover-input"
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-3 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-800 dark:text-zinc-200 font-mono mb-2"
              />
              
              {/* Presets dropdown selector */}
              <div className="flex flex-wrap gap-2 pt-1">
                {presetCovers.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCoverImage(p.url)}
                    className="text-[10px] font-sans font-semibold bg-white dark:bg-zinc-850 text-zinc-650 dark:text-zinc-350 px-2.5 py-1 rounded-md border border-zinc-150 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Form Segment: SEO config */}
          <div className="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-150/70 dark:border-zinc-850/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSEOParams(!showSEOParams)}
              className="w-full px-5 py-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-50/80 dark:bg-zinc-900/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-850/30 transition-colors focus:outline-none"
            >
              <span className="flex items-center gap-1.5 leading-none">
                <Settings className="w-3.5 h-3.5" />
                SEO VE META ETİKETLERİ (OPSİYONEL)
              </span>
              <span className="text-[11px] text-zinc-400 font-sans capitalize">{showSEOParams ? 'Gizle' : 'Göster'}</span>
            </button>

            {showSEOParams && (
              <div className="p-5 border-t border-zinc-150/50 dark:border-zinc-850/40 space-y-4 animate-in slide-in-from-top-3 duration-200">
                <div>
                  <label className="block text-[10.5px] font-bold text-zinc-400 uppercase tracking-wide mb-1">SEO BAŞLIĞI (TITLE TAG)</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Görünecek tarayıcı sekmesi başlığı"
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-zinc-400 uppercase tracking-wide mb-1">SEO AÇIKLAMASI (DESCRIPTION META)</label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Google arama sonuç listelerinde görünecek en fazla 160 karakterlik özet"
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs dark:text-zinc-100"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Markdown editor text area + toolbar */}
        <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-zinc-150/70 dark:border-zinc-850/50">
          
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-150/80 dark:border-zinc-850/65 mb-4">
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-sans flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              İÇERİK GÖVDESİ (MARKDOWN)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAiAutoAssist}
                disabled={isAiGenerating}
                className="flex items-center gap-1.5 text-[10px] font-sans font-bold bg-gradient-to-r from-orange-500/20 to-purple-500/20 hover:from-orange-500/30 hover:to-purple-500/30 text-orange-400 px-2.5 py-1 rounded-lg border border-orange-500/30 transition-all cursor-pointer disabled:opacity-50"
                title="Gemini AI ile otomatik özet, etiket ve SEO önerisi üret"
              >
                <Sparkles className="w-3 h-3 text-orange-400" />
                <span>{isAiGenerating ? 'Analiz Ediliyor...' : 'Gemini AI Asistan'}</span>
              </button>

              <button
                type="button"
                onClick={handleLoadDummyContent}
                className="text-[10px] font-sans font-bold bg-white dark:bg-zinc-950 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/40 hover:bg-emerald-500/10 cursor-pointer"
                title="Yazmaya başlamak için örnek ve zengin doldurma makalesi yükler."
              >
                Taslağı Otomatik Doldur
              </button>

              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-xl transition-colors cursor-pointer focus:outline-none ${
                    previewMode 
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' 
                      : 'bg-white dark:bg-zinc-950 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-200/50'
                }`}
              >
                <Eye className="w-3 h-3" />
                {previewMode ? 'Yazım Modu' : 'Canlı Önizleme'}
              </button>
            </div>
          </div>

          {/* Toolstrip selector format buttons */}
          {!previewMode && (
            <div className="flex flex-wrap items-center gap-1 mb-2.5 bg-white dark:bg-zinc-950 p-2 rounded-xl border border-zinc-150 dark:border-zinc-850">
              <button type="button" onClick={() => handleInsertShortcut('bold')} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-600 dark:text-zinc-400" title="Kalın"><Bold className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => handleInsertShortcut('italic')} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-600 dark:text-zinc-400" title="İtalik"><Italic className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => handleInsertShortcut('heading')} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-600 dark:text-zinc-400" title="Başlık H3"><Heading1 className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => handleInsertShortcut('quote')} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-600 dark:text-zinc-400" title="Alıntı Blok"><Quote className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => handleInsertShortcut('code')} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-600 dark:text-zinc-400" title="Satır Kod"><Code className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => handleInsertShortcut('codeblock')} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-600 dark:text-zinc-400 text-[10px] font-mono leading-none" title="Blok Kod">C++</button>
              <button type="button" onClick={() => handleInsertShortcut('link')} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-600 dark:text-zinc-400" title="Bağlantı Linki"><Link className="w-3.5 h-3.5" /></button>
            </div>
          )}

          {/* Text Area vs Render Preview Switch block */}
          {previewMode ? (
            <div id="editor-preview-container" className="flex-1 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850/80 min-h-[300px] overflow-y-auto select-text">
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm">
                <span className="block text-[10px] uppercase font-bold text-zinc-400 mb-4 font-sans tracking-wide">Makale Taslak Canlı Önizlemesi:</span>
                {renderFormattedPreview()}
              </div>
            </div>
          ) : (
            <textarea
              id="editor-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Yazmaya başlayın... Markdown desteklenir. (### Başlık, * Madde, > Alıntı vb.) Sıkıntı yaşamamak için üstteki 'Taslağı Otomatik Doldur' tuşunu kullanarak hızlıca test edebilirsiniz."
              className="flex-1 w-full min-h-[300px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850/85 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-800 dark:text-zinc-100 font-sans text-zinc-800 leading-relaxed placeholder-zinc-400 select-text"
              rows={12}
            />
          )}

          <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 pt-3">
            <span>{content.length} karakter yazıldı</span>
            <span>Yaklaşık {Math.max(1, Math.ceil(content.split(/\s+/).length / 180))} dk okuma süresi</span>
          </div>

        </div>

      </div>

    </div>
  );
}
