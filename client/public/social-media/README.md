# Instagram Dosyalari

Bu klasor Vite tarafindan direkt yayinlanir. Buraya koydugun dosyalar sitede `/social-media/...` yolu ile okunur.

## Kullanilacak klasor

- `instagram/`

## En basit kullanim

1. Instagram profil fotosunu buraya koy:
   `instagram/profile.png`

2. Instagram post/reels kapaklarini buraya koy:
   `instagram/post-1.png`
   `instagram/post-2.png`
   `instagram/post-3.png`

3. Basliklari ve reels video dosyalarini `social-data.json` icinden degistir.

## Local reels videosu nasil kullanilir?

Video dosyasini bu klasore koy:

`instagram/reels-1.mp4`

Sonra `social-data.json` icinde ilgili post icin:

```json
"localVideo": "/social-media/instagram/reels-1.mp4"
```

Sadece gorsel kullanacaksan:

```json
"localVideo": ""
```

Not: JSON dosyasinda yorum satiri kullanma. Tirnak ve virgul kurallarina dikkat et.
