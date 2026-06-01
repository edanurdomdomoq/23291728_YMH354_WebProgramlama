# Veritabani Yedegi

Bu klasorde PostgreSQL veritabani icin schema dump dosyasi bulunur:

- `psikologdb_dump.sql`

Bu dosya tablo yapisini, kolonlari ve temel kisitlari gosterir. Public GitHub reposuna gercek basvuru, mesaj, e-posta ve seans notu koymamak icin kullanici verileri dahil edilmemistir.

## Geri Yukleme

PostgreSQL uzerinde `psikologdb` adli veritabanini olusturduktan sonra:

```bash
psql -U postgres -d psikologdb -f docs/database/psikologdb_dump.sql
```

Windows'ta `psql` PATH icinde degilse ornek kullanim:

```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d psikologdb -f docs/database/psikologdb_dump.sql
```

Uygulama ilk acilista eksik tablolari ve temel seed kayitlarini kendisi de olusturabilir. Bu dump dosyasi sunum ve teslim sirasinda veritabani yapisini acikca gostermek icin eklenmistir.
