# Klinik Proje Raporu Taslagi

## Kapsam ve Amac

Klinik, psikolojik danismanlik surecinde danisanlarin duygu gunlugu, seans hazirligi, nefes egzersizi ve randevu adimlarini takip etmesini saglayan AI destekli bir web uygulamasidir. Uygulama tani koymaz; sadece iyi olus ve seans hazirligi icin destekleyici oneriler sunar.

## Kullanilan Teknolojiler

- Front-end: React, Vite, CSS, lucide-react
- Back-end: Node.js, Express.js
- Veritabani: JSON dosya veritabani
- Kimlik dogrulama: JWT, bcrypt
- AI: Server-side HuggingFace Inference API entegrasyonu ve yerel fallback iyi olus planlayici

## Gereksinimler

- Kullanici kayit, giris ve cikis islemleri
- En az bir form validasyonu
- AI destekli iyi olus/seans hazirlik plani uretimi
- API'den beslenen dinamik dashboard
- En az uc REST endpoint
- Responsive ve erisilebilir arayuz

## Tasarim Kararlari

Uygulama ilk ekranda dogrudan giris/kayit akisina odaklanir. Giris sonrasi tek dashboard ekraninda ozet kartlari, grafik, tablo, danisan takip kayitlari ve AI iyi olus asistani yer alir. Bu yapi sunum videosunda tum zorunlu ozelliklerin hizli gosterilmesini kolaylastirir.

## Etik ve Guvenlik Siniri

Klinik, klinik tani, tedavi plani veya acil kriz mudahalesi sunmaz. AI ciktilari seans hazirligi, duygu farkindaligi, dusunce kaydi, nefes egzersizi ve oz bakim gibi dusuk riskli destek adimlariyla sinirlandirilmistir.

## Dashboard Veri Yapisi

Dashboard endpoint'i takip kayitlarindan toplam kayit sayisi, tamamlanan kayit sayisi, tamamlanma orani, toplam sure, destek alani bazli dagilim ve oncelik/risk bazli grafik verisini hesaplar. Veriler hardcoded degildir; kullanicinin olusturdugu kayitlardan turetilir.

## Web Gelistirme Yasam Dongusu

1. Gereksinim analizi: Ders dokumanindaki zorunlu maddeler incelendi.
2. Tasarim: Psikolog/danisan odakli takip + AI + dashboard akisi planlandi.
3. Gelistirme: React arayuz ve Express REST API gelistirildi.
4. Test: Register, login, takip kaydi, dashboard guncelleme ve AI plan uretme akislari kontrol edilir.
5. Deployment: Frontend Vercel/Netlify, backend Render/Railway, veri icin MongoDB Atlas yapisina tasinabilir.

## Kullanici Rehberi

1. Kullanicilar once kayit olur veya giris yapar.
2. Danisan takip alanindan duygu gunlugu, seans hazirligi veya randevu kaydi ekler.
3. Kayit tamamlandikca isaretler.
4. Dashboard kartlari, grafik ve tablo otomatik guncellenir.
5. AI iyi olus asistanina konu, destek seviyesi ve haftalik sure girilerek destek plani uretilir.
