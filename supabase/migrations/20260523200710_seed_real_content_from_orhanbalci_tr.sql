/*
  # Seed Real Content from orhanbalci.tr

  This migration replaces placeholder/demo content with the real published content
  from orhanbalci.tr (Ghost CMS), including:

  1. Clears old placeholder articles and series
  2. Inserts the real "Ayna Ticaret" series
  3. Inserts all 8 real published articles with full content, cover images, and correct dates
  4. Inserts site settings (about bio, og images, etc.)

  All cover images use the original Ghost CDN URLs from storage.ghost.io.
*/

-- ── Clear placeholder data ────────────────────────────────────────────────
DELETE FROM articles;
DELETE FROM series;

-- ── Series ────────────────────────────────────────────────────────────────
INSERT INTO series (id, title, tagline, description, concept_description, topics, article_count, og_image) VALUES
(
  'ayna-ticaret',
  'Ayna Ticaret',
  'Piyasanın Vitrinini Değil Arka Odasını Konuşuyoruz.',
  'Türkiye''de ticaretin dışarıdan görünen başarı hikâyeleriyle sahada yaşanan gerçek mücadele arasındaki farkı görünür kılmaya çalışan yazı dizisi.',
  'Ayna Ticaret, ticaretin vitrine yansıyan yüzüyle arka odada yaşanan gerçek arasındaki mesafeyi konuşur. Network, sermaye, tedarik, piyasa gerçekleri ve görünmeyen duvarlar.',
  ARRAY['Tedarik Zinciri', 'Küçük Sermaye', 'Piyasa Gerçekleri', 'Pazaryeri Ekonomisi', 'İlk Kuşak Girişimci', 'Operasyon'],
  7,
  'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w960/2026/05/ayna.png'
);

-- ── Articles ──────────────────────────────────────────────────────────────

-- 1. AYNA TİCARET'E DAİR (intro)
INSERT INTO articles (id, title, category, series_id, series_title, date, excerpt, reading_time, content, published, og_image) VALUES
(
  'ayna-ticaret',
  'AYNA TİCARET''E DAİR',
  'Ticaret',
  'ayna-ticaret',
  'Ayna Ticaret',
  '2026-05-10',
  'Piyasanın vitrinini değil arka odasını konuşuyoruz. Türkiye''de ticaretin görünmeyen taraflarına dair ilk yazı.',
  4,
  'Merhaba.

Uzun zamandır ticaretin içindeyim. E-ticaret yaptım, pazaryerlerinde satış yaptım, ürün bulmaya çalıştım, Çin''e gidip tedarikçilerle görüştüm, stok tuttum, reklam maliyetleriyle uğraştım, marka kurmaya çalıştım.

Dışarıdan bakınca ticaret bazen çok basit görünür.

Bir ürün bulursun. Üzerine kar koyarsun. Satarsın. Büyürsün.

Keşke bu kadar basit olsaydı!

Sahaya girince bambaşka bir dünya olduğunu görüyorsun.

Bazen doğru ürünü buluyorsun ama doğru tedarikçiye ulaşamıyorsun. Bazen satış yapıyorsun ama para içeride kalıyor. Bazen büyüyorsun gibi görünüyorsun ama nakit akışı seni sıkıştırıyor. Bazen de piyasa herkese açık gibi duruyor ama bazı kapıların aslında herkes için açılmadığını fark ediyorsun.

Bu yüzden bir yazı dizisine başlıyorum: **Ayna Ticaret**

Bu isim benim için şunu ifade ediyor: Ticaretin dışarıdan görünen yüzüyle, içeride yaşanan gerçek yüzü aynı değil. Vitrinde satış var, büyüme var, başarı hikayeleri var.

Ama arka tarafta başka şeyler var. Network var. Sermaye var. Tahsilat var. Güven var. Vadeler var. Pazaryeri komisyonları var. Reklam maliyetleri var. Yerleşik oyuncular var. Bir de yeni gelenlerin çarptığı görünmeyen duvarlar var.

Bu seride biraz bunları konuşmak istiyorum.

Türkiye''de ticaret yapmak isteyen bir insanın gerçekten neyle karşılaştığını, yeni bir işe başlarken hangi engelleri gördüğünü, networkün neden bu kadar önemli hale geldiğini, sermayesi ve çevresi olmayan insanların neden daha zor başladığını yazmak istiyorum.

Bunu şikayet etmek için yazmıyorum.

Daha çok, konuşulmadığı için normalleşen şeyleri görünür kılmak için yazıyorum.

Çünkü bazen bir insanın önündeki engel tembellik değildir. Bazen bilgisizlik de değildir. Bazen sadece yanlış kapının önünde yıllarca beklemesidir.

Ayna Ticaret''te piyasanın vitrinini değil, biraz da arka odasını konuşacağız.

Bu ilk yazı olsun.

Devamında Türkiye''de ticaretin görünmeyen taraflarını tek tek açacağım.',
  true,
  'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w960/2026/05/ayna.png'
);

