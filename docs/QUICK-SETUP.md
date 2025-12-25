# Quick Setup - Fitur Komunitas

## 🚀 Langkah Cepat (5 Menit)

### Step 1: Buka Supabase Dashboard

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri

### Step 2: Pilih Salah Satu (Pilih A atau B)

#### Opsi A: Fresh Install (Belum Ada Tabel) ⭐ RECOMMENDED

Jika tabel `community_posts` atau `post_reactions` belum ada, gunakan script lengkap:

1. Buka file: [`docs/create-tables.sql`](./create-tables.sql)
2. Copy semua isi file
3. Paste ke Supabase SQL Editor
4. Klik **Run**

Script ini akan:
- ✅ Create semua tabel yang dibutuhkan
- ✅ Set kolom `user_id` sebagai TEXT (untuk Firebase UID)
- ✅ Add check constraints
- ✅ Disable RLS
- ✅ Create indexes dan triggers

#### Opsi B: Update Existing Tables (Tabel Sudah Ada)

Jika tabel sudah ada tapi ada error, jalankan SQL ini:

```sql
-- 1. Ensure user_id is TEXT (not UUID) and add avatar_url
ALTER TABLE users ALTER COLUMN id TYPE TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE community_posts ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE post_reactions ALTER COLUMN user_id TYPE TEXT;

-- 2. Disable RLS (WAJIB!)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions DISABLE ROW LEVEL SECURITY;

-- 3. Fix check constraints
ALTER TABLE community_posts DROP CONSTRAINT IF EXISTS community_posts_post_type_check;
ALTER TABLE community_posts ADD CONSTRAINT community_posts_post_type_check
  CHECK (post_type IN ('progress', 'tips', 'photo', 'story'));

ALTER TABLE post_reactions DROP CONSTRAINT IF EXISTS post_reactions_reaction_type_check;
ALTER TABLE post_reactions ADD CONSTRAINT post_reactions_reaction_type_check
  CHECK (reaction_type IN ('like', 'support', 'celebrate'));

-- 4. Verifikasi
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'community_posts', 'post_reactions');
```

**Expected result:** 3 rows dengan `rowsecurity = false`

### Step 3: Setup Storage Bucket (Opsional - untuk upload foto)

1. Klik **Storage** di sidebar
2. Klik **Create Bucket**
3. Isi form:
   - Name: `community-images`
   - Public: ✅ **Checked**
   - File size limit: `5242880` (5 MB)
4. Klik **Create bucket**

### Step 4: Restart App

```bash
# Clear cache dan restart
npx expo start --clear
```

### Step 5: Test!

1. Login ke app dengan Firebase Auth
2. Buka tab **Komunitas**
3. Klik tombol **+** untuk buat post
4. Buat post pertama
5. ✅ Seharusnya berhasil!

---

## ❌ Jika Masih Error

### Error: "new row violates row-level security policy"

**Fix:** Pastikan Step 2 sudah dijalankan dengan benar. RLS harus disabled.

```sql
-- Run lagi
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions DISABLE ROW LEVEL SECURITY;
```

### Error: "invalid input syntax for type uuid"

**Fix:** Kolom `user_id` belum diubah ke TEXT

```sql
-- Run lagi
ALTER TABLE users ALTER COLUMN id TYPE TEXT;
ALTER TABLE community_posts ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE post_reactions ALTER COLUMN user_id TYPE TEXT;
```

### Error: "violates check constraint community_posts_post_type_check"

**Fix:** Check constraint tidak sesuai atau tidak ada

```sql
-- Run script dari docs/fix-all-constraints.sql atau:
ALTER TABLE community_posts DROP CONSTRAINT IF EXISTS community_posts_post_type_check;
ALTER TABLE community_posts ADD CONSTRAINT community_posts_post_type_check
  CHECK (post_type IN ('progress', 'tips', 'photo', 'story'));
```

### Error: "relation does not exist"

**Fix:** Tabel belum dibuat. Jalankan script dari [`create-tables.sql`](./create-tables.sql)

```sql
-- Script lengkap ada di docs/create-tables.sql
-- Script akan create semua tabel, constraints, indexes, dan triggers
```

---

## 📚 Dokumentasi Lengkap

- [community-setup.md](./community-setup.md) - Setup detail & troubleshooting
- [database-schema.sql](./database-schema.sql) - Full database schema
- [disable-rls.sql](./disable-rls.sql) - Script disable RLS

---

## ✅ Checklist

Pastikan semua ini sudah dilakukan:

- [ ] RLS disabled di 3 tabel (users, community_posts, post_reactions)
- [ ] Kolom user_id diubah ke tipe TEXT
- [ ] Storage bucket `community-images` dibuat (public)
- [ ] App direstart dengan `--clear` flag
- [ ] Test create post berhasil

---

## 🆘 Butuh Bantuan?

1. Check error di Expo terminal
2. Lihat troubleshooting di [community-setup.md](./community-setup.md)
3. Verifikasi database schema dengan:
   ```sql
   \d users
   \d community_posts
   \d post_reactions
   ```
