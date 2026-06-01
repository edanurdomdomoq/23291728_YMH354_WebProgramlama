# Sibel Domdomogullari Danismanlik Merkezi

YMH354 Web Tasarim ve Programlama final projesi icin hazirlanmis AI destekli psikolog/danisan takip web uygulamasidir.

Uygulama iki ana bolumden olusur:

- Public web sitesi: Anasayfa, hizmetler, hakkimda, blog, Instagram bolumu, randevu basvurusu, misafir mesaj alani ve danisan yorumlari.
- Klinik Pro admin paneli: Giris korumali dashboard, basvuru yonetimi, seans takvimi, seans odasi, mesaj merkezi, blog yonetimi ve hizmet yonetimi.

## Kullanilan Teknolojiler

### Frontend

| Teknoloji | Projedeki Gorevi |
| --- | --- |
| React | Kullanici arayuzu, component yapisi, state yonetimi ve sayfa akislari. |
| Vite | React uygulamasini hizli gelistirme sunucusu ve build sistemiyle calistirir. |
| JavaScript JSX | React componentleri ve frontend is mantigi icin kullanildi. |
| CSS3 | Responsive tasarim, tablet/telefon kirilimlari, sliderlar, admin panel ve public site stilleri. |
| Framer Motion | Animasyonlu gecisler ve daha akici UI deneyimi icin kullanildi. |
| Lucide React | Buton, menu, dashboard, takvim, mesaj ve sosyal medya ikonlari icin kullanildi. |
| HTML5 video | Instagram/Reels benzeri lokal video oynatma alani icin kullanildi. |

### Backend

| Teknoloji | Projedeki Gorevi |
| --- | --- |
| Node.js | Backend runtime ortami. |
| Express.js | REST API endpointlerini calistiran web server. |
| CORS | Frontend ve backend farkli portlarda calisirken API erisimini saglar. |
| Dotenv | `.env` icindeki ortam degiskenlerini backend'e yukler. |
| Nanoid | Randevu, mesaj, yorum ve seans gibi kayitlar icin benzersiz ID uretir. |
| BcryptJS | Admin kullanici sifrelerini hashlemek ve dogrulamak icin kullanilir. |
| JSON Web Token | Admin girisinden sonra korumali endpointlere erisim icin token uretir. |
| Nodemailer | SMTP bilgileri girildiginde randevu onay/red ve yorum linki e-postalarini yollar. |

### Veritabani

| Teknoloji | Projedeki Gorevi |
| --- | --- |
| PostgreSQL | Basvurular, seanslar, mesajlar, yorumlar, hizmetler, blog yazilari ve admin kullanicilari icin ana veritabani. |
| pg | Express backend'in PostgreSQL'e baglanmasini saglayan Node.js kutuphanesi. |
| SQL dump | `docs/database/psikologdb_dump.sql` dosyasi tablo yapisini gostermek icin eklendi. |

### AI ve API

| Teknoloji | Projedeki Gorevi |
| --- | --- |
| Gemini API | Seans analizi ve yorum yildizlama islemlerinde server-side AI entegrasyonu. |
| HuggingFace API | Opsiyonel ikinci AI entegrasyonu olarak desteklenir. |
| REST API | Frontend ile backend arasindaki veri akisi. |
| OpenAPI YAML | API dokumantasyonu icin `docs/openapi.yaml`. |

### Gelistirme ve Teslim

| Teknoloji | Projedeki Gorevi |
| --- | --- |
| npm | Paket kurulumu ve script calistirma. |
| Nodemon | Backend gelistirme modunda otomatik yeniden baslatma. |
| Concurrently | Frontend ve backend'i tek komutla beraber calistirma. |
| Git | Versiyon kontrolu. |
| GitHub | Proje kodlarinin public repo olarak teslimi. |

## Ders Gereksinimleri

| Gereksinim | Projedeki Karsiligi |
| --- | --- |
| React kullanimi | `client` klasoru Vite + React uygulamasidir. |
| Register / login / logout | `server/src/routes/auth.js` ve admin panel girisi. |
| Form validasyonu | Randevu, misafir mesaj, admin giris ve yonetim formlarinda frontend/backend validasyonlari. |
| AI entegrasyonu | Gemini destekli seans analizi ve yorum puanlama. |
| Server-side AI cagrisi | AI anahtari frontend'e verilmez; cagrilar backend servislerinde yapilir. |
| Dinamik dashboard | `server/src/routes/dashboard.js` veritabani kayitlarindan anlik istatistik uretir. |
| Grafik veya tablo | Admin dashboard grafik, tablo, durum ve dagilim alanlari icerir. |
| REST API | Auth, appointments, dashboard, sessions, messages, reviews, content ve AI endpointleri. |
| Veritabani | PostgreSQL. |
| Responsive tasarim | Desktop, tablet ve telefon kirilimlari `client/src/styles.css` icindedir. |

## Klasor Yapisi