-- 2. ÖNSÖZ - AYNA TİCARET
INSERT INTO articles (id, title, category, series_id, series_title, date, excerpt, reading_time, content, published, og_image) VALUES
(
  'onsoz-ayna-ticaret',
  'ÖNSÖZ - AYNA TİCARET',
  'Ticaret',
  'ayna-ticaret',
  'Ayna Ticaret',
  '2026-05-14',
  'Sadece başarılı anlar için değil, zarar edilen geceler için de. Sadece kazananlar için değil, yeniden ayağa kalkmaya çalışanlar için de.',
  5,
  'Bazı insanlar ticareti yalnızca para sanır. Tablolardan, cirolardan, kargo kutularından, mağaza tabelalarından ibaret bir dünya gibi görürler.

Oysa ticaret çoğu zaman görünenden çok daha fazlasıdır.

Bir gecede değişen kurdur. Limanda bekleyen konteynerdir. Maaş günü yaklaşırken sessizleşen bir ofistir. Gece yarısı gelen bir telefon, aniden değişen bir fiyat listesi ya da depoda aylarca bekleyen yanlış bir üründür.

Dışarıdan bakıldığında her şey büyüyor gibi görünür. Yeni ofisler açılır. Depolar dolar. Sipariş sesleri artar. Sosyal medyada başarı hikayeleri paylaşılır.

Ama görünmeyen başka bir taraf daha vardır. Kimsenin anlatmadığı taraf.

Korkular. Yorgunluk. Kararsızlık. Yanlış hamleler. Sessiz kaygılar. Ve çoğu zaman kimseye anlatılamayan bir yalnızlık.

Bu yazı dizisi, ticaretin o görünmeyen tarafı için yazıldı.

Sadece başarılı anlar için değil, zarar edilen geceler için de. Sadece kazananlar için değil, yeniden ayağa kalkmaya çalışanlar için de. Burada okuyacağınız birçok şey, kitaplardan öğrenilmiş teoriler değil. Yaşanmış şeyler.

Beklenmiş telefonlar. Kaçırılmış fırsatlar. Yanlış kararlar. Kur farkları. İade yükleri. Stok hataları. İnsan ilişkileri. Ve bazen insanın kendisiyle yaptığı sessiz savaşlar.

Türkiye''de ticaret yapmak çoğu zaman yalnızca ürün satmak değildir. Bir sistemin içinde ayakta kalmaya çalışmaktır. Bazen görünmeyen duvarlarla, bazen müesses nizamla, bazen sermaye ile, bazen de insanın kendi korkularıyla mücadele etmektir.

Bu yüzden "Ayna Ticaret" bir başarı hikayesi değildir. Bir motivasyon serisi de değildir. Bu yazı dizisi, ticaretin aynasına bakmaya çalışan insanlar için yazıldı.

Belki hala yolun başında olanlar için. Belki yıllardır bu sistemin içinde yorulanlar için. Belki de gecenin bir yarısı telefon ekranındaki kur tablosuna bakıp aynı soruyu düşünenler için:

**"Gerçekten neyin içindeyim?"**',
  true,
  'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w960/2026/05/onsoz-1.png'
);

