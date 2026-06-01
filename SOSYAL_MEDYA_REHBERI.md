# Instagram Gorsel ve Video Rehberi

Kanka sosyal medya bolumu artik sadece Instagram icin calisir.

Dosyalari koyacagin yer:

`client/public/social-media/instagram/`

## Hazir dosya isimleri

- `profile.png`
- `post-1.png`
- `post-2.png`
- `post-3.png`

Baslik, profil linki ve video ayarlari:

`client/public/social-media/social-data.json`

## Local reels videosu ekleme

Video dosyasini mesela soyle koy:

`client/public/social-media/instagram/reels-1.mp4`

Sonra `social-data.json` icinde ilgili item'a bunu yaz:

```json
"localVideo": "/social-media/instagram/reels-1.mp4"
```

Video yoksa bos birak:

```json
"localVideo": ""
```

JSON dosyasinda yorum satiri kullanma; sadece tirnak ve virgul kurallarini bozma yeter.
