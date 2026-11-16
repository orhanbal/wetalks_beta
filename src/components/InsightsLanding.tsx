import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  Cpu, 
  BookOpen, 
  TrendingUp, 
  UserCheck, 
  Briefcase, 
  ShieldAlert, 
  Lightbulb, 
  Layers, 
  Globe, 
  Users, 
  CheckCircle, 
  MessageSquare, 
  Mail, 
  Download, 
  Maximize2, 
  Play, 
  Check, 
  FileText, 
  Terminal,
  ExternalLink,
  ChevronLeft,
  X
} from 'lucide-react';
import { createContactMessage } from '../lib/selfhosted';

interface InsightsLandingProps {
  onNavigate: (view: string, params?: any) => void;
  lang?: 'tr' | 'en';
  profiles?: any[];
  showExploreProjectButton?: boolean;
}

export default function InsightsLanding({ onNavigate, lang = 'tr', profiles, showExploreProjectButton = true }: InsightsLandingProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [selectedInsightTab, setSelectedInsightTab] = useState<'sample' | 'interactive'>('sample');
  const [customStory, setCustomStory] = useState('');
  const [analyzingStory, setAnalyzingStory] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);

  const pitchDeckSlides = lang === 'en' ? [
    {
      title: "Introduction & Vision",
      subtitle: "WHAT IS WETALKS INSIGHTS?",
      bullets: [
        "Turkey's first human & AI co-created business insights platform.",
        "Built with Gemini, guided by human experience.",
        "Perfect balance of real field experience and state-of-the-art AI analysis power."
      ],
      color: "from-[#0D62FE]/20 to-[#FF4C1C]/10"
    },
    {
      title: "Problem & Opportunity",
      subtitle: "THE BIGGEST MISSING PIECE FOR ENTREPRENEURS",
      bullets: [
        "There is plenty of raw news in the market, but no actionable insights.",
        "Entrepreneurial experiences get lost in scattered blogs.",
        "SMEs and e-commerce sellers lack strategic decision-making support."
      ],
      color: "from-amber-500/10 to-rose-500/10"
    },
    {
      title: "Solution & Architecture",
      subtitle: "GEMINI AI ANALYSIS LAYER",
      bullets: [
        "Stories and news are analyzed and turned into risk, opportunity, and action lists.",
        "The speed and synthesis power of AI is presented after being filtered editorially.",
        "Clear, direct, transparent, and action-oriented language."
      ],
      color: "from-indigo-500/10 to-cyan-500/10"
    },
    {
      title: "Why Google & Gemini?",
      subtitle: "COLLABORATION & CO-CREATION VISION",
      bullets: [
        "Gemini is not just a library, it plays the role of a co-founder in design, coding, and content.",
        "Extracts business strategy using advanced reasoning capabilities.",
        "Goal: Create a regional success story to integrate into the global ecosystem."
      ],
      color: "from-emerald-500/10 to-teal-500/10"
    }
  ] : [
    {
      title: "Giriş ve Vizyon",
      subtitle: "WETALKS INSIGHTS NEDİR?",
      bullets: [
        "Türkiye'nin ilk insan ve yapay zekâ ortak üretimi iş içgörüsü platformu.",
        "Built with Gemini, guided by human experience.",
        "Gerçek saha tecrübesi ile en son yapay zekâ analiz gücünün mükemmel dengesi."
      ],
      color: "from-[#0D62FE]/20 to-[#FF4C1C]/10"
    },
    {
      title: "Problem ve Fırsat",
      subtitle: "GİRİŞİMCİLERİN EN BÜYÜK EKSİĞİ",
      bullets: [
        "Sektörde ham haber çok fazla, ancak eyleme dökülebilir analiz (insight) yok.",
        "Girişimci tecrübeleri dağınık bloglarda kayboluyor.",
        "KOBİ'ler ve e-ticaret satıcıları stratejik karar alma desteğinden yoksun."
      ],
      color: "from-amber-500/10 to-rose-500/10"
    },
    {
      title: "Çözüm ve Mimari",
      subtitle: "GEMINI AI ANALİZ KATMANI",
      bullets: [
        "Hikâyeler ve haberler analiz edilerek risk, fırsat ve eylem listelerine dönüştürülür.",
        "Yapay zekanın hız ve sentez gücü, editoryal süzgeçten geçirilerek sunulur.",
        "Anlaşılır, direkt, şeffaf ve aksiyon odaklı bir dil."
      ],
      color: "from-indigo-500/10 to-cyan-500/10"
    },
    {
      title: "Neden Google & Gemini?",
      subtitle: "İŞ BİRLİĞİ & ORTAK ÜRETİM VİZYONU",
      bullets: [
        "Gemini sadece bir kütüphane değil, tasarım, kodlama ve içerikte kurucu ortak rolündedir.",
        "Gelişmiş akıl yürütme (reasoning) yetenekleri ile iş stratejisi çıkarımı.",
        "Hedef: Bölgesel başarı hikayesi yaratarak küresel ekosisteme entegrasyon."
      ],
      color: "from-emerald-500/10 to-teal-500/10"
    }
  ];

  const t = {
    badge: lang === 'en' 
      ? "TURKEY-BASED AI-POWERED BUSINESS MEDIA & INSIGHT PLATFORM" 
      : "TÜRKİYE MERKEZLİ AI-POWERED BUSINESS MEDIA & INSIGHT PLATFORM",
    heroTitle_1: lang === 'en' ? "The Co-Insight Platform Built with" : "Orhan Balcı + Gemini AI ile İnşa Edilen",
    heroTitle_2: lang === 'en' ? "Human & AI" : "İnsan & Yapay Zekâ",
    heroTitle_3: lang === 'en' ? "Co-Creation" : "Ortak İçgörü Platformu",
    heroSubtitle: lang === 'en'
      ? "WeTalks Insights transforms real entrepreneur experiences and current industry news into actionable business insights with Gemini AI powered analyses."
      : "WeTalks Insights, gerçek girişimci deneyimlerini ve güncel sektör haberlerini Gemini AI destekli analizlerle uygulanabilir iş içgörülerine dönüştürür.",
    btnPitchDeck: lang === 'en' ? "View Pitch Deck" : "Pitch Deck'i Gör",
    btnExplore: lang === 'en' ? "Explore Project" : "Projeyi İncele",
    step1_title: lang === 'en' ? "Real Life Experience" : "Gerçek Yaşantı",
    step1_desc: lang === 'en' 
      ? "Entrepreneurial experiences and instant market developments join the system in raw form." 
      : "Girişimci deneyimleri ve anlık sektör gelişmeleri ham haliyle sisteme dahil olur.",
    step2_title: lang === 'en' ? "Gemini AI Analysis" : "Gemini AI Analizi",
    step2_desc: lang === 'en'
      ? "Models structure content with advanced business logic, risk, and opportunity filters."
      : "Modeller gelişmiş iş mantığı, risk ve fırsat filtreleriyle içeriği yapılandırır.",
    step3_title: lang === 'en' ? "Actionable Insight" : "Uygulanabilir İçgörü",
    step3_desc: lang === 'en'
      ? "The resulting WeTalks Insight directly nourishes sellers' and founders' decisions."
      : "Ortaya çıkan WeTalks Insight, satıcıların ve kurucuların kararlarını doğrudan besler.",
    bigIdea_badge: lang === 'en' ? "THE BIG IDEA" : "THE BIG IDEA / BÜYÜK FİKİR",
    bigIdea_title: lang === 'en' 
      ? "This is not just a media platform. It is a human-AI co-creation journey." 
      : "Bu sadece bir medya platformu değil. İnsan ve yapay zekânın ortak üretim yolculuğu.",
    bigIdea_p1: lang === 'en'
      ? "WeTalks Insights combines Orhan Balcı's vision of entrepreneurship, e-commerce, and real experience with Gemini AI's design, coding, analysis, and insight production capacity."
      : "WeTalks Insights, Orhan Balcı’nın girişimcilik, e-ticaret ve gerçek deneyim vizyonu ile Gemini AI’ın tasarım, kodlama, analiz ve içgörü üretim kapasitesini bir araya getirir.",
    bigIdea_p2: lang === 'en'
      ? "The platform is shaped by human vision and artificial intelligence cooperation at every stage, from coding to design, publishing to writing, news analysis to business insights."
      : "Platform; kodlamadan tasarıma, yayından yazarlığa, haber analizinden iş içgörüleri oluşturmaya kadar her aşamada insan vizyonu ve yapay zekâ iş birliğiyle şekillenir.",
    bigIdea_quote: "WeTalks Insights is not only powered by Gemini AI; it is being built with Gemini AI.",
    arch_title: lang === 'en' ? "CONCEPTS & DIALOGUE" : "CONCEPTS & DIALOGUE",
    arch_founder: "Orhan Balcı (Founder & Domain Specialist)",
    arch_founder_desc: lang === 'en'
      ? "Provides vision on practical e-commerce processes, financial realities, logistics problems, real crises, and market dynamics."
      : "Pratik e-ticaret süreçleri, finansal realiteler, lojistik problemler, yaşanmış krizler ve pazar dinamikleri vizyonu sağlar.",
    arch_system: "SYSTEM CO-DEVELOPER",
    arch_system_engine: "Gemini AI (Platform Engine)",
    arch_system_desc: lang === 'en'
      ? "Calculates the hierarchy of UI designs, produces clean frontend code structures, and synthesizes instant business decisions from data."
      : "Kullanıcı arayüz tasarımlarının hiyerarşisini hesaplar, temiz frontend kod yapısını üretir ve verilerden anlık iş kararları sentezler.",
    problem_badge: lang === 'en' ? "MARKET INEFFICIENCY" : "MARKET INEFFICIENCY / PROBLEM",
    problem_title: lang === 'en' 
      ? "Entrepreneurs access information but fail to see what action to take." 
      : "Girişimciler bilgiye ulaşıyor ama ne yapmaları gerektiğini göremiyor.",
    problem_desc: lang === 'en'
      ? "In the modern business world, the real constraint is not accessing info, but passing it through filters that make it strategic and actionable."
      : "Modern iş dünyasında asıl kısıt bilgiye erişmek değil; doğru bilgiyi, stratejik ve aksiyona dönüştürülebilir hale getirecek süzgeçlerden geçirmektir.",
    problem1_title: lang === 'en' ? "Lots of news, few insights" : "Haber çok, içgörü az",
    problem1_desc: lang === 'en'
      ? "Industry news usually answers 'what happened?', but leaves the question 'how exactly does this development affect my business?' in the dark."
      : "Sektör haberleri genellikle “ne oldu?” sorusunu yanıtlar; fakat “bu gelişme tam olarak benim işimi nasıl etkiler?” sorusunu karanlıkta bırakır.",
    problem2_title: lang === 'en' ? "Scattered experiences" : "Deneyimler dağınık",
    problem2_desc: lang === 'en'
      ? "The actual stories and real-life experiences of entrepreneurs on the ground often remain in personal conversations without being analyzed or shared."
      : "Girişimcilerin sahada bizzat yaşayarak tecrübe ettiği gerçek hikâyeler çoğu zaman kişisel sohbetlerde kalır, analiz edilmez ve başkaları için öğrenilebilir olmaz.",
    problem3_title: lang === 'en' ? "Missing decision support" : "Karar desteği eksik",
    problem3_desc: lang === 'en'
      ? "Especially e-commerce sellers, SMEs, and early-stage entrepreneurs look for a practical, reliable assistant to react immediately to fast-moving markets."
      : "Özellikle e-ticaret satıcıları, KOBİ'ler ve erken aşama girişimciler hızlı gelişen piyasalarda anlık reaksiyon verecek pratik ve güvenilir bir asistan arıyor.",
    solution_badge: lang === 'en' ? "THE SOLUTION" : "THE SOLUTION / ÇÖZÜM",
    solution_title: lang === 'en'
      ? "WeTalks Insights converts stories and news into actionable insights."
      : "WeTalks Insights, hikâyeleri ve haberleri uygulanabilir içgörülere dönüştürür.",
    solution_desc: lang === 'en'
      ? "The platform processes real entrepreneurial experiences, current sector news, and market developments through Gemini AI-powered analysis to produce risk, opportunity, impact, and action suggestions."
      : "Platform; gerçek girişimci deneyimlerini, güncel sektör haberlerini ve piyasa gelişmelerini Gemini AI destekli analiz süreçlerinden geçirerek risk, fırsat, etki ve aksiyon önerileri üretir.",
    solution_desc2: lang === 'en'
      ? "Every content focuses not just on what is happening, but creates an action library on what business owners should actually do."
      : "Her içerik sadece ne olduğu ile ilgilenmez, iş sahiplerinin ne yapması gerektiği üzerine odaklanmış bir eylem kütüphanesi yaratır.",
    flow1_title: lang === 'en' ? "Raw Data Entry" : "Ham Veri Girişi",
    flow1_desc: lang === 'en' ? "Real-life stories and current industry news" : "Gerçek Yaşanmış Hikâyeler ve Güncel Sektör Haberleri",
    flow2_title: lang === 'en' ? "AI Analysis Filter" : "Yapay Zekâ Analiz Süzgeci",
    flow2_desc: lang === 'en' ? "Gemini AI advanced risk & opportunity extraction" : "Gemini AI Gelişmiş Risk & Fırsat Çıkartma Süzgeci",
    flow3_title: lang === 'en' ? "Editorial Evaluation" : "Editoryal Değerlendirme",
    flow3_desc: lang === 'en' ? "Human filter and founder audit" : "İnsan Süzgeci ve Kurucu Denetimi",
    flow4_title: lang === 'en' ? "Actionable Business Insights" : "Uygulanabilir İş İçgörüleri",
    flow4_desc: lang === 'en' ? "Net action plans ready for execution" : "Harekete geçmeye hazır net aksiyon planları",
    gemini_badge: lang === 'en' ? "GEMINI INTEGRATION AREAS" : "GEMINI INTEGRATION AREAS / ENTEGRASYON ALANLARI",
    gemini_title: lang === 'en'
      ? "Gemini AI is not just an analysis engine, it's a partner in the co-creation journey."
      : "Gemini AI platformun yalnızca analiz motoru değil, üretim yolculuğunun da parçası.",
    gemini_desc: lang === 'en'
      ? "Gemini AI plays an end-to-end role in both background development processes (coding, design ideas) and frontend editorial processes of WeTalks Insights."
      : "Gemini AI, WeTalks Insights'ın hem arka plan geliştirme süreçlerinde (kodlama, tasarım fikirleri) hem de ön plandaki editoryal ve analiz süreçlerinde uçtan uca rol oynar.",
    g_area1_title: lang === 'en' ? "1. Design" : "1. Tasarım",
    g_area1_desc: lang === 'en'
      ? "Interface concepts, page layouts, user flows, and visual hierarchies are drafted through Gemini's visual logic filters."
      : "Arayüz fikirleri, sayfa yapıları, kullanıcı akışları ve görsel hiyerarşi kurguları Gemini AI'ın görsel mantık süzgeçleriyle tasarlanmıştır.",
    g_area2_title: lang === 'en' ? "2. Coding" : "2. Kodlama",
    g_area2_desc: lang === 'en'
      ? "The platform's modern frontend structure, components, flows, and state binding logic were developed in collaboration with Gemini AI."
      : "Platformun modern frontend yapısı, bileşenleri, akışları ve veri bağlama mantığı Gemini iş birliğiyle kodlanarak hayata geçirilmiştir.",
    g_area3_title: lang === 'en' ? "3. Publishing Flow" : "3. Yayın Akışı",
    g_area3_desc: lang === 'en'
      ? "Editorial tasks, automated summarization, and quick draft generation for news and experiences are optimized using Gemini."
      : "Haber ve deneyim içerikleri için editoryal süreçler, otomatik özet çıkartma ve hızlı taslak oluşturma formatları Gemini ile optimize edilir.",
    g_area4_title: lang === 'en' ? "4. Co-Authoring" : "4. Yazarlık Desteği",
    g_area4_desc: lang === 'en'
      ? "Raw voice notes and messy thoughts shared by entrepreneurs are polished into elegant editorial pieces while preserving human tone."
      : "Girişimcilerin ham aktardığı ses kayıtları ve dağınık notlar, orijinal insan samimiyeti ve üslubu korunarak şık editoryal makalelere dönüştürülür.",
    g_area5_title: lang === 'en' ? "5. News Analysis" : "5. Haber Analizi",
    g_area5_desc: lang === 'en'
      ? "Fast-paced market news is instantly tagged for impact, risk, and opportunity via Gemini's specialized business logic models."
      : "Hızlı pazar haberleri, Gemini AI'ın finansal ve lojistik analiz modelleri ile etki, risk ve fırsat açılarından anında etiketlenir.",
    g_area6_title: lang === 'en' ? "6. Insight Synthesis" : "6. İçgörü Üretimi",
    g_area6_desc: lang === 'en'
      ? "Nourished by our deep historical library, the model delivers profitability and growth tips that readers can copy and use."
      : "Derinlemesine kütüphaneden beslenen model, her yayından okuyucunun doğrudan taklit edebileceği kârlılık ve büyüme tüyoları çıkarır.",
    format_badge: lang === 'en' ? "INSIGHT FORMAT" : "INSIGHT FORMAT / ANALİZ ŞABLONU",
    format_title: lang === 'en'
      ? "Every news piece doesn't just pass by; it elevates into a WeTalks Insight."
      : "Her haber sadece haber olarak kalmaz; WeTalks Insight’a dönüşür.",
    format_desc: lang === 'en'
      ? "While traditional media only reports events, WeTalks Insights evaluates each story with 7 structured fundamental business questions."
      : "Geleneksel medya sadece gelişmeyi duyururken, WeTalks Insights her bir haberi ve makaleyi yapılandırılmış 7 temel iş sorusuyla inceleyerek sunar.",
    sim_title: lang === 'en' ? "WeTalks Insight Simulator" : "WeTalks Insight Simülatörü",
    sim_tabSample: lang === 'en' ? "Sample Insight" : "Örnek Kutu",
    sim_tabLive: lang === 'en' ? "Live Gemini Synthesizer" : "Gemini Sentezleyicisi (Canlı)",
    sim_sampleQuote: lang === 'en'
      ? "\"This development shows that pricing discipline is no longer optional but mandatory for small sellers. Sales made without factoring in commission, shipping, and VAT are not growth, but a risk of scaling losses.\""
      : "\"Bu gelişme, küçük satıcılar için fiyatlandırma disiplininin artık opsiyonel değil zorunlu olduğunu gösteriyor. Komisyon, kargo ve KDV hesaba katılmadan yapılan satışlar büyüme değil, zarar ölçekleme riskidir.\"",
    sim_sampleDesc: lang === 'en'
      ? "An action insight jointly generated by Gemini AI and Orhan Balcı for profitability-challenged sellers following marketplace shipping update announcements."
      : "E-ticaret pazarındaki son kargo barem güncellemelerinin ardından, kârlılık sınırında çalışan satıcılar için Gemini AI ve Orhan Balcı'nın ortaklaşa çıkarttığı eylem içgörüsüdür.",
    sim_inputLabel: lang === 'en'
      ? "Enter a raw scenario or news from e-commerce/business below. We will instantly extract structure with Gemini AI logic:"
      : "Aşağıya e-ticaret veya girişimcilikle ilgili yaşadığınız ham bir senaryoyu/haberi yazın. Gemini AI mantığıyla anında analiz çıkartalım:",
    sim_inputPlaceholder: lang === 'en'
      ? "e.g., Trendyol increased commission rates by 2% and updated shipping slabs. What should a small-budget seller do?"
      : "Örn: Trendyol komisyon oranlarını %2 artırdı ve kargo baremlerini güncelledi. Küçük bütçeli satıcı ne yapmalı?",
    sim_btnAnalyze: lang === 'en' ? "Synthesize Insight" : "İçgörüyü Sentezle",
    sim_analyzing: lang === 'en' ? "Gemini Synthesizing..." : "Gemini Analiz Ediyor...",
    sim_result_risk: lang === 'en' ? "RISK ANALYSIS" : "RİSK ANALİZİ",
    sim_result_opp: lang === 'en' ? "OPPORTUNITY ANALYSIS" : "FIRSAT ANALİZİ",
    sim_result_action: lang === 'en' ? "ACTION PLAN (RECOMMENDATIONS)" : "AKSİYON PLANI (ÖNERİLER)",
    aud_badge: lang === 'en' ? "TARGET AUDIENCE" : "TARGET AUDIENCE / HEDEF KİTLE",
    aud_title: lang === 'en'
      ? "Who is WeTalks Insights for?"
      : "WeTalks Insights kimler için?",
    aud_desc: lang === 'en'
      ? "Designed for business professionals who don't just want to watch developments but aim to extract competitive advantages from them."
      : "Gelişmeleri yalnızca seyretmek istemeyen, onlardan rekabetçi avantajlar çıkartmayı amaçlayan iş profesyonelleri için tasarlandı.",
    aud_card1_title: lang === 'en' ? "E-Commerce Sellers" : "E-Ticaret Satıcıları",
    aud_card1_desc: lang === 'en'
      ? "Sellers who want to analyze marketplace commission changes, shifting logistics costs, and global e-commerce trends with instantly actionable insights."
      : "Pazaryeri komisyon değişikliklerini, değişen lojistik maliyetlerini ve global e-ticaret trendlerini anında eyleme dökülebilir içgörülerle analiz etmek isteyen satıcılar.",
    aud_card2_title: lang === 'en' ? "Entrepreneurs" : "Girişimciler",
    aud_card2_desc: lang === 'en'
      ? "Those who want to avoid repeating the same mistakes in their decisions by synthesizing the actual crisis and growth stories of other successful or failed founders."
      : "Diğer başarılı veya başarısız kurucuların bizzat yaşadığı kriz ve büyüme hikayelerini sentezleyerek kendi kararlarında aynı hataları tekrarlamamak isteyenler.",
    aud_card3_title: lang === 'en' ? "SMEs" : "KOBİ'ler",
    aud_card3_desc: lang === 'en'
      ? "Traditional enterprises that want to grow their business by tracking market rules, new legal regulations, and financial instruments in the simplest, ad-free, and clearest way."
      : "Piyasa kurallarını, yeni yasal düzenlemeleri ve finansal enstrümanları en sade, reklamsız ve net biçimde takip ederek işlerini büyütmek isteyen geleneksel işletmeler.",
    aud_card4_title: lang === 'en' ? "Brands & Agencies" : "Markalar ve Ajanslar",
    aud_card4_desc: lang === 'en'
      ? "Professionals who want to offer their clients deeper strategic reporting and market direction based on data and artificial intelligence analysis."
      : "Müşterilerine pazar hakkında daha derinlemesine, veri ve yapay zeka analizlerine dayalı stratejik raporlama ve pazar yönü sunmak isteyen profesyoneller.",
    mod_badge: lang === 'en' ? "PLATFORM MODULES" : "PLATFORM MODULES / MODÜLLER",
    mod_title: lang === 'en' ? "Experience, news, analysis, and community all under one roof." : "Deneyim, haber, analiz ve topluluk aynı çatı altında.",
    mod_desc: lang === 'en'
      ? "All the intellectual layers needed by the entrepreneurship and e-commerce ecosystem are presented with a single, integrated portal philosophy."
      : "Girişimcilik ve iş ekosisteminin ihtiyaç duyduğu tüm entelektüel katmanlar tek ve bütünleşik bir portal felsefesiyle sunulur.",
    mod_c1_title: lang === 'en' ? "Experience" : "Deneyim",
    mod_c1_desc: lang === 'en' ? "Real entrepreneur stories, crisis moments, e-commerce operation designs, and real field notes." : "Gerçek girişimci hikayeleri, kriz anları, e-ticaret operasyon kurguları ve yaşanmış saha notları.",
    mod_c2_title: lang === 'en' ? "News" : "Gündem Analizi",
    mod_c2_desc: lang === 'en' ? "News stream that keeps a pulse on the industry and regulations, instantly enriched with Gemini AI impact analyses." : "Sektörün ve regülasyonların nabzını tutan, anında Gemini AI etki analizleriyle zenginleştirilen haber akışı.",
    mod_c3_title: lang === 'en' ? "Voices" : "Uzman Görüşleri",
    mod_c3_desc: lang === 'en' ? "Rational analyses from leading industry professionals, writers, and academicians." : "Sektörün önde gelen profesyonellerinin, yazarların ve akademisyenlerin rasyonel analizleri.",
    mod_c4_title: lang === 'en' ? "Cases" : "Vaka Analizleri",
    mod_c4_desc: lang === 'en' ? "Technical autopsies of historic major company moves, growth tactics, and crisis management." : "Tarihe geçmiş büyük şirket hamlelerinin, büyüme taktiklerinin ve kriz yönetimlerinin teknik otopsileri.",
    mod_c5_title: lang === 'en' ? "Reports" : "Derin Dosyalar",
    mod_c5_desc: lang === 'en' ? "Special premium reports focusing on specific vertical markets, e-commerce logistics processes, and AI transformation." : "Belirli dikey pazarlara, e-ticaret lojistik süreçlerine ve AI dönüşümüne odaklanan özel premium raporlar.",
    mod_c6_title: lang === 'en' ? "Community" : "Topluluk",
    mod_c6_desc: lang === 'en' ? "Space where entrepreneurs, sellers, and idea owners share experiences and profitability tips with each other." : "Girişimcilerin, satıcıların ve fikir sahiplerinin birbirleriyle tecrübe ve kârlılık tüyoları paylaştığı alan.",
    why_badge: lang === 'en' ? "WHY GEMINI" : "WHY GEMINI / NEDEN GEMINI?",
    why_title: lang === 'en'
      ? "Gemini is not just a tool for WeTalks Insights; it is a layer inherent to the product."
      : "Gemini, WeTalks Insights için bir araç değil; ürünün doğasında olan bir katmandır.",
    why_desc: lang === 'en'
      ? "WeTalks Insights does not use Gemini AI solely to generate automated content. Gemini establishes a rational bridge between raw entrepreneurial stories, complex industry news, and editorial human commentary."
      : "WeTalks Insights, Gemini AI’ı yalnızca otomatik içerik üretmek için kullanmaz. Gemini; ham girişimci hikâyeleri, karmaşık sektör haberleri ve editoryal insan yorumları arasında rasyonel bir köprü kurar.",
    why_quote: "We use Gemini AI to create an insight layer between real-world business stories, market news, and practical decision-making.",
    why_sub: "— Gemini AI’ı, yaşanmış iş hikâyeleri, güncel haberler ve pratik karar alma arasında bir içgörü katmanı oluşturmak için kullanıyoruz.",
    why_grid1_t: lang === 'en' ? "PRECISION" : "HASSASİYET",
    why_grid1_d: lang === 'en' ? "High-accuracy synthesis capacity in financial terms, local regulations, and market logistics." : "Finansal terimler, yerel mevzuatlar ve pazar lojistiği konularında yüksek doğluk oranına sahip sentezleme kapasitesi.",
    why_grid2_t: lang === 'en' ? "CONTEXT RETENTION" : "BAĞLAM KORUMA",
    why_grid2_d: lang === 'en' ? "Power to extract key ideas from long voice recordings and unorganized interview texts without losing human sincerity." : "Uzun ses kayıtlarından ve düzensiz mülakat metinlerinden ana fikri ve insan samimiyetini kaybetmeden çıktı alma gücü.",
    why_grid3_t: lang === 'en' ? "SPEED & SCALE" : "HIZ & ÖLÇEKLEME",
    why_grid3_d: lang === 'en' ? "Speed to scan hundreds of daily market developments in seconds and classify them by impact, risk, and opportunity." : "Günlük yüzlerce pazar gelişmesini saniyeler içinde tarayarak etki, risk ve fırsat derecelerine göre tasnif edebilme hızı.",
    why_grid4_t: lang === 'en' ? "SMART CO-AUTHORING" : "GELİŞMİŞ KOD İŞ BİRLİĞİ",
    why_grid4_d: lang === 'en' ? "Smart assistantship that constantly optimizes platform code and enhances performance as a system co-developer." : "Sistem geliştiricisi olarak platform kodunu sürekli optimize eden, performans artıran akıllı asistanlık.",
    collab_badge: lang === 'en' ? "ECOSYSTEM COLLABORATION" : "ECOSYSTEM COLLABORATION / DESTEK TALEBİ",
    collab_title: lang === 'en'
      ? "Our Support Request from Google for Startups / Gemini Ecosystem"
      : "Google for Startups / Gemini Ekosisteminden Destek Talebimiz",
    collab_desc: lang === 'en'
      ? "To transform the WeTalks Insights project into a globally standardized, fully scalable, and AI-driven regional success story, we are seeking collaborations in the following areas:"
      : "WeTalks Insights projesini global standartlarda, tam ölçeklenebilir ve yapay zekâ odaklı bir bölgesel başarı hikâyesine dönüştürmek için aşağıdaki başlıklarda iş birlikleri arıyoruz:",
    collab_slogan: lang === 'en'
      ? "Our goal is to create a powerful AI media and insight platform developed with human + AI collaboration, originating from Turkey."
      : "Amacımız, Türkiye’den çıkan insan + yapay zekâ iş birliğiyle geliştirilmiş güçlü bir AI medya ve içgörü platformu oluşturmaktır.",
    collab_list: lang === 'en' ? [
      "Gemini API / Vertex AI usage credits and priority access",
      "Google Cloud infrastructure credits and server architecture support",
      "Engineering guidance for technical architecture and advanced AI models",
      "Best practice guidance on using Gemini models in the business analysis vertical",
      "Access to Google for Startups and the Google AI ecosystem network",
      "Opportunity to produce a success story (case study) within a regional collaboration framework"
    ] : [
      "Gemini API / Vertex AI kullanım kredisi ve öncelikli erişim",
      "Google Cloud altyapı kredileri ve sunucu mimari desteği",
      "Teknik mimari ve ileri yapay zekâ modelleri için mühendislik yönlendirmesi",
      "Gemini modellerinin iş analizi dikeyinde kullanımında best practice rehberliği",
      "Google for Startups ve Google AI ekosistem ağına erişim imkânı",
      "Bölgesel iş birliği çerçevesinde başarı hikâyesi (case study) üretme fırsatı"
    ],
    join_badge: lang === 'en' ? "JOIN THE JOURNEY" : "JOIN THE JOURNEY / SİZE ÖZEL DAVET",
    join_title: lang === 'en' ? "From real experiences, to Gemini AI-powered business insights." : "Gerçek deneyimlerden, Gemini AI destekli iş içgörülerine.",
    join_desc: lang === 'en'
      ? "WeTalks Insights brings together human experience, entrepreneurial stories, industry news, and Gemini AI analyses to offer a brand-new vision for the business world."
      : "WeTalks Insights; insan deneyimini, girişimcilik hikâyelerini, sektör haberlerini ve Gemini AI analizlerini bir araya getirerek iş dünyası için yepyeni bir vizyon sunar.",
    btnDownloadPitch: lang === 'en' ? "View & Review Pitch Deck" : "Pitch Deck'i Gör & İncele",
    btnContactOrhan: lang === 'en' ? "Contact Orhan Balcı" : "Orhan Balcı ile İletişime Geç",
    contact_titleBadge: lang === 'en' ? "FOUNDER CONTACT FORM" : "KURUCU İLETİŞİM FORMU",
    contact_header: lang === 'en' ? "Connect with Orhan Balcı" : "Orhan Balcı ile Bağlanın",
    contact_desc: lang === 'en' ? "Initiate cooperation, investment, or technical partnership discussions for the WeTalks Insights project." : "WeTalks Insights projesi için iş birliği, yatırım veya teknik partnerlik görüşmeleri başlatın.",
    contact_lbl_name: lang === 'en' ? "FULL NAME" : "ADINIZ SOYADINIZ",
    contact_lbl_email: lang === 'en' ? "EMAIL ADDRESS" : "E-POSTA ADRESİNİZ",
    contact_lbl_msg: lang === 'en' ? "YOUR MESSAGE / COOPERATION PROPOSAL" : "MESAJINIZ / İŞ BİRLİĞİ TEKLİFİNİZ",
    contact_pl_name: lang === 'en' ? "e.g. John Doe" : "Örn: Ahmet Yılmaz",
    contact_pl_email: lang === 'en' ? "e.g. johndoe@example.com" : "Örn: ahmet.yilmaz@gmail.com",
    contact_pl_msg: lang === 'en' ? "Write your message, cooperation proposal, or feedback here..." : "İş birliği talebinizi, sorularınızı veya mesajınızı buraya yazabilirsiniz...",
    contact_btn_submit: lang === 'en' ? "Submit Connection Request" : "Bağlantı Talebini İlet",
    contact_sent_header: lang === 'en' ? "Your Message Has Been Sent!" : "Mesajınız Gönderildi!",
    contact_sent_desc: lang === 'en' ? "Orhan Balcı will contact you via your email address as soon as possible." : "Orhan Balcı en kısa sürede e-posta adresiniz üzerinden sizinle iletişime geçecektir.",
    footer_text: lang === 'en' ? "© 2026 WeTalks Insights. All rights reserved. Built with Gemini." : "© 2026 WeTalks Insights. Her hakkı saklıdır. Built with Gemini.",
    back: lang === 'en' ? "Back" : "Geri",
    next: lang === 'en' ? "Next" : "İleri",
    slide_title: lang === 'en' ? "WETALKS PITCH DECK" : "WETALKS PITCH DECK",
    slide_counter: lang === 'en' ? "Slide" : "Slayt",
    format_q1: lang === 'en' ? "1. Who and how will this development affect?" : "1. Bu gelişme kimleri, nasıl etkileyecek?",
    format_q2: lang === 'en' ? "2. What is the most urgent action to take?" : "2. En acil alınması gereken aksiyon nedir?",
    format_q3: lang === 'en' ? "3. What hidden risks does it contain?" : "3. Hangi gizli riskleri barındırıyor?",
    format_q4: lang === 'en' ? "4. How can a new opportunity be created from this?" : "4. Bu durumdan nasıl yeni bir fırsat yaratılabilir?",
    format_q5: lang === 'en' ? "5. What is the financial/logistical impact degree?" : "5. Finansal/lojistik etki derecesi nedir?",
    format_q6: lang === 'en' ? "6. What should a small-budget seller do?" : "6. Küçük bütçeli satıcı ne yapmalıdır?",
    format_q7: lang === 'en' ? "7. What awaits us in 1 month?" : "7. 1 ay sonra bizi ne bekliyor?"
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    
    const msgData = {
      name: contactForm.name.trim(),
      email: contactForm.email.trim(),
      message: contactForm.message.trim()
    };

    try {
      await createContactMessage(msgData);
      console.log('[Contact Form] Self-hosted backend notification triggered successfully.');
    } catch (error) {
      console.error('[Contact Form] Message delivery failed:', error);
    }

    setTimeout(() => {
      setContactForm({ name: '', email: '', message: '' });
      setContactSubmitted(false);
      setShowContactModal(false);
    }, 2500);
  };

  const handleInteractiveAnalyze = async () => {
    if (!customStory.trim()) return;
    setAnalyzingStory(true);
    setAiAnalysisResult(null);

    try {
      const response = await fetch('/api/ai/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: customStory, lang })
      });
      const data = await response.json();
      
      if (data.success && data.analysis) {
        // Parse markdown sections or fallback cleanly
        const text = data.analysis;
        setAiAnalysisResult({
          impact: lang === 'en' ? "Strategic Assessment" : "Stratejik Değerlendirme",
          rawMarkdown: text,
          risk: text.length > 300 ? text.substring(0, 280) + '...' : text,
          opportunity: lang === 'en' ? "Full actionable breakdown generated below:" : "Detaylı eylem ve içgörü raporu aşağıda oluşturuldu:",
          action: [text]
        });
      } else {
        throw new Error(data.error || "Analiz oluşturulamadı.");
      }
    } catch (err) {
      console.warn('[Gemini AI fallback]', err);
      // Fallback to grounded default analysis if offline
      if (lang === 'en') {
        setAiAnalysisResult({
          impact: "Highly Critical",
          risk: "Ignoring commissions, logistics, and return costs in cash-flow planning will cause losses to scale exponentially (loss scaling) as sales volume grows.",
          opportunity: "Instead of fast-turnover but low-margin products, turning to niche categories with low logistics cost and gross profit margin above 40% will increase operational efficiency.",
          action: [
            "Automatically update all marketplace sales prices every week according to dynamic cargo and updated commission rates.",
            "Stop sales or run price optimization on any product where the gross profit margin falls below 25%.",
            "By analyzing return rates on a product basis, suspend working with suppliers whose return rate exceeds 8%."
          ]
        });
      } else {
        setAiAnalysisResult({
          impact: "Yüksek Derecede Kritik",
          risk: "Nakit akışı planlamasında komisyon, lojistik ve iade maliyetlerinin göz ardı edilmesi, satış hacmi büyüdükçe zararın katlanarak büyümesine (zarar ölçekleme) sebep olur.",
          opportunity: "Hızlı ciro getiren ancak düşük marjlı ürünler yerine, lojistik maliyeti düşük ve brüt kâr marjı %40 üzerinde olan niş kategorilere yönelmek operasyonel verimliliği artıracaktır.",
          action: [
            "Tüm pazaryeri satış fiyatlarınızı dinamik kargo ve güncel komisyon oranlarına göre her hafta otomatik güncelleyin.",
            "Brüt kâr marjınızın %25'in altına düştüğü her üründe satışı durdurun veya fiyat optimizasyonuna gidin.",
            "İade oranlarınızı ürün bazlı analiz ederek, iade oranı %8'i geçen tedarikçilerle çalışmayı askıya alın."
          ]
        });
      }
    } finally {
      setAnalyzingStory(false);
    }
  };

  return (
    <div className="bg-[#03040B] text-zinc-100 min-h-screen font-sans overflow-x-hidden relative selection:bg-orange-600/30 selection:text-orange-300">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#0D62FE]/10 blur-[120px] animate-pulse duration-[8s]" />
        <div className="absolute top-[10%] right-[15%] w-[450px] h-[450px] rounded-full bg-orange-600/5 blur-[100px] animate-pulse duration-[12s]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 z-10 max-w-7xl mx-auto text-center">
        
        {/* Badge Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-950/40 border border-orange-900/40 text-orange-400 text-xs font-mono font-bold tracking-wider uppercase mb-8 shadow-[0_4px_20px_rgba(234,88,12,0.15)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-spin-slow" />
          <span>{t.badge}</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-serif font-black text-white leading-[1.1] tracking-tight max-w-5xl mx-auto"
        >
          {t.heroTitle_1} <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-[#0D62FE] bg-clip-text text-transparent">{t.heroTitle_2}</span> {t.heroTitle_3}
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-zinc-400 font-sans font-medium mt-6 max-w-3xl mx-auto leading-relaxed"
        >
          {t.heroSubtitle}
        </motion.p>

        {/* Short English Slogan */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm font-mono tracking-widest text-[#0D62FE] dark:text-[#5591FF] mt-4 font-bold"
        >
          BUILT WITH GEMINI. GUIDED BY HUMAN EXPERIENCE.
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={() => setShowDeckModal(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0D62FE] hover:bg-[#0b54da] text-white font-sans font-black text-base transition-all duration-300 shadow-[0_10px_35px_rgba(13,98,254,0.35)] hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Maximize2 className="w-4.5 h-4.5" />
            <span>{t.btnPitchDeck}</span>
          </button>
          
          {showExploreProjectButton && (
            <button 
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-850 text-white font-sans font-bold text-base transition-all duration-300 border border-zinc-800 hover:border-zinc-700 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.btnExplore}</span>
              <ArrowRight className="w-4 h-4 text-[#0D62FE]" />
            </button>
          )}
        </motion.div>

        {/* Hero Visual Blueprint Abstract Flow */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 border border-slate-800/80 bg-slate-950/30 backdrop-blur-md rounded-3xl p-6 sm:p-10 max-w-4xl mx-auto shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 items-center">
            
            <div className="flex flex-col items-center p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-center">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-3 border border-orange-500/20 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs font-mono text-orange-400 font-bold tracking-wider uppercase">{lang === 'en' ? "STEP 01" : "ADIM 01"}</p>
              <h4 className="text-sm font-sans font-black text-white mt-1">{t.step1_title}</h4>
              <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">{t.step1_desc}</p>
            </div>

            <div className="flex flex-col items-center p-5 rounded-2xl bg-[#0D62FE]/5 border border-[#0D62FE]/15 text-center relative">
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 hidden md:block">
                <ChevronRight className="w-5 h-5 text-zinc-650" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#0D62FE]/10 text-[#0D62FE] flex items-center justify-center mb-3 border border-[#0D62FE]/20 shadow-sm">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <p className="text-xs font-mono text-[#0D62FE] font-bold tracking-wider uppercase">{lang === 'en' ? "STEP 02" : "ADIM 02"}</p>
              <h4 className="text-sm font-sans font-black text-white mt-1">{t.step2_title}</h4>
              <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">{t.step2_desc}</p>
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:block">
                <ChevronRight className="w-5 h-5 text-zinc-650" />
              </div>
            </div>

            <div className="flex flex-col items-center p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-center relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/20 shadow-sm">
                <Lightbulb className="w-5 h-5" />
              </div>
              <p className="text-xs font-mono text-emerald-400 font-bold tracking-wider uppercase">{lang === 'en' ? "STEP 03" : "ADIM 03"}</p>
              <h4 className="text-sm font-sans font-black text-white mt-1">{t.step3_title}</h4>
              <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">{t.step3_desc}</p>
            </div>

          </div>
        </motion.div>
      </section>

      {/* Büyük Fikir Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-zinc-900">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6">
            <span className="text-xs font-mono text-[#0D62FE] uppercase tracking-wider font-bold">{t.bigIdea_badge}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mt-3 leading-tight">
              {t.bigIdea_title}
            </h2>
            <div className="h-1 w-20 bg-orange-500 mt-6 rounded-full" />
            <p className="text-zinc-400 font-sans text-base leading-relaxed mt-6">
              {t.bigIdea_p1}
            </p>
            <p className="text-zinc-400 font-sans text-base leading-relaxed mt-4">
              {t.bigIdea_p2}
            </p>

            <div className="mt-8 p-5 rounded-2xl bg-slate-950 border border-slate-800/60 font-mono text-xs text-orange-400 leading-relaxed border-l-4 border-l-orange-500">
              "{t.bigIdea_quote}"
            </div>
          </div>

          <div className="lg:col-span-6">
            {/* Visual pitch mockup representation */}
            <div className="relative border border-slate-800/80 bg-[#070810] rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="absolute top-3 right-4 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              
              <div className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#0D62FE]" />
                <span className="normal-case">WETALKS_INSIGHTS_ARCHITECTURE.SH</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/60">
                  <p className="text-[10px] font-mono text-zinc-500">{t.arch_title}</p>
                  <p className="text-xs font-sans text-white font-bold mt-1">{t.arch_founder}</p>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{t.arch_founder_desc}</p>
                </div>

                <div className="flex justify-center my-1">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-[#0D62FE] to-orange-500" />
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/60">
                  <p className="text-[10px] font-mono text-zinc-500">{t.arch_system}</p>
                  <p className="text-xs font-sans text-white font-bold mt-1">{t.arch_system_engine}</p>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{t.arch_system_desc}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-zinc-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-orange-500 uppercase tracking-wider font-bold">{t.problem_badge}</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mt-3">
            {t.problem_title}
          </h2>
          <p className="text-zinc-400 font-sans mt-4 text-sm sm:text-base leading-relaxed">
            {t.problem_desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800/60 relative group hover:border-[#0D62FE]/40 transition-all duration-300">
            <div className="w-11 h-11 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mb-5 border border-red-500/20">
              <ShieldAlert className="w-5.5 h-5.5" />
            </div>
            <h3 className="text-lg font-sans font-black text-white">{t.problem1_title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mt-3">
              {t.problem1_desc}
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800/60 relative group hover:border-[#0D62FE]/40 transition-all duration-300">
            <div className="w-11 h-11 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20">
              <Users className="w-5.5 h-5.5" />
            </div>
            <h3 className="text-lg font-sans font-black text-white">{t.problem2_title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mt-3">
              {t.problem2_desc}
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800/60 relative group hover:border-[#0D62FE]/40 transition-all duration-300">
            <div className="w-11 h-11 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mb-5 border border-rose-500/20">
              <Briefcase className="w-5.5 h-5.5" />
            </div>
            <h3 className="text-lg font-sans font-black text-white">{t.problem3_title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mt-3">
              {t.problem3_desc}
            </p>
          </div>

        </div>
      </section>

      {/* Çözüm Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-zinc-900">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 order-2 lg:order-1">
            {/* Elegant Flow UI */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800/60 space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0 font-mono text-xs font-bold">1</div>
                <div>
                  <h4 className="text-sm font-sans font-bold text-white">{t.flow1_title}</h4>
                  <p className="text-xs text-zinc-400 mt-1">{t.flow1_desc}</p>
                </div>
              </div>

              <div className="pl-4">
                <div className="w-0.5 h-8 bg-slate-800 ml-4" />
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0D62FE]/10 text-[#0D62FE] border border-[#0D62FE]/20 flex items-center justify-center shrink-0 font-mono text-xs font-bold">2</div>
                <div>
                  <h4 className="text-sm font-sans font-bold text-white">{t.flow2_title}</h4>
                  <p className="text-xs text-zinc-400 mt-1">{t.flow2_desc}</p>
                </div>
              </div>

              <div className="pl-4">
                <div className="w-0.5 h-8 bg-slate-800 ml-4" />
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 font-mono text-xs font-bold">3</div>
                <div>
                  <h4 className="text-sm font-sans font-bold text-white">{t.flow3_title}</h4>
                  <p className="text-xs text-zinc-400 mt-1">{t.flow3_desc}</p>
                </div>
              </div>

              <div className="pl-4">
                <div className="w-0.5 h-8 bg-slate-800 ml-4" />
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 font-mono text-xs font-bold">4</div>
                <div>
                  <h4 className="text-sm font-sans font-bold text-white">{t.flow4_title}</h4>
                  <p className="text-xs text-emerald-400 mt-1">{t.flow4_desc}</p>
                </div>
              </div>

            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2">
            <span className="text-xs font-mono text-[#0D62FE] uppercase tracking-wider font-bold">{t.solution_badge}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mt-3 leading-tight">
              {t.solution_title}
            </h2>
            <div className="h-1 w-20 bg-orange-500 mt-6 rounded-full" />
            <p className="text-zinc-400 font-sans text-base leading-relaxed mt-6">
              {t.solution_desc}
            </p>
            <p className="text-zinc-400 font-sans text-base leading-relaxed mt-4">
              {t.solution_desc2}
            </p>
          </div>

        </div>
      </section>

      {/* Gemini AI Nerede Kullanılıyor? Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-zinc-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-orange-500 uppercase tracking-wider font-bold">{t.gemini_badge}</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mt-3">
            {t.gemini_title}
          </h2>
          <p className="text-zinc-400 font-sans mt-4 text-sm sm:text-base leading-relaxed">
            {t.gemini_desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/60 hover:border-orange-500/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center mb-4 border border-orange-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-sans font-black text-white">{t.g_area1_title}</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              {t.g_area1_desc}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/60 hover:border-orange-500/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-[#0D62FE]/10 text-[#0D62FE] flex items-center justify-center mb-4 border border-[#0D62FE]/20">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-sans font-black text-white">{t.g_area2_title}</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              {t.g_area2_desc}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/60 hover:border-orange-500/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-sans font-black text-white">{t.g_area3_title}</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              {t.g_area3_desc}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/60 hover:border-orange-500/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-sans font-black text-white">{t.g_area4_title}</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              {t.g_area4_desc}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/60 hover:border-orange-500/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-sans font-black text-white">{t.g_area5_title}</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              {t.g_area5_desc}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/60 hover:border-orange-500/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4 border border-pink-500/20">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-sans font-black text-white">{t.g_area6_title}</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              {t.g_area6_desc}
            </p>
          </div>

        </div>
      </section>

      {/* WeTalks Insight Formatı & Sandbox Interactive Area */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-zinc-900">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5">
            <span className="text-xs font-mono text-[#0D62FE] uppercase tracking-wider font-bold">{t.format_badge}</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mt-3">
              {t.format_title}
            </h2>
            <div className="h-1 w-20 bg-orange-500 mt-6 rounded-full" />
            <p className="text-zinc-400 font-sans text-sm sm:text-base leading-relaxed mt-6">
              {t.format_desc}
            </p>

            <ul className="mt-6 space-y-2.5">
              {[
                t.format_q1,
                t.format_q2,
                t.format_q3,
                t.format_q4,
                t.format_q5,
                t.format_q6,
                t.format_q7
              ].map((q, i) => (
                <li key={i} className="flex items-center gap-2.5 text-xs text-zinc-300 font-sans">
                  <CheckCircle className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            {/* Interactive Sandbox Simulator */}
            <div className="border border-slate-800 bg-slate-950/60 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-slate-900/60 border-b border-slate-800/60 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#0D62FE]" />
                  <span className="text-xs font-mono font-bold text-white">{t.sim_title}</span>
                </div>
                <div className="flex gap-1.5 animate-pulse-slow">
                  <button 
                    onClick={() => setSelectedInsightTab('sample')}
                    className={`text-[10px] font-mono px-3 py-1 rounded-full border transition-all cursor-pointer ${selectedInsightTab === 'sample' ? 'bg-[#0D62FE]/10 border-[#0D62FE]/30 text-white' : 'border-transparent text-zinc-500'}`}
                  >
                    {t.sim_tabSample}
                  </button>
                  <button 
                    onClick={() => setSelectedInsightTab('interactive')}
                    className={`text-[10px] font-mono px-3 py-1 rounded-full border transition-all cursor-pointer ${selectedInsightTab === 'interactive' ? 'bg-[#0D62FE]/10 border-[#0D62FE]/30 text-white' : 'border-transparent text-zinc-500'}`}
                  >
                    {t.sim_tabLive}
                  </button>
                </div>
              </div>

              <div className="p-6">
                {selectedInsightTab === 'sample' ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-950/40 text-orange-400 border border-orange-900/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                      ★ WETALKS INSIGHT
                    </div>
                    <blockquote className="text-slate-200 font-serif text-base italic leading-relaxed">
                      {t.sim_sampleQuote}
                    </blockquote>
                    <p className="text-[11px] font-sans text-zinc-400 leading-relaxed">
                      {t.sim_sampleDesc}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <p className="text-xs text-zinc-400 font-sans">{t.sim_inputLabel}</p>
                    <textarea 
                      value={customStory}
                      onChange={(e) => setCustomStory(e.target.value)}
                      placeholder={t.sim_inputPlaceholder}
                      className="w-full h-24 rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs text-white focus:outline-none focus:border-[#0D62FE] resize-none"
                    />
                    <div className="flex justify-end">
                      <button 
                        onClick={handleInteractiveAnalyze}
                        disabled={analyzingStory || !customStory.trim()}
                        className="px-4 py-2 rounded-xl bg-[#0D62FE] hover:bg-[#0b54da] disabled:opacity-40 text-white font-sans font-black text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        {analyzingStory ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{t.sim_analyzing}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{t.sim_btnAnalyze}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <AnimatePresence>
                      {aiAnalysisResult && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-3"
                        >
                          <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                            <span className="text-[10px] font-mono font-bold text-orange-400 uppercase">GEMINI REPORT:</span>
                            <span className="text-[9px] bg-red-950/40 text-red-400 border border-red-900/30 px-2 py-0.5 rounded font-bold font-mono uppercase">{aiAnalysisResult.impact}</span>
                          </div>
                          <div>
                            <p className="text-[10px] font-mono text-zinc-500 uppercase">{t.sim_result_risk}</p>
                            <p className="text-xs text-zinc-300 mt-0.5 font-sans leading-relaxed">{aiAnalysisResult.risk}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-mono text-zinc-500 uppercase">{t.sim_result_opp}</p>
                            <p className="text-xs text-zinc-300 mt-0.5 font-sans leading-relaxed">{aiAnalysisResult.opportunity}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-mono text-zinc-500 uppercase">{t.sim_result_action}</p>
                            <ul className="list-disc pl-4 text-xs text-zinc-300 space-y-1 mt-1 font-sans leading-relaxed">
                              {aiAnalysisResult.action.map((act: string, idx: number) => (
                                <li key={idx}>{act}</li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Hedef Kitle Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-zinc-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-orange-500 uppercase tracking-wider font-bold">{t.aud_badge}</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mt-3">
            {t.aud_title}
          </h2>
          <p className="text-zinc-400 font-sans mt-4 text-sm sm:text-base leading-relaxed">
            {t.aud_desc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/60 text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center mb-4 border border-orange-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="text-base font-sans font-black text-white">{t.aud_card1_title}</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              {t.aud_card1_desc}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/60 text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#0D62FE]/10 text-[#0D62FE] flex items-center justify-center mb-4 border border-[#0D62FE]/20">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-base font-sans font-black text-white">{t.aud_card2_title}</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              {t.aud_card2_desc}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/60 text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <h4 className="text-base font-sans font-black text-white">{t.aud_card3_title}</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              {t.aud_card3_desc}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/60 text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-base font-sans font-black text-white">{t.aud_card4_title}</h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              {t.aud_card4_desc}
            </p>
          </div>

        </div>
      </section>

      {/* Platform Modülleri Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-zinc-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-orange-500 uppercase tracking-wider font-bold">{t.mod_badge}</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mt-3">
            {t.mod_title}
          </h2>
          <p className="text-zinc-400 font-sans mt-4 text-sm sm:text-base leading-relaxed">
            {t.mod_desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/60 flex items-start gap-4 hover:border-[#0D62FE]/30 transition-all">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-sans font-black text-white">{t.mod_c1_title}</h4>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{t.mod_c1_desc}</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/60 flex items-start gap-4 hover:border-[#0D62FE]/30 transition-all">
            <div className="w-10 h-10 rounded-full bg-[#0D62FE]/10 text-[#0D62FE] border border-[#0D62FE]/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-sans font-black text-white">{t.mod_c2_title}</h4>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{t.mod_c2_desc}</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/60 flex items-start gap-4 hover:border-[#0D62FE]/30 transition-all">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-sans font-black text-white">{t.mod_c3_title}</h4>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{t.mod_c3_desc}</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/60 flex items-start gap-4 hover:border-[#0D62FE]/30 transition-all">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-sans font-black text-white">{t.mod_c4_title}</h4>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{t.mod_c4_desc}</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/60 flex items-start gap-4 hover:border-[#0D62FE]/30 transition-all">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-sans font-black text-white">{t.mod_c5_title}</h4>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{t.mod_c5_desc}</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/60 flex items-start gap-4 hover:border-[#0D62FE]/30 transition-all">
            <div className="w-10 h-10 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-sans font-black text-white">{t.mod_c6_title}</h4>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{t.mod_c6_desc}</p>
            </div>
          </div>

        </div>
      </section>

      {/* Neden Google / Gemini? Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-zinc-900">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6">
            <span className="text-xs font-mono text-[#0D62FE] uppercase tracking-wider font-bold">{t.why_badge}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mt-3 leading-tight">
              {t.why_title}
            </h2>
            <div className="h-1 w-20 bg-orange-500 mt-6 rounded-full" />
            <p className="text-zinc-400 font-sans text-base leading-relaxed mt-6">
              {t.why_desc}
            </p>
            
            <div className="mt-8 relative border border-orange-500/20 bg-orange-950/20 rounded-2xl p-6">
              <p className="text-sm font-serif italic text-orange-300 leading-relaxed">
                "{t.why_quote}"
              </p>
              <p className="text-xs text-orange-400/80 mt-3 font-mono">
                {t.why_sub}
              </p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/60">
                <h5 className="text-xs font-mono text-orange-400 font-bold uppercase tracking-wider">{t.why_grid1_t}</h5>
                <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">{t.why_grid1_d}</p>
              </div>
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/60">
                <h5 className="text-xs font-mono text-[#0D62FE] font-bold uppercase tracking-wider">{t.why_grid2_t}</h5>
                <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">{t.why_grid2_d}</p>
              </div>
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/60">
                <h5 className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">{t.why_grid3_t}</h5>
                <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">{t.why_grid3_d}</p>
              </div>
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/60">
                <h5 className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">{t.why_grid4_t}</h5>
                <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">{t.why_grid4_d}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Destek Talebi Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-zinc-900">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-950 via-[#03040B] to-slate-950 border-2 border-[#0D62FE]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0D62FE]/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <span className="text-xs font-mono text-orange-500 uppercase tracking-wider font-bold">{t.collab_badge}</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mt-3">
              {t.collab_title}
            </h2>
            <p className="text-zinc-400 font-sans mt-4 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              {t.collab_desc}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left mt-10">
              {t.collab_list.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-xs text-zinc-300 leading-relaxed font-sans">{item}</span>
                </div>
              ))}
            </div>

            <p className="text-sm font-mono text-[#0D62FE] uppercase mt-10 tracking-widest font-bold">
              {t.collab_slogan}
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 text-center border-t border-zinc-900">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl" />
        </div>

        <span className="text-xs font-mono text-[#0D62FE] uppercase tracking-wider font-bold">{t.join_badge}</span>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-white tracking-tight mt-4 leading-none">
          {t.join_title}
        </h2>
        
        <p className="text-zinc-400 font-sans text-base sm:text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
          {t.join_desc}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => setShowDeckModal(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-sans font-black text-base transition-all duration-300 shadow-[0_10px_35px_rgba(234,88,12,0.35)] hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4.5 h-4.5" />
            <span>{t.btnDownloadPitch}</span>
          </button>
          
          <button 
            onClick={() => setShowContactModal(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold text-base transition-all duration-300 border border-slate-800 hover:border-slate-700 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Mail className="w-4.5 h-4.5 text-[#0D62FE]" />
            <span>{t.btnContactOrhan}</span>
          </button>
        </div>

        {/* Founder Business Card Grid */}
        <div className="mt-16 max-w-md mx-auto p-6 rounded-2xl bg-slate-950 border border-slate-800/60 text-left">
          <div className="flex items-center gap-4">
            <img 
              src={profiles?.find(p => p.id === 'user_orhan' || p.name === 'Orhan Balcı')?.avatar || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=150"} 
              alt="Orhan Balcı" 
              className="w-14 h-14 rounded-full object-cover border-2 border-orange-500 shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=150";
              }}
            />
            <div>
              <h4 className="text-base font-sans font-black text-white leading-tight">Orhan Balcı</h4>
              <p className="text-xs text-orange-400 font-mono mt-0.5">Founder, WeTalks Insights</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-900 space-y-2 text-xs text-zinc-400 font-sans">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>orhan@wetalks.tr</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>wetalks.tr</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer copyright note */}
      <footer className="py-10 border-t border-slate-950 bg-black text-center text-xs text-zinc-600 font-sans">
        <p>{t.footer_text}</p>
      </footer>


      {/* PITCH DECK SLIDES MODAL */}
      <AnimatePresence>
        {showDeckModal && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[99999] p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-4xl bg-[#090A12] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setShowDeckModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-slate-900/80 p-2 rounded-full cursor-pointer z-20 border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 h-auto md:h-[500px]">
                {/* Left side: Navigation / slides index */}
                <div className="md:col-span-4 bg-[#05060B] p-6 border-r border-slate-900 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-8">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-mono font-bold tracking-widest text-zinc-300">{t.slide_title}</span>
                    </div>

                    <div className="space-y-2">
                      {pitchDeckSlides.map((slide, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveSlide(idx)}
                          className={`w-full text-left px-4 py-3 rounded-xl text-xs font-sans font-bold transition-all flex items-center justify-between cursor-pointer ${activeSlide === idx ? 'bg-[#0D62FE] text-white' : 'text-zinc-400 hover:bg-slate-900/50'}`}
                        >
                          <span>{idx + 1}. {slide.title}</span>
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeSlide === idx ? 'translate-x-0.5' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-zinc-500 mt-6 md:mt-0">
                    {t.slide_counter} {activeSlide + 1} / {pitchDeckSlides.length}
                  </div>
                </div>

                {/* Right side: Active slide content */}
                <div className={`md:col-span-8 p-8 flex flex-col justify-between bg-gradient-to-br ${pitchDeckSlides[activeSlide].color} relative`}>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-orange-400 tracking-wider uppercase">{pitchDeckSlides[activeSlide].subtitle}</span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-black text-white mt-2">{pitchDeckSlides[activeSlide].title}</h3>
                    
                    <ul className="mt-8 space-y-4">
                      {pitchDeckSlides[activeSlide].bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                          <span className="text-sm text-slate-200 leading-relaxed font-sans">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-900/40">
                    <button 
                      disabled={activeSlide === 0}
                      onClick={() => setActiveSlide(prev => prev - 1)}
                      className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-white font-sans disabled:opacity-30 cursor-pointer"
                    >
                      {t.back}
                    </button>
                    <button 
                      disabled={activeSlide === pitchDeckSlides.length - 1}
                      onClick={() => setActiveSlide(prev => prev + 1)}
                      className="px-4 py-2 rounded-xl bg-[#0D62FE] hover:bg-[#0b54da] text-xs text-white font-sans font-bold disabled:opacity-30 cursor-pointer"
                    >
                      {t.next}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* CONTACT MODAL */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[99999] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[#090A12] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative p-6 sm:p-8"
            >
              <button 
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-slate-900/80 p-2 rounded-full cursor-pointer z-20 border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-mono font-bold tracking-widest text-zinc-300">{t.contact_titleBadge}</span>
              </div>

              <h3 className="text-xl font-serif font-black text-white">{t.contact_header}</h3>
              <p className="text-xs text-zinc-400 mt-1 font-sans">{t.contact_desc}</p>

              {contactSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-sans font-bold text-white">{t.contact_sent_header}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{t.contact_sent_desc}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleContactSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">{t.contact_lbl_name}</label>
                    <input 
                      required
                      type="text" 
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder={t.contact_pl_name}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0D62FE]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">{t.contact_lbl_email}</label>
                    <input 
                      required
                      type="email" 
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder={t.contact_pl_email}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0D62FE]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">{t.contact_lbl_msg}</label>
                    <textarea 
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder={t.contact_pl_msg}
                      className="w-full h-24 rounded-xl bg-slate-900 border border-slate-800 p-3.5 text-xs text-white focus:outline-none focus:border-[#0D62FE] resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-sans font-black text-xs tracking-wider uppercase transition-colors cursor-pointer shadow-md mt-2"
                  >
                    {t.contact_btn_submit}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