-- 3. A - İlk Ürün Arayışları
INSERT INTO articles (id, title, category, series_id, series_title, date, excerpt, reading_time, content, published, og_image) VALUES
(
  'ayna-ticaret-ilk-urun-arayislari',
  'A- İlk Ürün Arayışları',
  'Ticaret',
  'ayna-ticaret',
  'Ayna Ticaret',
  '2026-05-15',
  'BÖLÜM I — TİCARETİN İÇİNE GİRMEK | 1. Ne Satabiliriz? İlk toplantımızı üç arkadaş yaptıktan sonra aklımızda beliren soru "ne satabiliriz" olmuştu.',
  7,
  '## BÖLÜM I — TİCARETİN İÇİNE GİRMEK
### 1. Ne Satabiliriz?

İlk toplantımızı üç arkadaş yaptıktan sonra aklımızda beliren soru "ne satabiliriz" olmuştu.

Ticaret benim için yeni bir şey değildi. Bu zamana kadar birçok firmada çalışmış, e-ticaretin ve satışın içinde bulunmuştum. Ürün satmayı biliyordum. Sistem görmüştüm. Pazaryerlerini biliyordum. Reklamı, operasyonu, müşteri tarafını görmüştüm.

Ama bütün bunların dışında bambaşka bir dünya daha vardı: **Kendi ürününü bulmak.**

İşte gerçek ticaret biraz orada başlıyordu.

Çünkü hazır kurulmuş şirketlerde çalışırken, aslında oturmuş düzenlerin içinde ürün satıyorduk. Ürün belliydi. Tedarik belliydi. Sistem belliydi. Risk çoğu zaman şirketindi.

Ama şimdi masanın diğer tarafındaydık.

Biz de araştırmaya başladık. Çin''den numune ürünler getirttik. Merter''i dolaştık. Güngören''i dolaştık. Tahtakale''yi gezdik. Kapalıçarşı''yı gezdik. Mahmutpaşa''yı gezdik. İstoç''u dolaştık. Bazen sabahtan akşama kadar dükkan dükkan gezdiğimizi hatırlıyorum. Hatta bir hafta boyunca bacak ağrısından doğru düzgün uyuyamadığımı bugün bile net hatırlıyorum.

Merter''de girdiğimiz birçok üretici ve toptancı gerçekten yılmış görünüyordu. Birçoğu artık eski düzenin kalmadığını söylüyordu. Özellikle dijital pazaryerlerinin büyümesiyle birlikte sektör dengelerinin tamamen değiştiğine inanıyorlardı.

Pandemi sonrası süreç özellikle tekstil tarafında birçok şeyi değiştirmişti. İşler durmuştu. Üreticiler zorlanmıştı. Toptancılar sıkışmıştı. Ve sonunda birçok kişi çareyi doğrudan internette kendi satışını yapmakta bulmuştu.

Birçok üretici artık yalnızca kendi markasını satmıyordu. Aynı zamanda büyük pazaryeri sistemlerine de üretim yapıyordu. Yani bir tarafta kendi mağazasında satış yapıyor, diğer tarafta platform ekonomisinin parçası haline geliyordu.

Eğer hali hazırda kurulmuş bir tezgahınız yoksa, bir üretim gücünüz yoksa, veya güçlü bir çevreniz yoksa, ticarete sıfırdan girmek artık eskisine göre çok daha zordu.

Bir kez o dünyanın içine girmeye başlayınca, çıkması zor oluyor. Sürekli yeni fikirler görüyorsun. Sürekli yeni ihtimaller düşünüyorsun. Ve zihninin bir köşesinde hep aynı soru dönmeye devam ediyor.',
  true,
  'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w960/2026/05/ilk_urun_arayislari.png'
);

