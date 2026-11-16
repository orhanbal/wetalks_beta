/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Tag, UserProfile, Article, Comment, Notification } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'deneyimler',
    name: 'Deneyimler',
    slug: 'deneyimler',
    description: 'Yazarların kendi yaşadıkları gerçek ticari, girişimcilik ve e-ticaret süreçleri.',
    icon: 'Sparkles'
  },
  {
    id: 'makaleler',
    name: 'Makaleler',
    slug: 'makaleler',
    description: 'Genel fikir yazıları, analizler, sektör yorumları ve stratejik içerikler.',
    icon: 'BookOpen'
  },
  {
    id: 'roportajlar',
    name: 'Röportajlar',
    slug: 'roportajlar',
    description: 'Yazarlar, girişimciler ve sektör profesyonelleriyle derin söyleşiler.',
    icon: 'MessageSquare'
  },
  {
    id: 'gundem',
    name: 'Gündem',
    slug: 'gundem',
    description: 'Haberlerin AI destekli premium analizlere ve dürüst yorumlara dönüştüğü yer.',
    icon: 'TrendingUp'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    slug: 'amazon',
    description: 'Global pazaryeri dinamiği, FBA stratejileri ve hesap yönetimi pratikleri.',
    icon: 'Globe'
  },
  {
    id: 'trendyol',
    name: 'Trendyol',
    slug: 'trendyol',
    description: 'Türkiye’nin en büyük yerli pazaryerinde satış ve kampanya taktikleri.',
    icon: 'ShoppingBag'
  },
  {
    id: 'hepsiburada',
    name: 'Hepsiburada',
    slug: 'hepsiburada',
    description: 'Hepsiburada platform ortaklığı, lojistik servisleri ve mağaza büyüme rehberi.',
    icon: 'CheckSquare'
  },
  {
    id: 'temu',
    name: 'Temu',
    slug: 'temu',
    description: 'Çin menşeili devin hamleleri, tedarik zincirleri ve pazar etkileri.',
    icon: 'Cpu'
  },
  {
    id: 'etsy',
    name: 'Etsy',
    slug: 'etsy',
    description: 'El yapımı ve özgün tasarımları global mikro-ihracat olarak satma rehberi.',
    icon: 'Scissors'
  },
  {
    id: 'walmart',
    name: 'Walmart',
    slug: 'walmart',
    description: 'Kuzey Amerika pazarında dev perakendecinin e-ticaret operasyonları.',
    icon: 'Layers'
  },
  {
    id: 'e-ihracat',
    name: 'E-İhracat',
    slug: 'e-ihracat',
    description: 'Sınır ötesi dijital ticaret, gümrük, teşvikler ve küresel açılım yolları.',
    icon: 'ExternalLink'
  },
  {
    id: 'lojistik',
    name: 'Lojistik',
    slug: 'lojistik',
    description: 'Kargo, depolama, fulfillment transferleri ve gümrük süreçlerinin yönetimi.',
    icon: 'Truck'
  },
  {
    id: 'yapay-zeka',
    name: 'Yapay Zeka',
    slug: 'yapay-zeka',
    description: 'Büyük dil modelleri, üretken yapay zeka ve ticarette AI asistanlığı.',
    icon: 'Brain'
  },
  {
    id: 'dijital-ticaret',
    name: 'Dijital Ticaret',
    slug: 'dijital-ticaret',
    description: 'Yenilikçi ödeme modelleri, abonelik sistemleri ve dijital pazarlama.',
    icon: 'Coins'
  },
  {
    id: 'etkinlikler',
    name: 'Etkinlikler',
    slug: 'etkinlikler',
    description: 'Sektörün nabzını tutan fuarlar, zirveler, WORLDEF ve Webrazzi buluşmaları.',
    icon: 'Calendar'
  },
  {
    id: 'diger',
    name: 'Diğer',
    slug: 'diger',
    description: 'Platform genelinde kapsanmayan diğer niş ve yardımcı başlıklar.',
    icon: 'Compass'
  }
];

export const INITIAL_TAGS: Tag[] = [
  { id: '1', name: 'yapay-zeka', slug: 'yapay-zeka' },
  { id: '2', name: 'girişimcilik', slug: 'girisimcilik' },
  { id: '3', name: 'yazılım', slug: 'yazilim' },
  { id: '4', name: 'minimalizm', slug: 'minimalizm' },
  { id: '5', name: 'kültür', slug: 'kultur' },
  { id: '6', name: 'verimlilik', slug: 'verimlilik' },
  { id: '7', name: 'web3', slug: 'web3' },
  { id: '8', name: 'finans', slug: 'finans' },
  { id: '9', name: 'tasarım', slug: 'tasarim' }
];

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user_orhan',
    username: 'orhanbalci',
    name: 'Orhan Balcı',
    email: 'orhanbal@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=400',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
    bio: 'E-Ticaret Girişimcisi. WeTalks kurucusu ve editörü. Türkiye e-ticaret ekosisteminde fütüristik çözümler ve büyüme modelleri inşa ediyor.',
    expertise: ['E-Ticaret Girişimcisi', 'Büyüme Pazarlaması', 'E-Ticaret'],
    socials: {
      twitter: 'https://twitter.com/orhanbal',
      linkedin: 'https://linkedin.com/in/orhanbalci'
    },
    followersCount: 0,
    articlesCount: 1,
    role: 'Admin',
    followedAuthors: [],
    savedArticles: [],
    likedArticles: []
  },
  {
    id: 'user_elif',
    username: 'elifnazli',
    name: 'Elif Nazlı',
    email: 'elif@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
    bio: 'Pazarlama Uzmanı. Marka konumlandırma, tüketici davranışları ve yeni nesil pazarlama stratejileri alanında uzman.',
    expertise: ['Pazarlama Uzmanı', 'Marka Yönetimi', 'Pazarlama'],
    socials: {
      twitter: 'https://twitter.com/elifnazli'
    },
    followersCount: 0,
    articlesCount: 1,
    role: 'Writer',
    followedAuthors: [],
    savedArticles: [],
    likedArticles: []
  },
  {
    id: 'user_mehmet',
    username: 'mehmetyilmaz',
    name: 'Mehmet Yılmaz',
    email: 'mehmet@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1200',
    bio: 'Yazılım Geliştiricisi. Yapay zeka entegrasyonları, modern web mimarileri ve yüksek ölçekli backend sistemleri tasarlıyor.',
    expertise: ['Yazılım Geliştiricisi', 'Yapay Zeka', 'Yazılım'],
    socials: {
      github: 'https://github.com/mehmetyilmaz'
    },
    followersCount: 0,
    articlesCount: 1,
    role: 'Writer',
    followedAuthors: [],
    savedArticles: [],
    likedArticles: []
  },
  {
    id: 'user_seda',
    username: 'sedakorkmaz',
    name: 'Seda Korkmaz',
    email: 'seda@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
    bio: 'Yatırımcı. Risk sermayesi, melek yatırımcılık ve kişisel finans yönetimi üzerine derinleşiyor.',
    expertise: ['Yatırımcı', 'Finans', 'Ekonomi'],
    socials: {
      twitter: 'https://twitter.com/sedakorkmaz'
    },
    followersCount: 0,
    articlesCount: 1,
    role: 'Writer',
    followedAuthors: [],
    savedArticles: [],
    likedArticles: []
  },
  {
    id: 'user_burak',
    username: 'burakyildiz',
    name: 'Burak Yıldız',
    email: 'burak@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
    bio: 'Ürün Yöneticisi. Kullanıcı deneyimi, ürün yol haritaları ve çevik yönetim metodolojileri üzerine yazıyor.',
    expertise: ['Ürün Yöneticisi', 'Ürün Yönetimi', 'Teknoloji'],
    socials: {
      linkedin: 'https://linkedin.com'
    },
    followersCount: 0,
    articlesCount: 1,
    role: 'Writer',
    followedAuthors: [],
    savedArticles: [],
    likedArticles: []
  },
  {
    id: 'author_wetalks_ai',
    username: 'wetalks_ai',
    name: 'WeTalks',
    email: 'ai@wetalks.tr',
    avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23FF4C1C" rx="20"/><path d="M30 70 L70 30 M45 30 L70 30 L70 55" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200',
    bio: 'WeTalks, araştırma ve içerik destek süreçlerinde yapay zekâ modellerinden yararlanan yardımcı editör hesabıdır.',
    expertise: ['Yapay Zeka', 'E-Ticaret Analizi', 'Gündem Değerlendirmesi'],
    socials: {
      twitter: 'https://twitter.com/wetalks_ai',
      website: 'https://wetalks.tr'
    },
    followersCount: 0,
    articlesCount: 5,
    role: 'Writer',
    followedAuthors: [],
    savedArticles: [],
    likedArticles: []
  }
];

