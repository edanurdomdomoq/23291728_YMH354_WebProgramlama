# Klinik API Dokumantasyonu

Base URL: `http://localhost:5000/api`

## GET /health

API saglik durumunu dondurur.

Response:

```json
{ "status": "ok", "service": "AI StudyHub API" }
```

## POST /auth/register

Yeni kullanici/danisan hesabi olusturur. Frontend kayit formu bu endpoint'i kullanir.

Body:

```json
{ "name": "Demo User", "email": "demo@example.com", "password": "123456" }
```

Response:

```json
{ "token": "jwt-token", "user": { "id": "...", "name": "Demo User", "email": "demo@example.com" } }
```

## POST /auth/login

Kullanici girisi yapar.

Body:

```json
{ "email": "demo@example.com", "password": "123456" }
```

## GET /tasks

JWT ile kullanicinin danisan takip kayitlarini listeler.

Header: `Authorization: Bearer <token>`

## POST /tasks

Yeni danisan takip kaydi olusturur.

Header: `Authorization: Bearer <token>`

Body:

```json
{
  "title": "Bugunku duygu gunlugumu doldur",
  "category": "Duygu Gunlugu",
  "priority": "medium",
  "estimatedHours": 1
}
```

## PATCH /tasks/{id}

Danisan takip kaydini veya tamamlanma durumunu gunceller.

Body:

```json
{ "completed": true }
```

## DELETE /tasks/{id}

Danisan takip kaydini siler.

## GET /dashboard

Dashboard kartlari, risk/oncelik grafigi ve destek alanlari tablosu icin dinamik verileri dondurur.

Response:

```json
{
  "summary": { "taskCount": 1, "completed": 0, "completionRate": 0, "totalHours": 1, "aiPlanCount": 1 },
  "byCategory": [{ "category": "Duygu Gunlugu", "total": 1, "completed": 0 }],
  "byPriority": [{ "priority": "medium", "count": 1 }],
  "recentTasks": [],
  "recentPlans": []
}
```

## POST /ai/study-plan

Server-side AI iyi olus destek plani uretir. `HF_API_TOKEN` varsa HuggingFace API cagrilir, yoksa yerel guvenli planlayici devreye girer.

Header: `Authorization: Bearer <token>`

Body:

```json
{ "goal": "Sinav stresi ile bas etmek istiyorum", "level": "intermediate", "weeklyHours": 4 }
```

Guvenlik notu: Endpoint klinik tani koymaz, tedavi onermez ve acil kriz destegi saglamaz.

## GET /public/site

Public web sitesi icin hizmetleri, blog yazilarini ve danisan yorumlarini dondurur.

Response:

```json
{
  "services": [],
  "posts": [],
  "testimonials": []
}
```

## POST /appointments

Public randevu formundan yeni basvuru olusturur. Login gerektirmez.

Body:

```json
{
  "name": "Canli Demo",
  "email": "demo@example.com",
  "phone": "05462261143",
  "service": "Online Terapi",
  "preferredDate": "2026-06-01",
  "message": "Randevu almak istiyorum"
}
```

## GET /appointments

Korumali Klinik Pro panelinde tum randevu basvurularini listeler.

Header: `Authorization: Bearer <token>`

## PATCH /appointments/{id}

Randevu basvurusunun durumunu gunceller.

Header: `Authorization: Bearer <token>`

Body:

```json
{ "status": "approved" }
```

Status degerleri:

- `pending`
- `approved`
- `rejected`
- `completed`

Onay, ret ve tamamlandi durumlari mail servisinde log olusturur.

## GET /appointments/slots?date=YYYY-MM-DD

Korumali panelde secilen gunun bos/dolu saatlerini dondurur.

Header: `Authorization: Bearer <token>`

## POST /appointments/doctor-create

Doktorun takvimde bos bir saate manuel basvuru/randevu olusturmasini saglar.

Header: `Authorization: Bearer <token>`

## GET /sessions/today

Bugunku onayli seanslari dondurur.

Header: `Authorization: Bearer <token>`

## POST /sessions/summary/{appointmentId}

Hasta bilgilerini acik etmeden anonim kod ve notlarla AI seans ozeti uretir.

Header: `Authorization: Bearer <token>`

## POST /sessions/{appointmentId}

Seansa anonim klinik not ekler.

Header: `Authorization: Bearer <token>`

## POST /reviews

Terapi sonrasi yorum alir ve AI ile yildiz puani belirler.

Body:

```json
{ "appointmentId": "id", "text": "Cok guvenli ve profesyonel bir deneyimdi." }
```