-- 4. B - Küçük Sermaye Hesapları
INSERT INTO articles (id, title, category, series_id, series_title, date, excerpt, reading_time, content, published, og_image) VALUES
(
  'b-kucuk-sermaye-hesaplari',
  'B- Küçük Sermaye Hesapları',
  'Ticaret',
  'ayna-ticaret',
  'Ayna Ticaret',
  '2026-05-17',
  'BÖLÜM I — TİCARETİN İÇİNE GİRMEK | 1. Ne Satabiliriz? Asıl mesele yanlış ürünü bulmak değil, yanlış ürüne fazla para bağlamaktı.',
  7,
  '## BÖLÜM I — TİCARETİN İÇİNE GİRMEK
### 1. Ne Satabiliriz?

İnsan ticarete ilk başladığında en büyük korkunun yanlış ürün seçmek olduğunu düşünüyor. Elbette bizde de aynı soru vardı: "Ya satılmazsa?" "Ya doğru ürün değilse?"

Ama süreç ilerledikçe şunu fark etmeye başladık: Asıl mesele yanlış ürünü bulmak değil, yanlış ürüne fazla para bağlamaktı.

Çünkü küçük sermayeyle ticaret yapmak aslında sürekli risk yönetmek anlamına geliyor. Büyük oyuncular gibi tek hamlede yüksek adetli ürünlere giremiyorsunuz. Her kararın bir ağırlığı oluyor. Bu yüzden en başından itibaren büyük yatırımlar yerine küçük testlerle ilerlemeye karar verdik.

Mantığımız basitti: Aslında yaptığımız şey ürün satmaktan çok piyasa okumaktı.

Çünkü başlangıç aşamasında insanın en büyük avantajı büyük sermaye değil, hareket kabiliyeti oluyor. Yanlış ürüne yüksek para bağlamak bazen daha en başında oyunun dışına düşmek anlamına gelebiliyor.

O dönem hayatımızın merkezinde sürekli hesap yapmak vardı. Excel dosyaları… Defterler… Notlar… Karalamalar…

Bugün dönüp baktığımda birçok küçük ve orta ölçekli şirketin görünmeyen omurgasının Excel olduğunu düşünüyorum. Bizim de her şeyimiz oradaydı.

Başlangıçta maliyet dediğimiz şeyin yalnızca ürünü satın almak olduğunu sanıyorduk. Oysa pazaryerleriyle tanışınca işin gerçek yüzü ortaya çıkmaya başladı. Çünkü ürünün yalnızca alış maliyeti yoktu. Bir de satış maliyeti vardı.

İlk büyük şokumuz özellikle komisyon oranları ve kargo maliyetleri olmuştu. Çünkü dışarıdan bakıldığında ticaret çok düz bir denklem gibi görünüyor: "Ucuza al, pahalıya sat." Ama gerçek hayat öyle çalışmıyor.

Başlangıç aşamasında önceliğimiz aslında çok netti: Önce ürün tedarik etmeyi öğrenmek. Sonra sistemi kurmak. Ardından küçük reklam bütçeleriyle ürünleri test etmek.

Çünkü küçük sermayeyle ticaret yaparken bütün parayı tek noktaya bağlayamazsınız. Sermayeyi bölmeniz gerekir. Bir kısmı ürüne gider. Bir kısmı reklama. Bir kısmı sistemin ayakta kalmasına.

Zamanla başka bir tehlike ortaya çıkıyor: Aynı anda çok fazla ürünü test etmek. İşte o noktada küçük küçük riskler birleşip büyük bir yük oluşturmaya başlıyor.

Çevrede ise her zaman konuşan insanlar oluyor: "Bu iş olmaz." "Paranızı batırırsınız." "Bu piyasa bitti."

Bir süre sonra şunu öğreniyorsunuz: Eğer bir eleştiri sizi geliştirmiyorsa, yalnızca moralinizi düşürüyorsa bazı sesleri filtrelemek gerekiyor. Çünkü ticaret biraz da psikolojik dayanıklılık işi.

Biz para kaybetmeyi göze alıyorduk. Ama zamanla başka bir baskının da ağırlaştığını hissetmeye başladık: **Fırsat kaçırma hissi.**

Fırsatları değerlendirmekle fırsatçılık arasındaki çizgi bazen düşündüğünüzden çok daha ince olabiliyor.

Ama bütün bu sürecin içinde benim en çok korktuğum şey aslında para kaybetmek değildi. Yanlış ürün almak da değildi. **Hiçbir şey öğrenememekti.**

Çünkü ticarette bazen zarar edersiniz. Yanlış ürün alırsınız. Yanlış insanlarla çalışırsınız. Yanlış kararlar verirsiniz. Ama yaşadığınız her şey size yeni bir şey öğretiyorsa, o zaman tamamen kaybetmiş sayılmazsınız.',
  true,
  'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w960/2026/05/kucuk_sermaye_hesaplari_2000x1250.png'
);