```text
YMH354-AI-StudyHub/
  client/
    public/                  Logo, favicon, Instagram gorselleri ve lokal videolar
    src/main.jsx             React sayfalari, componentler ve API cagrilari
    src/styles.css           Responsive tasarim ve tum stiller
  server/
    src/index.js             Express API baslangic dosyasi
    src/routes/              REST API route dosyalari
    src/middleware/auth.js   JWT koruma katmani
    src/services/            Database, mail, AI ve yorum servisleri
    .env.example             Ornek ortam degiskenleri
  docs/
    database/                PostgreSQL schema dump ve geri yukleme notlari
    openapi.yaml             API dokumantasyonu
    SUNUM_NOTLARI.md         Sunum anlatim notlari
    RAPOR-TASLAK.md          Rapor taslagi
```

## Kendi Bilgisayarinda Calistirma

### 1. Gerekli programlar

Bilgisayarda su programlar kurulu olmali:

- Node.js LTS
- PostgreSQL
- Git
- Visual Studio Code veya baska bir editor

### 2. Projeyi indir

```bash
git clone https://github.com/edanurdomdomoq/23291728_YMH354_WebProgramlama.git
cd 23291728_YMH354_WebProgramlama
```

### 3. Paketleri kur

```bash
npm run install:all
```

### 4. PostgreSQL veritabanini olustur

pgAdmin veya psql ile `psikologdb` adinda veritabani olustur.

psql ile yapmak istersen:

```bash
createdb -U postgres psikologdb
```

### 5. Ortam degiskenlerini hazirla

`server/.env.example` dosyasini kopyala ve adini `server/.env` yap.

Ornek:

```env
PORT=5000
JWT_SECRET=change-this-secret
DATABASE_URL=postgresql://postgres:SIFREN@localhost:5432/psikologdb
DATABASE_SSL=false
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=http://localhost:5173
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM="Sibel Domdomogullari Danismanlik Merkezi <your-mail@example.com>"
```

`SIFREN` yazan yere PostgreSQL kurarken belirlenen postgres sifresi yazilir.

### 6. Veritabani yapisini yukle

Backend ilk acilista tablolarin cogunu olusturabilir. Yine de teslim icin eklenen schema dump dosyasini yuklemek istersen:

```bash
psql -U postgres -d psikologdb -f docs/database/psikologdb_dump.sql
```

Windows'ta `psql` taninmazsa:

```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d psikologdb -f docs/database/psikologdb_dump.sql
```

### 7. Uygulamayi baslat

Tek komutla frontend ve backend:

```bash
npm run dev
```

Adresler:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

## Sevgilinin Bilgisayarina Local Kurulum

1. Node.js LTS indir ve kur.
2. PostgreSQL indir ve kur. Kurarken belirledigi postgres sifresini not alsin.
3. Git indir ve kur.
4. Terminal veya PowerShell ac.
5. Projeyi indir:

```bash
git clone https://github.com/edanurdomdomoq/23291728_YMH354_WebProgramlama.git
cd 23291728_YMH354_WebProgramlama
```

6. Paketleri kur:

```bash
npm run install:all
```

7. PostgreSQL'de `psikologdb` veritabani olustur:

```bash
createdb -U postgres psikologdb
```

8. `server/.env.example` dosyasini `server/.env` olarak kopyala.
9. `server/.env` icinde `DATABASE_URL` satirini kendi PostgreSQL sifresine gore duzenle:

```env
DATABASE_URL=postgresql://postgres:POSTGRES_SIFRESI@localhost:5432/psikologdb
```

10. Veritabani schema dosyasini yukle:

```bash
psql -U postgres -d psikologdb -f docs/database/psikologdb_dump.sql
```

11. Uygulamayi baslat:

```bash
npm run dev
```

12. Tarayicida ac:

```text
http://localhost:5173
```

## Admin Girisi

Varsayilan demo admin bilgisi:

```text
E-posta: admin@mindcare.test
Sifre: 123456
```

Admin sifresi veritabaninda hashli tutulur. Sifre degistirmek icin yeni hash uretilip `doktorlar` tablosundaki `password_hash` alani guncellenmelidir.

## AI ve Mail Notlari

- Gemini calismasi icin `GEMINI_API_KEY` alanina gecerli API key girilir.
- Mail gonderimi icin SMTP bilgileri doldurulur.
- Bu bilgiler `.env` icinde kalmalidir.
- `.env` dosyasi GitHub'a yuklenmez.

## Veritabani Dump Notu

`docs/database/psikologdb_dump.sql` public repo icin schema-only hazirlanmistir. Gercek kisi e-postalari, randevu notlari, mesajlar ve seans notlari dahil edilmemistir.

Bu karar KVKK ve gizlilik acisindan ozellikle tercih edilmistir.

## Teslim Dosyalari

- `GrupAdiGitHubURL.txt`: GitHub repo linki
- `GrupAdiVideoURL.txt`: Sunum videosu linki icin hazir dosya
- `GrupAdiDeployURL.txt`: Canli yayin linki icin hazir dosya
- `docs/openapi.yaml`: API dokumantasyonu
- `docs/database/psikologdb_dump.sql`: PostgreSQL tablo yapisi
