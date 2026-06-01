# Kutuphane ve Sistem Haritasi

Bu dosya sunumda "hangi kutuphane nerede kullanildi?" sorusuna hizli cevap vermek icin hazirlandi.

## Frontend Kutuphaneleri

### React

Kullanildigi yer: `client/src/main.jsx`

React, kullanici arayuzunu component mantigiyla kurmak icin kullanildi. Projede her ana bolum ayri fonksiyon component olarak yazildi:

- `AuthScreen`: giris ve kayit ekrani
- `Dashboard`: ozet kartlari, risk/oncelik grafigi ve destek alanlari tablosu
- `TaskManager`: danisan takip kaydi ekleme, tamamlama ve silme
- `AiPlanner`: AI iyi olus destek plani uretme ekrani
- `App`: genel uygulama akisi ve veri yenileme

React hook kullanimi:

- `useState`: form verileri, hata mesajlari, kayitlar ve dashboard state'i
- `useEffect`: kullanici giris yaptiginda API'den verileri cekme
- `useMemo`: kullanici adini gereksiz tekrar hesaplamadan gostermek

### React DOM

Kullanildigi yer: `client/src/main.jsx`

`createRoot`, React uygulamasini `client/index.html` icindeki `root` elementine baglar.

### Vite

Kullanildigi yer: `client/package.json`

Vite, React gelistirme sunucusu ve build araci olarak kullanildi. `npm run dev --prefix client` frontend'i `http://localhost:5173` adresinde baslatir.

### lucide-react

Kullanildigi yer: `client/src/main.jsx`

Arayuzde ikon gostermek icin kullanildi:

- `HeartPulse`: psikolojik iyi olus marka simgesi
- `Brain`: AI vurgusu
- `CalendarHeart`: danisan/randevu bilgilendirme alani
- `BarChart3`: dashboard istatistigi
- `CheckCircle2`: kayit tamamlama
- `LogOut`: cikis butonu
- `Plus`: kayit ekleme
- `Sparkles`: AI destek plani
- `Trash2`: kayit silme

## Backend Kutuphaneleri

### Express.js

Kullanildigi yer: `server/src/index.js`, `server/src/routes/*.js`

Express, REST API sunucusunu kurmak icin kullanildi:

- `/api/auth`: kullanici kayit ve giris islemleri
- `/api/tasks`: danisan takip kaydi CRUD islemleri
- `/api/dashboard`: dashboard verileri
- `/api/ai`: AI iyi olus destek plani
- `/api/health`: API saglik kontrolu

### cors

Kullanildigi yer: `server/src/index.js`

Frontend `localhost:5173`, backend `localhost:5000` uzerinde calisir. Farkli portlar icin CORS izni gerekir.

### dotenv

Kullanildigi yer: `server/src/index.js`, `server/src/services/aiService.js`

`.env` dosyasindaki degerleri `process.env` icine yukler:

- `PORT`
- `JWT_SECRET`
- `HF_API_TOKEN`

### bcryptjs

Kullanildigi yer: `server/src/routes/auth.js`

Kullanici sifresini duz metin saklamamak icin kullanilir. Register sirasinda sifre hashlenir, login sirasinda hash ile karsilastirilir.

### jsonwebtoken

Kullanildigi yer: `server/src/routes/auth.js`, `server/src/middleware/auth.js`

Giris yapan kullaniciya JWT token verilir. Frontend token'i sonraki isteklerde `Authorization: Bearer <token>` header'i ile gonderir.

### nanoid

Kullanildigi yer: `server/src/routes/auth.js`, `server/src/routes/tasks.js`, `server/src/routes/ai.js`

Kullanici, danisan takip kaydi ve AI destek plani kayitlarina benzersiz id uretir.

### nodemon

Kullanildigi yer: `server/package.json`

Gelistirme sirasinda backend dosyalari degisince sunucuyu otomatik yeniden baslatir.

### concurrently

Kullanildigi yer: ana `package.json`

Tek komutla hem frontend hem backend'i baslatmak icin kullanilir. `npm run dev` ayni anda server ve client calistirir.

## Veri Akisi

1. Kullanici React arayuzunden form doldurur.
2. Frontend `fetch` ile Express API'ye istek gonderir.
3. Backend JWT token kontrolu yapar.
4. Route dosyasi ilgili servisleri cagirir.
5. JSON veritabani okunur/yazilir.
6. Sonuc JSON response olarak frontend'e doner.
7. React state guncellenir ve dashboard yeniden render edilir.

## AI Akisi

1. Danisan konu/hedef, destek seviyesi ve haftalik sure bilgisini girer.
2. Frontend `/api/ai/study-plan` endpointine POST istegi atar.
3. Backend token kontrolu yapar.
4. `aiService.js`, `HF_API_TOKEN` varsa HuggingFace API cagrisi yapar.
5. API anahtari yoksa yerel planlayici ayni formatta sonuc uretir.
6. Uretilen plan `db.json` icine kaydedilir.
7. Dashboard'daki AI destek notu sayisi guncellenir.

## Dashboard Akisi

Dashboard verisi frontend'de sabit yazilmamistir. `/api/dashboard` endpointi su hesaplamalari backend'de yapar:

- Toplam takip kaydi
- Tamamlanan kayit sayisi
- Iyi olus/tamamlanma yuzdesi
- Toplam ayrilan sure
- AI destek notu sayisi
- Destek alani bazli tablo
- Oncelik/risk bazli grafik verisi