-- 5. E-Ticaret İade Ekonomisi (Operasyon tag - standalone)
INSERT INTO articles (id, title, category, series_id, series_title, date, excerpt, reading_time, content, published, og_image) VALUES
(
  'e-ticaret-iade-ekonomisi',
  'E-Ticaret İade Ekonomisi',
  'E-Ticaret',
  NULL,
  NULL,
  '2026-05-18',
  'Türkiye''de e-ticaretin görünmeyen bir ekonomisi daha vardır. Reklam panellerinde görünmez, başarı hikayelerinde anlatılmaz. Ama binlerce depo rafında sessizce büyür.',
  8,
  '## Türkiye''de E-Ticaretin Görünmeyen Operasyon Gerçeği

Türkiye''de e-ticaretin görünmeyen bir ekonomisi daha vardır. Bu ekonomi reklam panellerinde görünmez. Başarı hikayelerinde anlatılmaz. Marketplace sunumlarında pek konuşulmaz. Ama binlerce depo rafında sessizce büyür.

**İade ekonomisi.**

Bugün birçok müşteri için internetten alışveriş yapmak artık neredeyse risksiz bir davranış haline geldi. "Alırım. Beğenmezsem iade ederim."

Aslında sistem tam olarak bunu söylüyor. Müşteri tarafında bakıldığında bu son derece konforlu bir deneyim. Dürüst olmak gerekirse, modern e-ticaret zaten biraz da bunun üzerine kuruldu. Çünkü müşteri ne kadar az risk hissederse, satın alma ihtimali o kadar artıyor. Marketplace''ler de tam olarak bunu istiyor.

Müşteri platformdan korkmadan alışveriş yapsın. Sipariş versin. Kararsız kalmasın. Sepeti terk etmesin.

Bu yüzden pazaryeri tarafında bakış açısı genellikle şöyledir: "Müşteri iade etmek istiyorsa süreç kolay olmalı." Çünkü platform açısından önemli olan şey çoğu zaman: Bir marketplace için kolay iade, çoğu zaman daha fazla sipariş demektir.

Fakat işin görünmeyen tarafı tam burada başlıyor. Çünkü o ürün bir yere geri dönüyor. Ve çoğu zaman o "bir yer" gerçek satıcının deposu oluyor.

## Gerçek Satıcının Dünyası

Bir müşteri için iade sadece birkaç tıklama olabilir. Fakat satıcı tarafında süreç bazen yeni başlıyor. Çünkü gelen ürün artık sıfır olmayabiliyor. Kutusu açılmış oluyor. Ambalajı zarar görebiliyor. Koruma jelatini sökülmüş oluyor. Aksesuar eksik çıkabiliyor. Kablo yanlış sarılmış olabiliyor. Ürün çalışıyor mu diye yeniden test edilmesi gerekebiliyor.

Ve bazen ürün teknik olarak çalışsa bile, müşteri artık onu "sıfır ürün" gibi görmek istemiyor.

İşte tam burada görünmeyen operasyon maliyetleri ortaya çıkıyor. Satıcı için bu süreç muayene, yeniden paketleme, fotoğraf, relisting, depolama ve zaman maliyeti anlamına geliyor.

Bazı ürünlerde kar marjı zaten oldukça düşük. Özellikle elektronik, aksesuar, hazır giyim gibi kategorilerde birkaç problemli iade bile ay sonu karlılığını ciddi şekilde etkileyebiliyor.

## Pazaryerine Fatura Etme Gerçeği

Birçok satıcı, yeniden satılması zor hale gelen ürünleri pazaryerine fatura etmeye çalışıyor. Fakat burada da süreç başlıyor: Ürün gerçekten müşteri kaynaklı mı zarar gördü? Yoksa tekrar satılabilir durumda mı? Marketplace bunu kabul edecek mi?

Bu noktada satıcı ile platform arasında görünmeyen bir gerilim oluşuyor. Eğer ürün pazaryeri tarafından kabul edilmezse, zararın büyük bölümü satıcının üzerinde kalabiliyor.

## Görünmeyen İkinci El Ekonomisi

Çünkü bazı ürünler artık yeniden normal şekilde satılamayacak hale geliyor. Marketplace tarafında kabul edilen, yeniden standart müşteri deneyimiyle satılması zor görülen ürünler bazen ayrı depolarda birikiyor. Sonrasında ise bu ürünler zamanla "gümrük malları mağazaları" benzeri offline kanallara dağılıyor.

Böylece e-ticaretin görünmeyen ikinci el ekonomisi oluşuyor.

## Satış Yapmak Başka, Sürdürülebilir Kar Başka

Bugün birçok marka satış rakamlarına odaklanıyor. Fakat e-ticarette gerçek soru çoğu zaman şu oluyor: "Gerçekten kar ediyor muyuz?"

Çünkü yüksek ciro, yüksek operasyon yüküyle birleştiğinde arka tarafta sessiz bir zarar düzeni oluşabiliyor.

Bu yüzden bugün birçok marka için mesele sadece ürün satmak değil. Satılan ürün geri döndüğünde de sistemi ayakta tutabilmek. Belki de bu yüzden birçok marka bir noktadan sonra şunu fark ediyor:

Marketplace müşteri getirir. Ama uzun vadede markayı ayakta tutan şey, kendi müşterin olur.

**Pazaryeri satış kanalıdır. Kaderiniz olmamalı.**',
  true,
  'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w960/2026/05/iadeekonomisi.png'
);

