# Klinik Sunum Notlari

Bu dosya 10 dakikalik proje videosu veya sinif sunumu icin konusma akisi olarak kullanilabilir.

## 1. Giris - Proje Amaci

"Projemin adi Sibel Domdomoğulları Danışmanlık Merkezi. Bu uygulama profesyonel bir psikolog web sitesi ve korumali klinik yonetim panelinden olusur. Ziyaretci hizmetleri ve blog yazilarini inceler, randevu basvurusu yapar. Admin tarafinda basvurular, seans takvimi, blog yonetimi ve AI destekli seans hazirligi bulunur."

Vurgulanacak problem:

- Danisanlar seanslar arasinda duygularini ve hazirlik notlarini duzenli takip etmekte zorlanabilir.
- Psikolog veya danisman icin ilerleme takibi dashboard ile daha okunabilir hale gelir.
- AI sadece destekleyici oneriler sunar; klinik tani veya tedavi yerine gecmez.

## 2. Teknoloji Mimarisi

"Proje iki ana parcadan olusuyor: React frontend ve Express backend."

Gosterilecek dosyalar:

- `client/src/main.jsx`
- `server/src/index.js`
- `server/src/routes`

Anlatim:

- React kullanici arayuzunu olusturur.
- Express REST API saglar.
- Frontend direkt veritabanina veya AI servisine erismez.
- Kritik islemler backend uzerinden yapilir.

## 3. Kullanici Yonetimi

Gosterilecek akis:

1. Kayit ekranina gec.
2. Kisa sifre veya hatali e-posta girerek validasyonu goster.
3. Gecerli bilgilerle kayit ol.
4. Cikis yapip tekrar giris yap.

Kodda gosterilecek yer:

- Frontend validasyon: `client/src/main.jsx` icindeki `AuthScreen`
- Backend validasyon: `server/src/routes/auth.js`
- Sifre guvenligi: `bcryptjs`
- Token uretimi: `jsonwebtoken`

## 4. Public Site ve Randevu Akisi

Gosterilecek akis:

1. Anasayfa hero bolumunu goster.
2. Hizmet kartlarini ve hakkimda bolumunu goster.
3. Blog onizlemelerini goster.
4. Randevu formundan basvuru olustur.

Kodda gosterilecek yer:

- Frontend: `Hero`, `Services`, `About`, `BlogPreview`, `AppointmentForm`
- Backend: `server/src/routes/public.js`, `server/src/routes/appointments.js`

Konusma notu:

"Endpoint ismi teknik olarak tasks olsa da projede bu kayitlar danisan takip ve iyi olus aktiviteleri olarak kullaniliyor."

## 5. Korumali Klinik Pro Paneli

Gosterilecek akis:

1. Public sitede doktor girisi gorunmez; adres cubuguna `/doctor` yaz.
2. Admin kaydi veya girisi yap.
3. Genel bakis dashboard'unu goster.
4. Yeni basvurular ekraninda randevu basvurusunu onayla.
5. Reddedilen basvuruda durumun degistigini ve mail log mantigini anlat.
6. Seans takviminde bir gune tikla, bos/dolu saatleri goster.
7. Bos saatten yeni manuel basvuru olustur.
8. Seans odasinda sadece onayli/yaklasan danisanlarin anonim kodla geldigini goster.

Kodda gosterilecek yer:

- Frontend: `Dashboard`
- Backend: `server/src/routes/dashboard.js`

Konusma notu:

"Dashboard verileri hardcoded degil. Backend randevu basvurularini ve takip kayitlarini okuyup toplam danisan, bekleyen basvuru ve hizmet dagilimi gibi metrikleri anlik hesapliyor."

## 5.1 Mail ve Yorum Akisi

Gosterilecek akis:

1. Randevuyu onayla: `email-log.json` icine onay maili duser.
2. Randevuyu reddet: ret maili duser.
3. Terapiyi tamamla: tesekkur ve `/review` linki duser.
4. Review sayfasindan yorum yaz: AI yildiz puani otomatik belirler.

Konusma notu:

"Canli SMTP bilgisi verilirse mail servisi gercek mail gonderimine tasinabilir. Demo ortaminda ayni akis `server/data/email-log.json` dosyasinda izlenebilir."

## 6. AI Entegrasyonu

Gosterilecek akis:

1. AI Iyi Olus Asistani alanina konu gir.
2. Destek seviyesini sec.
3. Haftalik ayiracagi sureyi gir.
4. Destek plani uret butonuna bas.
5. Uretilen 7 gunluk iyi olus planini goster.
6. Dashboard'daki AI destek notu sayisinin arttigini goster.

Kodda gosterilecek yer:

- Frontend: `AiPlanner`
- Backend route: `server/src/routes/ai.js`
- AI servis: `server/src/services/aiService.js`

Konusma notu:

"AI cagrisi frontend'den yapilmiyor. Frontend sadece backend endpointine istek atiyor. Boylece API anahtari kullaniciya gorunmuyor. `HF_API_TOKEN` varsa HuggingFace cagriliyor; yoksa ayni endpoint yerel planlayiciyla calisiyor."

## 7. Guvenlik ve Etik Sinir

Mutlaka soyle:

"Bu uygulama klinik tani koymaz, tedavi onermez ve acil kriz hizmeti sunmaz. AI cevabi seans hazirligi, duygu farkindaligi ve oz bakim destegi amaciyla sinirlandirildi."

## 8. API Dokumantasyonu

Gosterilecek dosyalar:

- `docs/API-DOKUMANTASYON.md`
- `docs/openapi.yaml`

Anlatim:

"Her endpoint icin method, URL, kullanim amaci, request body ve response yapisi dokumante edildi."

## 9. Responsive Tasarim

Gosterilecek akis:

1. Masaustu gorunumu goster.
2. Tarayici genisligini kucult.
3. Tablet/mobil gorunumde kartlarin ve formlarin alt alta gectigini goster.

Kodda gosterilecek yer:

- `client/src/styles.css` icindeki `@media` kurallari

## 10. Kapanis

"Sibel Domdomoğulları Danışmanlık Merkezi, ders gereksinimlerini karsilayan, calisan ve genisletilebilir bir psikolog/danisan takip web uygulamasidir. Ileride psikolog rol paneli, randevu takvimi, MongoDB Atlas ve bildirim sistemi eklenebilir."
