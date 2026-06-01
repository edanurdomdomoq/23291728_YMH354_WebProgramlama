# SİBEL DOMDOMOĞULLARI

YMH354 Web Tasarim ve Programlama final projesi icin hazirlanmis React + Express tabanli AI destekli psikolog/danisan takip web uygulamasi.

Proje fikri: Ziyaretciler profesyonel psikolog web sitesinde hizmetleri, blog yazilarini ve hakkimda alanini inceler; randevu basvurusu birakir. Psikolog/admin ise korumali Klinik Pro paneline girerek basvurulari, seans takvimini, blog yonetimini ve AI destekli seans hazirlik notlarini yonetir.

## Hizli Sunum Ozeti

- Frontend React ile yazildi. Public web sitesi ve korumali admin paneli `client/src/main.jsx` ve `client/src/styles.css` icindedir.
- Backend Express.js ile yazildi. REST endpointleri `server/src/routes` klasorundedir.
- Kullanici girisi JWT ile korunur. Token uretimi `server/src/routes/auth.js`, token kontrolu `server/src/middleware/auth.js` dosyasindadir.
- AI ozelligi frontend'den direkt cagrilmaz. Frontend sadece `/api/ai/study-plan` endpointine istek atar; AI islemi backend tarafindaki `server/src/services/aiService.js` dosyasinda yapilir.
- Dashboard verileri hardcoded degildir. `server/src/routes/dashboard.js`, randevu basvurulari ve danisan takip kayitlarindan istatistikleri anlik hesaplar.
- Veritabani olarak kolay kurulum icin JSON dosyasi kullanilmistir: `server/data/db.json`. MongoDB'ye tasimak icin bu katman degistirilebilir.

## Ders Gereksinimi Karsiligi

| Gereksinim | Projedeki Karsiligi |
| --- | --- |
| React kullanimi | `client` klasoru Vite + React uygulamasidir. |
| Register / login / logout | `AuthScreen`, `/api/auth/register`, `/api/auth/login` |
| Form validasyonu | Frontend validasyonu `AuthScreen` ve `TaskManager`; backend validasyonu auth/task/AI route dosyalarinda |
| AI entegrasyonu | `/api/ai/study-plan` endpointi, `aiService.js` |
| Server-side AI cagrisi | AI islemi backend servisinde yapilir; frontend API anahtari gormez. |
| Dinamik dashboard | `/api/dashboard` endpointi danisan takip kayitlarindan istatistik uretir. |
| Grafik veya tablo | React dashboard bolumunde risk/oncelik grafigi ve destek alanlari tablosu vardir. |
| REST API | Auth, tasks, dashboard, AI ve health endpointleri |
| Veritabani | JSON dosya veritabani: `server/data/db.json` |
| Responsive tasarim | `client/src/styles.css` icindeki media query kurallari |

## Kurulum

```bash
npm run install:all
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:5000`

## Klasor Yapisi

```text
YMH354-AI-StudyHub/
  client/                 React frontend
    src/main.jsx          Sayfalar, state yonetimi, API cagrilari
    src/styles.css        Responsive tasarim ve gorsel stil
  server/                 Express backend
    src/index.js          API baslangic dosyasi
    src/routes/           REST endpointleri
    src/middleware/       JWT kontrol katmani
    src/services/         Veritabani ve AI servisleri
    data/db.json          JSON veritabani
  docs/                   Sunum, rapor ve API notlari
```

## Uygulama Bolumleri

- Public site: Anasayfa, hizmetler, hakkimda, blog onizleme, danisan yorumlari, randevu formu
- Klinik Pro: JWT ile korunan admin paneli
- Admin dashboard: Toplam danisan, gunun seanslari, bekleyen basvuru, hizmet dagilimi
- Basvuru yonetimi: Randevu basvurularini onaylama veya reddetme, mail loguna bildirim dusurme
- Seans takvimi: Gune tiklayip bos/dolu saatleri gorme, bos saatten manuel basvuru olusturma
- Seans odasi: Sadece onayli/yaklasan seanslari gorme, hastayi anonim kodla takip etme, AI ile KVKK uyumlu ozet alma
- Terapi bitisi: Tamamlandi durumunda tesekkur ve yorum linki mail loguna kaydedilir
- Yorum sistemi: `/review` sayfasindan gelen yorum AI tarafindan yildizlanir

## AI Entegrasyonu

Backend `/api/ai/study-plan` endpoint'i danisanin hedef/konu, destek seviyesi ve haftalik ayirabilecegi sure bilgisine gore guvenli iyi olus plani uretir. `HF_API_TOKEN` tanimlanirsa HuggingFace Inference API server-side cagrilir. Token yoksa uygulama ayni endpoint uzerinden yerel AI benzeri kural tabanli onerici ile calismaya devam eder.

Onemli guvenlik karari: Uygulama tani koymaz, tedavi iddiasi sunmaz ve acil kriz hizmeti vermez. AI cevabi sadece seans hazirligi, duygu farkindaligi ve oz bakim adimlari icin destek notu olarak tasarlanmistir.

## Ortam Degiskenleri

`server/.env.example` dosyasini `server/.env` olarak kopyalayabilirsiniz.

```env
PORT=5000
JWT_SECRET=ymh354-secret-key
HF_API_TOKEN=
```