-- 6. C - Forumlarda Başlayan Ticaret Hayali
INSERT INTO articles (id, title, category, series_id, series_title, date, excerpt, reading_time, content, published, og_image) VALUES
(
  'c-forumlarda-baslayan-ticaret-hayali',
  'C- Forumlarda Başlayan Ticaret Hayali',
  'Ticaret',
  'ayna-ticaret',
  'Ayna Ticaret',
  '2026-05-19',
  'BÖLÜM I — TİCARETİN İÇİNE GİRMEK | 1. Ne Satabiliriz? Araştırmak ticaret değildir. Forumlar yol gösterir ama yolun çamurunu sadece yürüyen bilir.',
  8,
  '## BÖLÜM I — TİCARETİN İÇİNE GİRMEK
### 1. Ne Satabiliriz?

Ticaret hayali çoğu insan için bir forumda başlar.

Belki gece geç saatlerde bir ekrana bakılırken, belki bir arkadaşın "ben şunu sattım, iyi kazandım" mesajından sonra, belki de sadece aklın bir yerinde uzun süredir saklı duran bir merakın uyandığı anda.

### İnternetin Dağınık Ticaret Hafızası

Forumlar, ticaret dünyasına ilk adım atmak isteyenler için görünürde çok zengin bir bilgi kaynağıdır. Yıllara dayanan deneyimler, ürün tavsiyeleri, tedarikçi isimleri, başarı hikayeleri, başarısızlık itirafları.

Ama bu bilginin büyük bir sorunu var: Bağlamı yoktur.

Birinin üç yıl önce yazdığı "bu üründen iyi para kazandım" yorumu bugün hâlâ orada duruyor. Piyasa değişmiş. Rakip sayısı artmış. Maliyet yapısı farklılaşmış. Ama o yorum duruyor. Ve yeni başlayan biri o yorumu okuyunca "bu işi yaparım" diye düşünüyor.

### Herkes Kendi Şartlarından Konuşur

Forumda başarı hikayesi paylaşan biri, kendi şartlarından konuşur. Belki o kişinin deposu vardı. Belki tedarikçisiyle özel bir ilişkisi vardı. Belki ilk dönemde rakip azdı. Belki babası o sektördeydi.

Bunların hiçbirini yazmaz. Sadece "şunu yaptım, şu kadar kazandım" yazar.

Ve okuyan kişi, aynı şeyi yapabileceğini düşünür. Oysa aynı adımları atsa bile sonuç aynı olmayabilir. Çünkü bağlam farklıdır.

### Çok Satan Ürün Yanılgısı

Forumların en yaygın tuzaklarından biri "çok satan ürün" arayışıdır.

İnsan sürekli şunu arar: "Hangi ürünü satsam iyi kazanırım?"

Bu soru yanlış değil. Ama yanıtı aramak için sadece forumlara bakmak yanıltıcıdır. Çünkü forumda paylaşılan bilgi çoğunlukla gecikmeli bilgidir. Bir ürün gerçekten çok satıyorsa, o bilgi foruma düştüğünde artık o ürünün cazip döneminin geçmiş olma ihtimali yüksektir.

### Araştırmanın Verdiği Sahte Güven

Araştırma yapmak kendine güven verir. Bu güven bazen gerçek, bazen sahte olur.

Gerçek güven; riski gördüğünde yine de ilerleme kararı verebilmekten gelir. Sahte güven ise; her şeyi anlamış gibi hissetmekten, ama aslında hiçbir şeyi test etmemiş olmaktan kaynaklanır.

Forum okuyan biri çoğu zaman ikincisini yaşar. Yeterince araştırdım, artık hazırım hissine kapılır. Ama o "hazırlık" kağıt üzerindedir.

### Forumlar Kötü Değil, Ama Tek Başına Yeterli Değil

Forumlarda gerçekten değerli bilgiler var. Özellikle operasyona dair bilgiler, kargo süreçleri, platform kuralları, vergi ve muhasebe konularında çok işe yarayan paylaşımlar bulabilirsiniz.

Ama ticari karar vermek için forum yeterli değildir. Forum bir başlangıç noktasıdır. Sizi düşündürür, soru sordurur, farkındalık yaratır. Ama piyasayı size öğretemez.

### Küçük Test Gerçek Güveni Başlatır

Forumda değil, sahada öğrenilir.

Küçük bir miktar para koyup ilk ürünü aldığınızda, ilk kargonuzu gönderdiğinizde, ilk müşteri sorusuna yanıt verdiğinizde öğrenmeye başlarsınız. Bu öğrenme hiçbir forum yazısının veremeyeceği bir şeydir.

### Araştırma Ticaretin Kendisi Değildir

Bu yazıyı bitirirken şunu söylemek istiyorum: Araştırmak, ticaret değildir.

Forumlar yol gösterir. Ama yolun çamurunu, kokusunu ve ağırlığını sadece yürüyen bilir.',
  true,
  'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w960/2026/05/forumlar.png'
);