export const DUMMY_ARTICLE_BODY = `### Giriş: Karmaşanın Ortasındaki Sadelik

Modern dünya bizlere amansız bir üretkenlik ve bağlantı hızı vaat ediyor. Ancak bu vaadin gölgesinde kalan şey, insan beyninin biyolojik sınırları ve odaklanma yeteneğimizin erozyonudur. Sürekli olarak uyaranlara maruz kaldığımız bu çağda, sakin kalabilmek kendi başına bir süper güç haline gelmiştir.

Yazarlar, geliştiriciler ve tasarımcılar olarak, her gün yeni bir şey üretme baskısı altındayız. Peki ama, dikkatimiz bu kadar dağınıkken nasıl kaliteli ve kalıcı eserler üretebiliriz?

> "Odaklanma, her şeye evet demek değildir; tam aksine, en önemli tek bir şeye odaklanabilmek için diğer yüzlerce harika fikre hayır diyebilmektir." - Steve Jobs

---

### Temel Sütunlar: KISS ve Derin İş Protokolleri

Aşağıda, modern çalışma rutininize hemen bugün dahil edebileceğiniz 3 temel prensibi derledik:

1. **Zaman Bloklama (Time-blocking):** Gününüzü kontrolsüz toplantılarla bölmek yerine, sabahları en az 2 saati "derin çalışma" seansı olarak rezerve edin. Bu sürede tüm e-postaları, Slack ve sosyal medya bildirimlerini kapatın.
2. **Kütüphane Sadeleştirme (Yazılım İçin):** Mimari tasarımlarınızı yaparken kendinize şu soruyu sorun: *"Gerçekten bu bağımlılığa ihtiyacım var mı, yoksa bunu 10 satır saf kodla çözebilir miyim?"*
3. **Zihinsel Temizlik:** Çalışma alanınızdaki fiziksel dağınıklığı, masaüstünüzdeki ikon yığınlarını temizleyin. Sadelik dışarıda başlar, zihne yerleşir.

#### Sıklıkla Yapılan Hatalar

Eğer sürekli olarak aşağıdaki döngünün içindeyseniz, sisteminizde "aşırı mühendislik" (over-engineering) veya dikkat dağınıklığı hatası var demektir:

\`\`\`javascript
// Kötü bir günün döngüsü
while (energy > 0) {
  checkNotifications(); // Her 5 dakikada bir!
  writeThreeLinesOfCode();
  joinUnnecessaryMeeting();
  overthinkArchitecture();
}
\`\`\`

Bunun yerine sistemi sadeleştirin. Kod kütüphanelerinizi ve dikkat dağıtıcılarınızı mimarinizden ayıklayın.

*   Çevrimdışı okuma saatleri düzenleyin.
*   Büyük hedefleri yönetilebilir alt parçalara bölün.
*   Taslaklarınızı ilk seferde mükemmel yapmaya çalışmayın, sadece fikri kağıda dökün.

Sonuç olarak, kaliteli ürünler ve makaleler hırsın değil, odaklanmanın eseridir. WeTalks'ta sizleri de bu derin ve anlamlı üretim ekosistemine davet ediyoruz.`;

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'article_1',
    seriesId: 'series_orhan_ecommerce',
    title: 'ÖNSÖZ - AYNA TİCARET',
    summary: 'E-ticaretin yalanlarla dolu, göz kamaştırıcı ışıltısını bir tarafa bırakıp; ticaretin, esnaflığın ve operasyonun çıplak gerçeklerini konuşacağımız seriye giriş niteliğinde bir önsöz.',
    content: `### E-Ticaretin Görünmeyen Aynası: Önsöz

Birçoğumuz sosyal medyada, internet reklamlarında ya da katıldığımız havalı konferanslarda e-ticaretin hep o büyüleyici tarafını görüyoruz: "Sıfırdan milyon dolarlık ciro yapan genç girişimciler", "plajda şezlonga uzanarak laptopuyla dolar kazanan dijital göçebeler", "günde sadece bir saat çalışarak pasif gelir elde eden e-ticaret dehaları..." 

Bu ışıltılı anlatı, insan ruhundaki kolay yoldan özgürleşme arzularını gıdıklarken, ticaretin asıl doğasını ve bin yıllık esnaflık kültürünü unutturuyor.

#### Ayna Ticaret Serisi Neden Var?

Ayna, karşısına geçene filtre uygulamadan, tüm hatlarıyla, olduğu gibi gerçeği gösteren bir araçtır. **Ayna Ticaret**, e-ticaretin ve modern iş dünyasının o şöhret boyalı parıltısının arkasındaki **tozu, çamuru, uykusuz geceleri ve lojistik depolarındaki soğuk gerçekleri** anlatmak için doğdu.

Bu seride:
*   Büyük pazaryerlerinin (Amazon, Trendyol vb.) satıcıları sömüren görünmez mekanizmalarını,
*   Yapay zeka devrimiyle değişen üretim ilişkilerini,
*   "Ciro var ama kâr nerede?" sorusunun peşine düşeceğimiz muhasebe masalarını,
*   İade ekonomisinin ve lojistik felaketlerin esnafın belini nasıl büktüğünü söyleşiden uzak, doğrudan sahadan gelen gerçek deneyimlerle masaya yatıracağız.

#### Gerçekçilik ve Kararlılık

Eğer duymak istediğiniz şey "nasıl 3 günde zengin olursunuz" kurgularıysa, bu seri size göre değil. Ancak; paket bandının o yapışkan sesini, faturanın son kuruşundaki kâr-zarar hesabını, tedarikçinin yüzündeki o sinsi gülümsemeyi okuyup, dijital dünyasının dönüşümünü **gerçek esnaflık** ruhuyla anlamlandırmak istiyorsanız, hoş geldiniz.

Aynanın arkasındaki gerçek dünyaya birlikte adım atıyoruz.`,
    coverImage: 'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w1200/2026/05/onsoz-3.png',
    authorId: 'user_orhan',
    authorName: 'Orhan Balcı',
    authorAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200',
    categoryId: 'deneyimler',
    tags: ['e-ticaret', 'ayna-ticaret', 'girisimcilik'],
    createdAt: '2026-06-15T14:30:00Z',
    readTime: 4,
    status: 'Published',
    views: 0,
    likes: 0,
    seoTitle: 'ÖNSÖZ - AYNA TİCARET | Orhan Balcı',
    seoDescription: 'E-ticaret dürüstçe analizleri, Ayna Ticaret serisi önsözü, esnaflık felsefesi ve dijital ticaret sistemleri.'
  },

  {
    id: 'article_gundem_1',
    title: 'Temu’nun Avrupa Hamlesi Türk Satıcıları ve Üreticileri Nasıl Etkileyecek?',
    summary: 'Çin menşeili dev platform Temu, Avrupa genelinde agresif bir büyüme stratejisi izliyor. Bu gelişmenin yerli üreticiler, gümrük muafiyet sınırları ve e-ihracatçılar üzerindeki olası etkilerini inceliyoruz.',
    content: `### Temu Tehdidi ve Fırsatları: Derin Bir Sektör Analizi

Çinli e-ticaret devi **Temu**, doğrudan üreticiden tüketiciye (M2C) iş modeliyle küresel pazarları sarsmaya devam ediyor. Özellikle Avrupa Birliği ülkelerinde yakaladığı muazzam büyüme hızı, yerli üreticiler ve Avrupalı yerel e-ticaret satıcıları arasında büyük bir tartışma başlattı.

#### 1. Vergi ve Gümrük Regülasyonlarındaki Değişimler
Ucuza ürün gönderme avantajı sağlayan gümrük muafiyeti limitleri (De Minimis), Avrupalı yerel ticaret heyetleri ve Ticaret Bakanlıkları tarafından mercek altına alındı. Yakın zamanda gümrük vergisi muafiyet limitlerinin düşürülmesi veya tamamen sıfırlanması bekleniyor. Bu, maliyet dengelerini tamamen değiştirebilir.

#### 2. Türk Satıcılar İçin Çıkarılacak Dersler
* **Hız ve Lojistik Üstünlüğü:** Temu'nun Çin'den gönderim süresi ortalama 10-15 gün sürerken, Türkiye’deki e-ihracatçılar lojistik avantajını kullanarak Avrupa geneline 2-4 günde teslimat sağlayabilirler.
* **Marka ve Kalite Diferansiyasyonu:** Ucuz ve tek kullanımlık ürün sarmalı yerine markalı, kaliteli ve arkasında durulan müşteri memnuniyet garantili ürün gruplarına odaklanmak tek kurtuluş yoludur.
* **Tedarik Zinciri Kontrolü:** Kendi üretim gücü olan yerli işletmeler, Temu'nun lojistik dezavantajını e-ihracat destekleri ile birleştirerek niş kategorilerde öne çıkabilirler.

WeTalks editörü olarak görüşümüz; bu dalgaya karşı fiyatta rekabet etmek imkansızdır. Çözüm, mikro-markalaşma ve katma değerli e-ihracattır.`,
    coverImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200',
    authorId: 'author_wetalks_ai',
    authorName: 'WeTalks',
    authorAvatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23FF4C1C" rx="20"/><path d="M30 70 L70 30 M45 30 L70 30 L70 55" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
    categoryId: 'gundem',
    tags: ['temu', 'e-ihracat', 'gundem'],
    createdAt: '2526-06-19T10:00:00Z', // Use futuristic dates to keep it fresh
    readTime: 4,
    status: 'Published',
    views: 0,
    likes: 0,
    seoTitle: 'Temu’nun Avrupa Hamlesi Türk Satıcıları Nasıl Etkiler? | WeTalks',
    seoDescription: 'Temu’nun ucuz lojistik ve üreticiden doğrudan tüketiciye modeliyle Avrupa’da büyümesinin, yerli e-ihracatçılar ve gümrük mevzuatları üzerindeki analizleri.'
  },
  {
    id: 'article_gundem_2',
    title: 'Amazon Global Satıcılar İçin %12 FBA Teşvik İndirim Fırsatı Sunuyor',
    summary: 'Amazon, yeni listelenen FBA (Fulfillment by Amazon) ürünleri için satıcı komisyonlarında %12ye varan bir indirim kampanyası başlattı. Peki bu teşvikten hangi kategoriler yararlanabiliyor?',
    content: `### Amazon FBA Teşvikleri ile Küresel Satışlarınızı Katlayın

Küresel e-ticaret platformu **Amazon**, depo ve lojistik maliyetlerini optimize etmek amacıyla FBA sistemini kullanan satıcılara yönelik devrim niteliğinde bir indirim teşviki duyurdu.

#### Kimler ve Hangi Ürünler Yararlanabilir?
Aşağıdaki koşulları sağlayan yeni ve potansiyeli yüksek ASIN'ler için %12'ye varan geri ödeme ve komisyon indirimi sağlanacak:
1. **Yeni Ürün Listelemeleri:** Amazon depolarına ilk kez giren ürün grupları.
2. **Marka Sahipleri (Brand Registry):** Marka tescilini Amazon ekosisteminde başarıyla tanımlamış profesyonel satıcılar.
3. **Kategori Kısıtlamaları:** Giyim, ev, mutfak gereçleri ve spor ürünlerinde indirim oranları maksimum seviyeye çıkıyor.

#### Türkiye’deki Satıcılar İçin Neden Kritik?
Özellikle tekstil ve mutfak ürünlerinde güçlü bir üretim altyapısına sahip olan ülkemiz satıcıları, bu %12'lik marj avantajını kullanarak ürün lansmanlarındaki reklam bütçelerini (PPC) fonlayabilirler. Bu indirim, ilk 90 gün boyunca geçerli olacak ve satıcılara pazar payı kazanmak için harika bir can suyu sağlayacaktır.

Bu fırsatı kaçırmamak için Amazon satıcı panelinizdeki "FBA New Selection Program" sayfasını hemen kontrol edip kayıt olmanızı öneririz.`,
    coverImage: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=1200',
    authorId: 'author_wetalks_ai',
    authorName: 'WeTalks',
    authorAvatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23FF4C1C" rx="20"/><path d="M30 70 L70 30 M45 30 L70 30 L70 55" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
    categoryId: 'amazon',
    tags: ['amazon', 'fba', 'lojistik'],
    createdAt: '2526-06-18T15:30:00Z',
    readTime: 3,
    status: 'Published',
    views: 0,
    likes: 0,
    seoTitle: 'Amazon FBA %12 Komisyon İndirimi Teşvik Paketleri | WeTalks',
    seoDescription: 'Amazon un yeni FBA ürünleri ve marka sahipleri için duyurduğu yüzde 12ye varan yeni komisyon indirimi teşvik programı detayları.'
  },
  {
    id: 'article_gundem_3',
    seriesId: 'series_orhan_ecommerce',
    title: "AYNA TİCARET' E DAİR",
    summary: 'Ayna Ticaret neyi temsil eder? Dijital çağda esnaflık felsefesi nedir ve masa başı teorileriyle sahanın gerçekleri arasındaki derin yarıklar.',
    content: `### Masa Başı Teorileri Değil, Sahanın Çıplak Gerçekleri: Ayna Ticarete Dair

Bugün "E-ticaret nasıl yapılır?" araması yaptığınızda, binlerce sayfalık harika teorilere, slaytlara, çizelgelere rastlarsınız. Oradaki formüller o kadar şık ve kusursuzdur ki, kendinizi kaptırmamak imkansızdır. Fakat o şık slaytları hazırlayanların kaçı sabahın beşinde soğuk bir depoda yırtılan koli bantlarıyla uğraştı veya bir kargo şubesinde "barkod hatası" yüzünden kaybolan 200 adet ürünü bulmak için kavga etti?

İşte **Ayna Ticaret**, tam da bu yarıkta duruyor. Süslemelerden arınmış, masa başında değil, bizzat paketleme masasında yazılmış bir felsefe.

#### Dijital Çağın Yeni Nesil Esnafları

Bizler kendimizi "teknoloji girişimcisi", "büyüme hacker'ı" veya "e-ticaret uzmanı" gibi fiyakalı sıfatlarla tanımlamayı sevebiliriz. Ama dürüst olalım: Eğer internet üzerinden fiziksel bir malı bir yerden alıp bir yere paketleyip satıyorsak, bizim asıl kimliğimiz **esnaflıktır**. 

Sadece dükkanımızın kapısı ahşap değil, HTML kodlarıyla örülü bir web sayfasıdır. Ama ruh aynıdır:
*   Müşterinin güvenini kazanmak,
*   Tedarikçiyle olan o hassas dengeyi korumak,
*   Kârlılık ve nakit akışını düzgün yönetmek,
*   Ve günün sonunda o helal kazancı masaya koyabilmek.

#### Gerçekçilik ve Tecrübe Paylaşımı

Bu serideki hiçbir yazı, sizi havada uçuşan hayallerle uyutmayı amaçlamaz. Tam tersine, kafanızı duvarlara vurarak öğrendiğimiz pahalı derslerin, kaybettiğimiz paraların ve uykuların süzgecinden geçmiş **en saf tecrübeleri** dürüstçe ortaya koyar.

Zorlukları bilerek, ayakları yere basarak büyümek isteyenlerin buluşma noktası burasıdır.`,
    coverImage: 'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w750/2026/05/ayna.png',
    authorId: 'user_orhan',
    authorName: 'Orhan Balcı',
    authorAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200',
    categoryId: 'deneyimler',
    tags: ['e-ticaret', 'ayna-ticaret', 'girisimcilik'],
    createdAt: '2526-06-17T11:00:00Z',
    readTime: 5,
    status: 'Published',
    views: 0,
    likes: 0,
    seoTitle: "AYNA TİCARET' E DAİR | Orhan Balcı",
    seoDescription: 'Ayna Ticaret nedir, dijital çağda esnaflık felsefesi, teoriler ve operasyonel gerçekler arasındaki tezatlıklar.'
  },
  {
    id: 'article_gundem_4',
    title: 'OpenAI E-Ticaret Alışveriş Asistanı Modelini Sessizce Yayına Aldı',
    summary: 'OpenAInin yeni nesil muhakeme yapabilen yapay zeka modelleri, e-ticaret sitelerinde entegre bir alışveriş asistanı olarak çalışabilecek. Bu teknoloji geleneksel ürün filtreleme sistemlerini tarihe gömebilir.',
    content: `### OpenAI E-Ticaret Asistanı ve Dijital Alışveriş Devrimi

Pazaryerlerindeki eski ve hantal kelime eşleştirmeli arama motorları yakında tarih oluyor. Yapay zeka araştırma şirketi **OpenAI**, e-ticaret siteleri ve global entegretörler için özel olarak optimize edilmiş, sesli ve yazılı "Shopping Search-Agent" entegrasyon modelini duyurdu.

#### Alışveriş Deneyimi Nasıl Evrilecek?
Geleneksel e-ticaret sitelerinde bir gömlek ararken beden, renk ve kumaş filtreleri seçmek zorundayız. Yeni AI asistanları ile süreç şu şekilde işleyecek:
> *"Bana haftaya katılacağım İtalya seyahatinde giyebileceğim, terletmeyen, hem şık hem sportif görünecek ve bütçeme uygun keten gömlek kombinlerini listele."*

AI modeli e-ticaret kataloğundaki tüm ürünlerin kumaş detaylarını, kullanıcı yorumlarındaki beden kalıp geri bildirimlerini ve fiyat geçmişlerini saniyeler içinde analiz ederek, tam uyumlu 3 alternatif sunacak.

#### Satıcılar ve Geliştiriciler Ne Yapmalı?
* **Ürün Detay Açıklamalarını Zenginleştirin:** Artık sadece teknik kelimeler değil, hikaye odaklı, kullanım yeri ve hissi belirten doğal dil açıklamaları AI tarafından daha kolay taranıyor.
* **API Entegrasyonlarına Uyum Sağlayın:** Kendi altyapısını yöneten e-ticaret siteleri, bu yeni asistan API'lerini sistemlerine ne kadar erken entegre ederlerse, dönüşüm oranlarını (CR) o kadar dramatik ölçüde artıracaklardır.

Bu asistan devrimi, e-ticareti düz bir katalog gezintisinden, kişisel bir asistan rehberliğindeki butik deneyimine dönüştürmeyi vaat ediyor.`,
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200',
    authorId: 'author_wetalks_ai',
    authorName: 'WeTalks',
    authorAvatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23FF4C1C" rx="20"/><path d="M30 70 L70 30 M45 30 L70 30 L70 55" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
    categoryId: 'yapay-zeka',
    tags: ['yapay-zeka', 'gundem', 'e-ticaret'],
    createdAt: '2526-06-16T14:00:00Z',
    readTime: 4,
    status: 'Published',
    views: 0,
    likes: 0,
    seoTitle: 'OpenAI Shopping Assistant Yapay Zeka Devrimi | WeTalks',
    seoDescription: 'OpenAInin e-ticaret ve dijital alışveriş siteleri için özel geliştirdiği, muhakeme yetenekli asistan robotunun sektöre etkileri.'
  },
  {
    id: 'article_gundem_5',
    title: 'E-İhracat Limitlerinde Yeni Dönem: Gümrük Muafiyeti Sınırlandırılması',
    summary: 'Yurt dışından bireysel hızlı kargo ile getirilen ürünlerde gümrük muafiyet limitinin düşürülmesi kararı, yerli üreticiyi korurken sınır ötesi e-ticaret dengelerini nasıl değiştirecek?',
    content: `### Yeni Gümrük Kararnamesi ve E-Ticaret Sektörüne Etkileri

Resmi Gazete’de yayınlanan son kararla birlikte sınır ötesi alışverişlerde hızlı kargo muafiyet limitleri yeniden düzenlendi. Özellikle yurt dışı pazar yerlerinden (Temu, AliExpress, Amazon Global vb.) yapılan alışverişlerdeki vergilendirme ve gümrük süreçleri, yerli üreticiyi koruma ekseninde köklü değişikliklere uğradı.

#### Kararın Detayları Neler?
*   **Limit Değişikliği:** Hızlı kargo kapsamında gümrük vergisi muafiyet limiti düşürüldü.
*   **Vergi Oranları Artırıldı:** AB dışından gelen gönderilerdeki nispi gümrük vergisi oranları önemli ölçüde yükseltildi.
*   **Aylık Sipariş Havuzu Sınırı:** Bir takvim ayı içerisinde aynı T.C. kimlik numarasına gelebilecek bireysel paket adedi kontrolleri sıkılaştırıldı.

#### Yerli E-Ticaret Pazarına ve Satıcılara Yansımaları
Sektörün önde gelen temsilcilerine göre bu hamle kısa vadede yurt dışı ucuz tüketim mallarının iç piyasadaki ezici rekabet gücünü törpüleyecek:
1.  **Yerli Üreticilere Alan Açılacak:** Tekstil, aksesuar ve plastik ev aletleri gibi yerli üretimin güçlü olduğu sektörlerde, mikro ithalat rüzgarına karşı koruma kalkanı oluşacak.
2.  **Kendi E-Ticaret Sitelerimize (DTC) İlgi Artacak:** Satıcılar artık hazır ucuz Çin mallarını fason satmak yerine, katma değerli markalar inşa etmeye ve kendi kargo altyapıları üzerinden özgün ihracat yapmaya yöneleceklerdir.

Bu düzenleme ile e-ticarette pazar payı savaşı, sadece ucuz fiyat odaklı olmaktan çıkarak; hızlı teslimat, müşteri hizmetleri ve marka kalitesi odağına taşınacaktır.`,
    coverImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200',
    authorId: 'author_wetalks_ai',
    authorName: 'WeTalks',
    authorAvatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23FF4C1C" rx="20"/><path d="M30 70 L70 30 M45 30 L70 30 L70 55" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
    categoryId: 'gundem',
    tags: ['gundem', 'e-ticaret', 'lojistik'],
    createdAt: '2526-06-15T09:00:00Z',
    readTime: 4,
    status: 'Published',
    views: 0,
    likes: 0,
    seoTitle: 'E-İhracat Limitlerinde Yeni Dönem ve Gümrük Kararı | WeTalks',
    seoDescription: 'Hızlı kargo gümrük muafiyeti düzenlemesi, yerli pazar dinamikleri ve e-ticaret markaları üzerindeki stratejik etkiler.'
  },
  {
    id: 'orhan_article_1',
    seriesId: 'series_orhan_ecommerce',
    title: 'Pazaryerlerinin Tehlikeli Oyunu: Ciro Var, Kar Yok',
    summary: 'E-ticaret platformlarının ışıltılı ciro illüzyonuna kapılıp komisyonlar, reklamlar ve kargo maliyetleri arasında yok olan kârlılığı dürüstçe analiz etmek.',
    content: `### Pazaryerlerinin Sunduğu İllüzyon: Ciro Var, Kâr Yok

Bugün bir e-ticaret platformunun panelinde günlük 50.000 TL satış görmek her satıcının kalbini hızlandırır. Reklam panolarında "Saniyede 100 ürün satan platformlar", "Milyonlarca aktif alıcıya tek tıkla ulaşım" sloganları dolaşır. Fakat bu pırıltılı ekosistemde masanın diğer tarafına, yani satıcının kâr-zarar tablosuna geçtiğimizde karşımıza çıkan tablo genellikle hüsrandır.

#### 1. Komisyon ve Reklam Kıskacı
Büyük pazaryerleri (Amazon, Trendyol, Hepsiburada vb.) size hazır bir trafik sunar ama bunun bedelini çok ağır tahsil eder.
*   **Oranlar:** Kategoriye göre %10 ila %25 arasında değişen komisyon oranları doğrudan brüt cironuzdan kesilir.
*   **İç Reklam Zorunluluğu:** Pazaryerindeki organik sıralama algoritmaları neredeyse tamamen ücretli reklam vermeye (PPC/Sponsorlu Ürün) endekslidir. Listede görünür kalabilmek için kâr marjınızın %15-20'sini yine pazaryerinin kendi reklam motoruna geri beslemek zorunda kalırsınız.

#### 2. Kargo ve Gizli Giderler
*   **Kargo Ücretleri:** Satış fiyatından bağımsız olarak, barem altı barem üstü kargo anlaşmaları, desi hesaplamasındaki gizli kaymalar ve iade kargolarının bedelleri tamamen satıcıya yüklenir.
*   **Hizmet Bedeli:** Her faturada "işlem ücreti", "geliştirme katkı payı" veya "platform katılım bedeli" adı altında küçük ama toplandığında devasa olan kesintilerle karşılaşırsınız.

#### Gerçek Matematik: Ciro mu, Kâr mı?

Gelin basit bir örnek yapalım. 100 TL'ye listelediğiniz ve size maliyeti (ürün + ilk paketleme) 40 TL olan bir ürünü ele alalım.
*   **Pazaryeri Komisyonu (%20):** 20 TL
*   **Kupon / İskonto Kampanyası Katılımı (%10):** 10 TL
*   **Ortalama Reklam (PPC) Gideri (%15):** 15 TL
*   **Lojistik / Gönderim Kargosu:** 18 TL
*   **İade Oranı Maliyeti Karşılığı (Her 10 kargoda 1 iade gelse ve gidiş-dönüş lojistik size yazsa):** 4 TL
*   **Kalan Net Kâr:** Sadece **(-7 TL)** veya en iyi ihtimalle ucu ucuna **3 TL**.

Cirosu milyonları bulan ama her ay cebinden vergisini, stopajını ve personel maaşını ödemek için kredi çeken şirketler işte bu lansman illüzyonu yüzünden batıyor. Çözüm mü? Kendi sitenizde DTC markası yaratmak, niş ürün bulmak, pazaryerlerini bir "amaç" değil sadece geçici bir "trafik köprüsü" olarak kullanmaktır.`,
    coverImage: 'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w1200/2026/06/oyun-2.png',
    authorId: 'user_orhan',
    authorName: 'Orhan Balcı',
    authorAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200',
    categoryId: 'deneyimler',
    tags: ['e-ticaret', 'ayna-ticaret', 'finans'],
    createdAt: '2526-06-20T10:00:00Z',
    readTime: 6,
    status: 'Published',
    views: 0,
    likes: 0,
    seoTitle: 'Pazaryerlerinin Tehlikeli Oyunu: Ciro Var, Kar Yok | Orhan Balcı',
    seoDescription: 'E-ticarette ciro yanılgısı, yüksek komisyon, gizli lojistik maliyetleri ve kârlılık optimizasyonu.'
  },
  {
    id: 'orhan_article_2',
    seriesId: 'series_orhan_ecommerce',
    title: 'E-Ticaret İade Ekonomisi',
    summary: 'Lojistikteki en büyük delik: İade oranlarının operasyonel yükü, kargo faturaları ve iadeleri bir kriz olmaktan çıkarıp yönetilebilir hale getirmenin yolları.',
    content: `### İade Ekonomisi: E-Ticaretın Kanayan Yarası

E-Ticarette satışı yapmak, yolculuğun sadece yarısıdır. Hatta bazen dertlerin sadece başlangıcıdır. Ürünün kargolanıp müşterinin eline geçmesi ve 14 günlük yasal cayma hakkı süresinin sorunsuz dolması, aslında e-ticaretin asıl "başarı" kriteridir. Birçok satıcı sadece giden kargoları sayarken, arkadan sessizce gelen iade tsunami dalgasını görmezden gelir.

#### İade Oranları Neden Çıldırdı?

"Koşulsuz iade garantisi", "bedava kargo", "kapıdan kolay iade" gibi tüketici dostu hamleler e-ticaret sitelerinin satış dönüşüm oranlarını artırsa da, satıcıları birer lojistik hamala dönüştürdü. Özellikle hazır giyim, ayakkabı ve aksesuar kategorilerinde iade oranları **%35 ila %50** bandına tırmanmış durumda.
Müşteri aynı elbisenin "S", "M" ve "L" bedenini alıp, evde deneyip ikisini (bazen üçünü de) geri gönderiyor.

#### Gizli İade Maliyetleri

Bir iade siparişi aldığınızda kaybınız sadece satılmayan ürünün kârı değildir:
1.  **Gidiş-Dönüş Kargo Bedeli:** Çoğu platformda müşterinin ücretsiz iade ettiği ürünün kargo faturası (hem gidiş hem dönüş ücreti olarak) satıcıya kesilir.
2.  **Kullanılmış / Hasarlı Ürün:** Ürünün orijinal kutusu yırtılmış, ambalajı açılmış, parfüm kokmuş veya hasar görmüş olarak döner. Bu ürün artık "sıfır" olarak satılamaz ve doğrudan fire yazılır.
3.  **Yeniden Paketleme ve İşçilik:** Dönen her ürünün kalite kontrolden geçmesi, ütülenmesi, yeni naylonuna konması ve tekrar rafa kaldırılması ciddi bir depo işgücü maliyeti.

#### İade Canavarı Nasıl Ehlileştirilir?

*   **Piksel Derecesinde Detaylı Görseller ve Videolar:** Ürünün renk tonunu, dokusunu ve kalıbını en küçük ayrıntısına kadar gösteren gerçekçi videolar çekin. Aşırı photoshop ve filtre kullanımı iadeyi doğrudan davet eder.
*   **Dynamic Size Advisor:** Beden tablolarını standart kalıplardan çıkarıp, boy-kilo eşleştirmeli yapay zeka destekli rehberlere dönüştürün.
*   **Doğru Paketleme Mühendisliği:** Taşıma esnasında kırılma ihtimali olan ürünleri balonlu naylona sarmak yetmez. Düşme testlerini kendi deponuzda kendiniz yapın.

İade oranını %50'den %18'e çekmek, reklam bütçenizi iki katına çıkarmaktan çok daha fazla net kâr üretir. Unutmayın, ticaret kargo şirketlerini zengin etmek için yapılmaz.`,
    coverImage: 'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w1200/2026/05/iadeekonomisi-2.png',
    authorId: 'user_orhan',
    authorName: 'Orhan Balcı',
    authorAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200',
    categoryId: 'lojistik',
    tags: ['e-ticaret', 'operasyon', 'lojistik'],
    createdAt: '2526-06-19T09:15:00Z',
    readTime: 5,
    status: 'Published',
    views: 0,
    likes: 0,
    seoTitle: 'E-Ticaret İade Ekonomisi ve Operasyon Yönetimi | Orhan Balcı',
    seoDescription: 'İade süreçlerinin lojistik maliyetleri, kârlılığa etkileri ve iade oranlarını düşürme taktikleri.'
  },
  {
    id: 'orhan_article_3',
    seriesId: 'series_orhan_ecommerce',
    title: 'İlk Risk Alma Anı',
    summary: 'Konfor alanından çıkışın, memur zihniyetini yıkıp ticarete atılmanın o ilk sancılı gecesinin, çevrenin şüpheci bakışlarının ve belirsizliğe adım atmanın hikayesi.',
    content: `### İlk Kırılma Noktası: Güvenli Limandan Ayrılmak

Her şey harika bir fikir ve heyecan verici bir hayalle başlar. Akşamları arkadaş toplantılarında "Aslında bir e-ticaret sitesi kurup şunu satsak acayip tutar" planları yapılır. Ancak iş, istifa dilekçesini yazmaya, biriktirdiğin o son sermayeyi bilinmeyen bir ürüne yatırmaya gelince, insan zihnindeki o korumacı duvarlar yükselir.

#### Çevrenin "Dostça" Şüpheleri

Ticarete atılacağını söylediğinde etrafında en sık duyacağın cümleler şunlardır:
> *"Oğlum/kızım ne güzel sigortalı işin var, her ay maaşın tıkır tıkır yatıyor. Macera arama şimdi."*
> *"İnternette herkes satıyor zaten, sana ekmek yedirirler mi orada?"*
> *"Girişimci olunca çok batıyorlarmış, geçen gün bizim komşunun oğlu her şeyini kaybetti..."*

Bu uyarıların büyük çoğunluğu kötü niyetli değildir; insanların belirsizlikten duyduğu korkunun sizin üzerinizdeki projeksiyonudur. Ancak bu fısıltıları aşamayan hiç kimse gerçek bir lider ya da tüccar olamaz.

#### O Meşhur İlk Sancılı Gece

Sermayeyi toptancıya nakit ödediğin, şahıs şirketini resmen kurduğun ve ilk mal sevkıyatının evdeki misafir odasına yığıldığı o ilk gece hayatının en uzun gecesidir. Excel tablolarındaki o mükemmel kâr hesaplamaları birden silinir. "Eğer satamazsam bu kutularla ne yapacağım?", "Ya kimse siteme girmezse?" şüpheleri beynini kemirir.

Bu an, **ilk risk alma anıdır.** 
Girişimcilik, tam olarak bu korkuya rağmen o paket bandını eline alıp ilk koli kutusunun kapağını kapatabilme cesaretidir. O kolinin içindeki sadece satılacak bir ürün değil; senin konforlu hapishanenden çıkış biletindir.`,
    coverImage: 'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w1200/2026/06/ilk_risk-1.png',
    authorId: 'user_orhan',
    authorName: 'Orhan Balcı',
    authorAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200',
    categoryId: 'deneyimler',
    tags: ['ayna-ticaret', 'girisimcilik', 'deneyimler'],
    createdAt: '2526-06-18T15:20:00Z',
    readTime: 5,
    status: 'Published',
    views: 0,
    likes: 0,
    seoTitle: 'İlk Risk Alma Anı ve Girişimcilik Psikolojisi | Orhan Balcı',
    seoDescription: 'E-ticarete başlarken konfor alanından çıkma sancısı, çevre baskısı ve risk yönetimi.'
  },
  {
    id: 'orhan_article_4',
    seriesId: 'series_orhan_ecommerce',
    title: 'A- İlk Ürün Arayışları',
    summary: 'BÖLÜM I — TİCARETİN İÇİNE GİRMEK | 1. Ne Satabiliriz? Her şeyi satabileceğini düşünme yanılgısından gerçek ürün/pazar uyumuna giden yol.',
    content: `### A- İlk Ürün Arayışları: Her Şeyi Satma İllüzyonu

Ticarete atılmaya karar verdiğimizde yaptığımız en tipik hata şudur: "İnternette herkes kılıf satıyor, ben de kılıf satayım", "Mutfak gereçleri çok satıyormuş, o zaman ben de oraya gireyim." Her şeyi satabileceğinizi sanmak, aslında hiçbir şeyi satamayacağınızın en garanti göstergesidir.

#### Niş Pazarların Gücü

Büyük sermayeli dev e-ticaret siteleriyle aynı ürünlerde çarpışmak finansal bir intihardır. Başarılı bir ürün arayışının ilk kuralı **daralmaktır.**
*   "Ev dekorasyonu" satmak yerine "minimalist çalışma odası ahşap organizerleri" satın.
*   "Kadın giyim" satmak yerine "organik pamuktan sürdürülebilir yoga kıyafetleri" satın.

Dar bir kitleye hitap etmek, reklam maliyetlerinizi (CAC) düşürür ve o toplulukla samimi bir bağ kurarak sadık müşteriler edinmenizi sağlar.

#### Ürün Seçim Kriterleri

1.  **Kargo Kolaylığı:** İlk aşamada kırılma, dökülme riski olmayan, kargosu ucuz ve desi değeri küçük ürünlerle başlayın. Büyük bir mobilyayı kargolamak lojistik bir kabustur.
2.  **Tekrar Satın Alım Potansiyeli:** Müşterinin ürünü bir kez alıp 10 yıl kullanacağı değil; zamanla tüketeceği veya yan aksesuarlarına ihtiyaç duyacağı ürünler LTV oranınızı artırır.
3.  **Kâr Marjı:** En az 3x-4x kuralını uygulayın. Ürünü toptancıdan 25 TL'ye alıp 100 TL'ye satamıyorsanız; aradaki komisyon, lojistik ve reklam masrafları kârınızı eritir.`,
    coverImage: 'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w750/2026/05/ilk_urun_arayislari.png',
    authorId: 'user_orhan',
    authorName: 'Orhan Balcı',
    authorAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200',
    categoryId: 'deneyimler',
    tags: ['ayna-ticaret', 'urun-arastirma', 'deneyimler'],
    createdAt: '2526-06-17T08:30:00Z',
    readTime: 4,
    status: 'Published',
    views: 0,
    likes: 0,
    seoTitle: 'İlk Ürün Arayışları ve Niş Keşfi | Orhan Balcı',
    seoDescription: 'Doğru e-ticaret ürünü seçimi, kargo kolaylığı, tekrar satın alma gücü ve yüksek kâr marjlı ürün seçme kuralları.'
  },
  {
    id: 'orhan_article_5',
    seriesId: 'series_orhan_ecommerce',
    title: 'B - Küçük Sermaye Hesapları',
    summary: 'BÖLÜM I — TİCARETİN İÇİNE GİRMEK | 1. Ne Satabiliriz? Excel tablolarında kuruşu kuruşuna hesaplanan ilk bütçeler ve kısıtlı kaynaklarla maksimum verim elde etme.',
    content: `### B - Küçük Sermaye Hesapları: Sınırlı Kaynakların Gücü

Bir e-ticaret işi kurmak için milyon dolarlık yatırımlara veya lüks ofislere ihtiyacınız yok. Çok büyük sermayelerle yola çıkıp ilk 6 ayda batan devasa girişimler görmüşken, küçük harçlıklarla, kısıtlı bütçelerle başlayıp devasa markalara dönüşen esnaflarla doludur piyasa. Sermayenin küçüklüğü, sizi yaratıcı olmaya zorlar.

#### O Meşhur Excel Tablosu

Sermayeniz kısıtlıysa hayatınızın merkezine o **kuruşu kuruşuna hesaplanmış Excel tablosunu** almak zorundasınız:
*   **Ürün Birim Geliş Maliyeti:** Fabrika veya toptancı çıkış fiyatı.
*   **İlk Ambalaj / Etiket:** Koli faturası, koli bandı, insert kağıdı, marka etiket girdileri.
*   **Lojistik Depolama:** Depoda ne kadar süre kalacağı ve bunun finansal yükü.
*   **Stopaj ve Muhasebe Giderleri:** Gizli vergi adımları.

#### Sınırlı Kaynakla Nasıl Başlanır?

1.  **Stoksuz (Pre-order) Testler:** Ürünü tonlarca üretmeden veya satın almadan önce, prototip görsellerini web sitenize yükleyip test reklamları çıkın. İnsanların satın alma niyetini ölçün.
2.  **Yalın Paketleme:** İlk etapta aşırı gösterişli, özel tasarım kutulara servet harcamayın. Temiz, dürüst, hasarsız ve yanında küçük, el yazısıyla yazılmış samimi bir notla paketlenmiş kutu, müşteride lüks bir kutudan çok daha iyi bir izlenim bırakır.
3.  **Trafik Üretimi:** Ücretli reklamlara (Meta/Google) para saçmak yerine, sosyal mecralarda (TikTok, Instagram Reels) organik dürüst hikaye anlatımıyla kitle biriktirin.`,
    coverImage: 'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w1200/2026/05/kucuk_sermaye_hesaplari_2000x1250-2.png',
    authorId: 'user_orhan',
    authorName: 'Orhan Balcı',
    authorAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200',
    categoryId: 'deneyimler',
    tags: ['ayna-ticaret', 'finans', 'butce'],
    createdAt: '2526-06-16T12:00:00Z',
    readTime: 4,
    status: 'Published',
    views: 0,
    likes: 0,
    seoTitle: 'Küçük Sermaye Hesapları ve Yalın Başlangıç | Orhan Balcı',
    seoDescription: 'Düşük sermaye ile e-ticaret markası kurmak, bütçe yönetimi, birikim havuzlama ve harcama optimizasyonu.'
  },
  {
    id: 'orhan_article_6',
    seriesId: 'series_orhan_ecommerce',
    title: 'C - Forumlarda Başlayan Ticaret Hayali',
    summary: 'BÖLÜM I — TİCARETİN İÇİNE GİRMEK | 1. Ne Satabiliriz? r10, w10 gibi nostaljik webmaster forumlarında açılan ilk satış konuları ve internetten para kazanmanın ilk kıvılcımları.',
    content: `### C - Forumlarda Başlayan Ticaret Hayali: Dijitalin Nostaljik Kökleri

Birçoğumuzun dijital ticaret serüveni modern e-ticaret altyapıları veya devasa pazaryerleriyle başlamadı. 2010'lu yılların başlarında webmasterların, dijital üreticilerin ve genç girişimcilerin buluşma noktası olan r10.net, w10.com.tr gibi efsane forum sitelerindeki "Alışveriş - Ticaret" kategorilerinde başladı her şey.

#### Forum Ticaretinin Dinamikleri

Forumlarda ticaret yapmak, şimdiki e-ticaretten çok farklı, inanılmaz derecede insaniydi:
*   **Samimiyet ve Referans:** Satış yapabilmek için önce saygınlığınızı, güvenilirliğinizi kanıtlamak zorundaydınız. "Referans" yorumları her şeydi.
*   **Dropshipping'in Ataları:** Toptancıların listelerini Excel'le foruma ekleyip, sipariş geldikçe "alıcı adresiyle" toptancıya havale geçip kargolattığımız o samimi dropshipping modelleri.
*   **Hızlı Döngü:** Bir akşam kafana esen bir fikri konulaştırıp, ertesi sabah r10 havalesiyle ilk ödemesini alabiliyordun.

#### O Günlerin Bize Öğrettiği 3 Büyük Ders

1.  **Güven Paradan Değerlidir:** Kimsenin kimseyi görmediği o forumlarda, tek bir yanlış hareket tüm itibarınızı sıfırlayabilirdi. Bu durum bize dijitalde güvenin en değerli para birimi olduğunu öğretti.
2.  **Yalın Teklif:** Gösterişli grafiklerden ziyade, net, dürüst ve problemi çözen bir satış konusunun (copywriting) gücünü orada keşfettik.
3.  **Müşteri Desteği:** Müşteri sizi doğrudan PM (Özel Mesaj) üzerinden darlayabiliyordu. Bu hızlı geri bildirim döngüsü, kusursuz müşteri deneyimi yönetimini öğreten en iyi okul oldu.`,
    coverImage: 'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w1200/2026/05/forumlar-2.png',
    authorId: 'user_orhan',
    authorName: 'Orhan Balcı',
    authorAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200',
    categoryId: 'deneyimler',
    tags: ['ayna-ticaret', 'forum', 'nostalji'],
    createdAt: '2526-06-15T15:00:00Z',
    readTime: 4,
    status: 'Published',
    views: 0,
    likes: 0,
    seoTitle: 'Webmaster Forumlarında Nostaljik Ticaret | Orhan Balcı',
    seoDescription: 'R10 ve W10 forumlarında atılan ilk ticaret adımları, dropshipping ve havale ticaretinin temelleri.'
  },
  {
    id: 'orhan_article_7',
    seriesId: 'series_orhan_ecommerce',
    title: 'D - İlk Tedarikçi Konuşmaları: Sırt Sıvazlayan Piyasa',
    summary: 'BÖLÜM I — TİCARETİN İÇİNE GİRMEK | 1. Ne Satabiliriz? Eminönü, Tahtakale ya da İSTOÇ sokaklarındaki kıdemli esnaflarla yapılan ilk pazarlıklar ve toptancı piyasasının sert gerçekleri.',
    content: `### D - İlk Tedarikçi Konuşmaları: Sırt Sıvazlayan Piyasa

Sermayeyi denkleştirdiniz, ürüne karar verdiniz ve şimdi sıra o ürünü fiziki olarak tedarik etmeye geldi. Bilgisayar karşısındaki o steril araştırmalardan çıkıp, Eminönü Tahtakale'nin dar hanlarına, İSTOÇ'un ambalaj kokulu koridorlarına adım attığınız yer burasıdır. Burası, teorinin bitip "gerçek hayatın" başladığı er meydanıdır.

#### "Halletçi" Kıdemli Esnaf Kafası

Genç, heyecanlı ve laptoplu bir girişimci olarak toptancı dükkanına girdiğinizde, esnaf sizi 10 saniyede tartar. "Bu çocuk yeni, heyecanlı, muhtemelen e-ticaret yapacak" der ve size o standart "sırt sıvazlayan" tebessümüyle yaklaşır:
> *"Ooo hoş geldin yeğenim, hallederiz, sen bize güven, piyasanın en iyi malı burada. Herkes bizden alır..."*

Bu uyarıların büyük çoğunluğu kötü niyetli değildir; esnafın size ticareti ve piyasayı test etme şeklidir. Ama iş fiyat almaya, teslimat sürelerini konuşmaya ve en önemlisi "kalite standartlarını" belirlemeye gelince işin rengi değişir:
*   Size verilen numune ile depodan sevk edilen koli içindeki ürünlerin kalitesi aynı olmayabilir.
*   "Yarın kargoda" dedikleri mal 10 gün sonra çıkabilir ve bu süreçte sizin tüm lansman planınız çökebilir.

#### Toptancılarla Konuşma Taktikleri

1.  **Çay İçmeyi Öğrenin:** Esnaflıkta acelecilik kaybettirir. Oturun, o tavşan kanı çayı için, esnafın hikayesini dinleyin, kendi derdinizi dürüstçe ama ezilmeden anlatın.
2.  **Ödeme Gücüyle Konuşun:** Vadeli almak için ısrar etmeyin. İlk etapta "nakit/havale" ödeme gücünüzü esnafa göstererek en dibi zorlayın.
3.  **Alternatifsiz Kalmayın:** Tek bir toptancıya göbekten bağlı kalmak en büyük risktir. En az 3 farklı tedarikçi ile iletişimde ve yedekli çalışın.

Sahanın esnaflık kuralları acımasızdır fakat o kuralları öğrendiğinizde, dijital dünyada kimsenin sizi kolay kolay sarsamayacağı bir operasyonel zırh kazanırsınız.`,
    coverImage: 'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w750/2026/05/ilk_tedarikci_konusmalari.png',
    authorId: 'user_orhan',
    authorName: 'Orhan Balcı',
    authorAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200',
    categoryId: 'deneyimler',
    tags: ['ayna-ticaret', 'tedarik', 'esnaf'],
    createdAt: '2526-06-14T10:00:00Z',
    readTime: 5,
    status: 'Published',
    views: 0,
    likes: 0,
    seoTitle: 'Tahtakale ve İSTOÇ Esnafıyla İlk Pazarlıklar | Orhan Balcı',
    seoDescription: 'Tedarik zinciri oluşturma, toptancılarla iletişim dili, numune alma ve kargo planlama pratikleri.'
  },
  {
    id: 'orhan_article_8',
    seriesId: 'series_orhan_ecommerce',
    title: 'E- “Acaba Bu İş Olur mu?” Hissi',
    summary: 'BÖLÜM I — TİCARETİN İÇİNE GİRMEK | 1. Ne Satabiliriz? İlk sipariş öncesi beynimizi kemiren o büyük korku, pazar doğrulama aşamaları ve şüpheyi aşma cesareti.',
    content: `### E- "Acaba Bu İş Olur mu?" Hissi: Şüphenin Panzehiri

E-Ticarette veya girişimcilikte en tehlikeli aşama "hazırlık" aşamasıdır. Çünkü hazırlık aşaması konforludur. Sürekli plan yaparsınız, logoyu değiştirirsiniz, sitenin yazı tiplerini güncellersiniz, bütçeyi revize edersiniz... Bunları yaparken kendinizi çalışıyor hissedersiniz ama aslında bilinmeyen bir pazara çıkıp ilk reddedilmeyi yaşamaktan kaçıyorsunuzdur.

#### İçimizdeki O Sinsi Şüphe

"Acaba bu ürün satılır mı?", "Ya kimse siteme gelmezse?", "Rakipler benden çok daha büyük, beni neden tercih etsinler?" gibi sorular normaldir ama sizi felç etmesine izin vermemelisiniz.

Bu sinsi şüpheyi aşmanın tek yolu **sağlam verilerle küçük doğrulamalar yapmaktır:**
*   **Fikir Doğrulama Kampanyaları:** Ürünü depolamadan, 500 liralık ufak bir Instagram reklamı açarak hedef kitlenizin ürününüze tıklayıp tıklamadığını (CTR) ve sepet sayfasına gidip gitmediğini hemen görün.
*   **Minimal Başlangıç:** "Her şey mükemmel olunca başlayacağım" demeyin. Siteniz %80 hazırsa ve ürününüz çalışıyorsa hemen o 'Yayınla' butonuna basın. Gerçek düzeltmeleri müşterilerden gelen şikayetlerle yapacaksınız.

#### Cesaret, Korkusuzluk Değildir

Girişimcilik korkusuz olmak değildir; korkuya rağmen o adımı atmak, belirsizliğin üzerine dürüstlükle ve inatla gitmektir. "Acaba bu iş olur mu?" sorusunun tek bir cevabı vardır: **O paket bandını çekip ilk kargoyu teslim ettiğinizde bunu kendi gözlerinizle göreceksiniz.**`,
    coverImage: 'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w1200/2026/05/acaba-2.png',
    authorId: 'user_orhan',
    authorName: 'Orhan Balcı',
    authorAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200',
    categoryId: 'deneyimler',
    tags: ['ayna-ticaret', 'psikoloji', 'dogrulama'],
    createdAt: '2526-06-13T16:30:00Z',
    readTime: 4,
    status: 'Published',
    views: 0,
    likes: 0,
    seoTitle: 'İlk Satış Öncesi Şüpheyi Aşma Rehberi | Orhan Balcı',
    seoDescription: 'Girişimcilikte pazar uyumu şüpheleri, hazırlık tuzağı ve test reklamlarıyla talep doğrulama taktikleri.'
  }
];

export const INITIAL_COMMENTS: Comment[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];