-- 7. D - İlk Tedarikçi Konuşmaları
INSERT INTO articles (id, title, category, series_id, series_title, date, excerpt, reading_time, content, published, og_image) VALUES
(
  'd-ilk-tedarikci-konusmalari',
  'D- İlk Tedarikçi Konuşmaları: Sırt Sıvazlayan Piyasa',
  'Ticaret',
  'ayna-ticaret',
  'Ayna Ticaret',
  '2026-05-21',
  'BÖLÜM I — TİCARETİN İÇİNE GİRMEK | 1. Ne Satabiliriz? Bazıları sadece kendi elindeki riski size devretmek için sırtınızı sıvazlar.',
  9,
  '## BÖLÜM I — TİCARETİN İÇİNE GİRMEK
### 1. Ne Satabiliriz?

Ticaretin ilk kapılarından biri tedarikçi görüşmeleridir.

Bu görüşmeleri hayal etmek kolaydır: Karşınızda size doğru fiyat veren, güvenilir bir tedarikçi. Siz de ürünü alıp satıyorsunuz. İş başlıyor.

Ama gerçek piyasada bu süreç çok daha karmaşıktır.

İstanbul''un tekstil ve toptan ticaret merkezlerini dolaştığımızda, yaklaşık elli firma ve yüzlerce insanla yüz yüze görüştüm. Her görüşmede öğrendiğim bir şey oldu. Ama öğrendiklerimin büyük bölümü beklediğim türde değildi.

### Sırt Sıvazlayan Piyasa

Piyasada size güzel konuşan çok insan vardır. "Bu ürün çok satıyor." "Sizi düşündüm, bu fiyatı size özel verdim." "Bu sektörün geleceği sizin gibi gençlerde." "Beraber büyürüz."

Bu cümleler bazen samimi olabilir. Ama çoğu zaman bir şeyin işareti olur: Karşınızdaki kişi size bir şey satmak istiyor. Ve bunu yaparken size iyi hissettirmek, en etkili yoldur.

Sırt sıvazlamak, satış tekniğinin en eski yöntemlerinden biridir. İnsan iyi hissedince soru sormayı unutur. Rakamları daha az inceler. Riski daha az düşünür.

### Toptan Fiyat Yanılgısı

En büyük sürprizlerden biri fiyat yapısıyla ilgili oldu.

Bir üründe "toptan" veya "B2B" fiyatı aldığınızda, bunun piyasada gerçekten avantajlı olduğunu varsayarsınız. Ama bazı ürünlerde o "toptan fiyat", büyük pazaryerlerindeki perakende fiyatıyla neredeyse aynı çıkıyordu. Bazen daha pahalıydı.

Bunu görünce insanın aklında şu soru beliriyor: "Bu fiyatla ben nasıl satacağım?"

### Risk Devri Zinciri

Türkiye''de ticaret zincirinin işleyişi şöyle özetlenebilir:

Üretici → Toptancı → Bayi → Pazaryeri Satıcısı → Müşteri

Her halka, riski bir sonraki halkaya devretmeye çalışır. Stok riski, talep riski, fiyat riski.

Zincirin sonundaki satıcı, yani pazaryerinde satan küçük girişimci, bu risklerin büyük bölümünü taşır. Ama komisyonun, iadelerinin ve reklamın maliyetini de üstlenir.

### Dürüst Tedarikçi

Her görüşme olumsuz değildi. Bazı tedarikçiler çok dürüsttü. "Bu ürün şu dönem çok gelmez." "Bu kategoride rekabet çok arttı." "Sizin için daha iyi bir ürün şu olabilir."

Bu konuşmalar değerliydi. Çünkü dürüst tedarikçi, size sadece ürün göstermez. Riski de gösterir.

**Bazıları sadece kendi elindeki riski size devretmek için sırtınızı sıvazlar.**

Bu cümleyi o dönemde öğrendim. Ve o günden beri aklımın bir köşesinde duruyor.',
  true,
  'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w960/2026/05/ilk_tedarikci_konusmalari.png'
);

-- 8. E - "Acaba Bu İş Olur mu?" Hissi
INSERT INTO articles (id, title, category, series_id, series_title, date, excerpt, reading_time, content, published, og_image) VALUES
(
  'e-acaba-bu-is-olur-mu-hissi',
  'E- "Acaba Bu İş Olur mu?" Hissi',
  'Ticaret',
  'ayna-ticaret',
  'Ayna Ticaret',
  '2026-05-23',
  'BÖLÜM I — TİCARETİN İÇİNE GİRMEK | 1. Ne Satabiliriz? Korku ile panik aynı şey değildir. Korku sorar, panik dondurur.',
  8,
  '## BÖLÜM I — TİCARETİN İÇİNE GİRMEK
### 1. Ne Satabiliriz?

Bir noktada araştırma biter. Hesaplar biter. Forum okuma biter. Tedarikçi görüşmeleri biter.

Ve geriye tek bir şey kalır: Karar.

### Hayalden Ürüne Geçiş Anı

Ticaret hayali kurmak ile gerçekten ticaret yapmak arasında çok net bir sınır vardır. Bu sınır, ilk kez gerçek para harcadığınız andır.

O ana kadar her şey teoriktir. Risk yoktur. Hata yoktur. Yanlış karar yoktur. Çünkü henüz hiçbir şey olmamıştır.

Ama o an geldiğinde, insan gerçekten sorgulamaya başlar: **"Acaba bu iş olur mu?"**

### Tedarikçi Konuşması İnsanı Ayıltır

Tedarikçilerle gerçek görüşmeler yaptıktan sonra, o "heyecanlı ticaret hayali" biraz daha gerçekçi bir zemine oturur.

Rakamlar konuşulunca bazı şeyler netleşir. Maliyet yapısı ortaya çıkar. Rekabet görünür hale gelir. Ve o noktada insan şunu sormaya başlar: "Gerçekten kazanabilir miyim? Yoksa sadece heyecanla mı ilerliyorum?"

### Korku ile Panik Aynı Şey Değildir

Bu süreçte en önemli ayrımlardan biri şudur: Korku ile panik aynı şey değildir.

**Korku sorar.** "Bunu yapabilir miyim? Riskler neler? Hazır mıyım?"

**Panik dondurur.** "Olmaz. Yapamazsın. Her şey çok zor."

Korku sağlıklıdır. Doğru soruları sordurur. Ama panik, insanı hiçbir şey yapmadan bekletir.

### Küçük Sermayenin Baskısı Daha Ağırdır

Büyük sermayeyle ticaret yapan biri, yanlış bir kararda fazla hissetmeyebilir. Ama küçük sermayeyle başlayan biri için her karar ağır gelir.

Çünkü kaybedecek fazla marjın yoktur. Her hata, bir daha denemek için gereken zamanı ve kaynağı tüketir.

### "Az Alayım, Denerim" İllüzyonu

Bir noktada çok yaygın bir düşünce beliriyor: "Az alayım, denerim. Olmadı bırakırım."

Bu düşünce mantıklı görünür. Ama pratikte şöyle bir tuzak var: "Az almak" birçok tedarikçide seçenek değildir. Minimum sipariş miktarları vardır. Ve o miktarlar, küçük sermaye için hiç de küçük değildir.

### Bu Eşik Geçilmeden Ticaret Başlamaz

Sonuç olarak şunu söyleyebilirim: "Acaba bu iş olur mu?" sorusu, hiçbir zaman tamamen yanıtsız kalmaz. Ama o soruyu geçmenin tek yolu, bir noktada adım atmaktır.

Bir noktadan sonra para hesaptan çıkar. EFT tuşuna basılır. Ürün yola çıkar. Ve insan o gece yastığa başını koyduğunda, artık hevesli bir araştırmacı değil, bedel ödemeyi göze almış bir tüccar adayıdır.

*Sıradaki: İlk Risk Alma Anı.*',
  true,
  'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w960/2026/05/acaba.png'
);

-- ── Site settings ─────────────────────────────────────────────────────────
INSERT INTO site_settings (key, value) VALUES
  ('about_bio', 'Ticaretin, teknolojinin ve insanın kesişiminde üretmeye çalışan bir girişimciyim. Uzun yıllardır e-ticaret, marka yönetimi, teknoloji ve dijital sistemler üzerine çalışıyor; aynı zamanda üretimin görünen tarafının arkasındaki gerçek hikayeleri gözlemlemeye çalışıyorum.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

INSERT INTO site_settings (key, value) VALUES
  ('author_photo', 'https://storage.ghost.io/c/98/64/986429dc-4a14-4897-bb6a-304ded3cc163/content/images/size/w150/2026/05/ob.png')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
