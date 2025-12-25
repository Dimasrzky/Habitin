# Setup Fitur Komunitas

## Masalah yang Diperbaiki

### Error: `invalid input syntax for type uuid`

**Penyebab:**
- Aplikasi menggunakan Firebase Authentication untuk auth user
- Firebase Auth menghasilkan UID dengan format seperti: `sgDRMEBdxeXra0yqk8zeiA5b6u43` (bukan UUID)
- Tabel Supabase menggunakan kolom `user_id` dengan tipe UUID yang tidak kompatibel dengan Firebase UID

**Solusi:**
Mengubah tipe kolom `user_id` dari UUID menjadi TEXT di semua tabel yang terkait.

## Langkah-langkah Setup Database

### ⚠️ PENTING: Jalankan langkah-langkah ini berurutan!

### 1. Backup Data (Jika Ada)

Jika sudah ada data di database, backup terlebih dahulu:

```sql
-- Backup di Supabase Dashboard > SQL Editor
CREATE TABLE users_backup AS SELECT * FROM users;
CREATE TABLE community_posts_backup AS SELECT * FROM community_posts;
CREATE TABLE post_reactions_backup AS SELECT * FROM post_reactions;
```

### 2. Update Schema Database

Jalankan query berikut di **Supabase Dashboard > SQL Editor**:

#### Opsi A: Drop dan Recreate (Jika belum ada data penting)

```sql
-- Drop existing tables
DROP TABLE IF EXISTS post_reactions CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
-- Jangan drop users jika sudah ada data

-- Buat ulang dengan schema yang benar
-- Lihat file: docs/database-schema.sql
```

#### Opsi B: Alter Existing Tables (Jika sudah ada data)

```sql
-- Ubah tipe kolom user_id dari UUID ke TEXT
ALTER TABLE users
  ALTER COLUMN id TYPE TEXT;

ALTER TABLE community_posts
  ALTER COLUMN user_id TYPE TEXT;

ALTER TABLE post_reactions
  ALTER COLUMN user_id TYPE TEXT;
```

### 3. Verifikasi Schema

Pastikan tipe data sudah benar:

```sql
-- Check schema
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('users', 'community_posts', 'post_reactions')
  AND column_name LIKE '%user_id%' OR column_name = 'id'
ORDER BY table_name, ordinal_position;
```

Expected result:
- `users.id` → TEXT
- `community_posts.user_id` → TEXT
- `post_reactions.user_id` → TEXT

### 4. Setup Storage Bucket

1. Buka **Supabase Dashboard > Storage**
2. Klik **Create Bucket**
3. Nama: `community-images`
4. Public: ✅ Enable (agar image bisa diakses publik)
5. File size limit: 5 MB
6. Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

### 5. 🔥 Disable RLS (Row Level Security) - WAJIB!

**Error yang akan terjadi jika skip step ini:**
```
Error: new row violates row-level security policy for table "users"
```

Karena menggunakan Firebase Auth (bukan Supabase Auth), RLS harus di-disable.

**Cara 1: Jalankan SQL di Supabase Dashboard**

Buka **Supabase Dashboard > SQL Editor**, copy-paste dan run:

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions DISABLE ROW LEVEL SECURITY;
```

**Cara 2: Gunakan file SQL yang sudah disediakan**

Jalankan semua query di file: [`docs/disable-rls.sql`](./disable-rls.sql)

**Verifikasi RLS sudah disabled:**

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'community_posts', 'post_reactions');
```

Expected result: `rowsecurity = false` untuk semua tabel.

**Note:** Di production, Anda bisa enable RLS dan membuat custom policies yang integrate dengan Firebase Auth.

## Cara Kerja Sinkronisasi User

### Auto-sync Firebase User ke Supabase

Saat user membuat post pertama kali, sistem otomatis akan:

1. Cek apakah user sudah ada di tabel `users` Supabase
2. Jika belum ada, buat user baru dengan:
   - `id`: Firebase UID (dari `auth.currentUser.uid`)
   - `email`: Email user dari Firebase Auth
   - `full_name`: Display name dari Firebase atau email username
3. Setelah user ada, baru buat post

Ini dilakukan di file: `app/screens/community/CreatePost.tsx`

```typescript
// Ensure user exists in Supabase (sync from Firebase)
const userResult = await UserService.ensureUserExists(
  currentUser.uid,
  userEmail,
  userName
);
```

## Testing

### 1. Buat Post Baru

1. Login dengan user Firebase yang belum pernah posting
2. Buka tab **Komunitas**
3. Klik tombol **+** untuk buat post
4. Pilih tipe post (Story/Progress/Tips/Foto)
5. Isi content dan klik **Posting**

### 2. Verifikasi Data

Check di Supabase Dashboard:

```sql
-- Check if user created
SELECT * FROM users WHERE id = 'your-firebase-uid';

-- Check if post created
SELECT * FROM community_posts WHERE user_id = 'your-firebase-uid';
```

### 3. Test Reactions

1. Like/Support/Celebrate post
2. Check reactions count update
3. Check `post_reactions` table

```sql
SELECT * FROM post_reactions WHERE user_id = 'your-firebase-uid';
```

## Troubleshooting

### ❌ Error: "new row violates row-level security policy for table 'users'"

**Penyebab:** RLS (Row Level Security) masih aktif di Supabase

**Solusi:**
1. Buka Supabase Dashboard > SQL Editor
2. Jalankan query dari file [`docs/disable-rls.sql`](./disable-rls.sql)
3. Atau manual run:
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ALTER TABLE community_posts DISABLE ROW LEVEL SECURITY;
   ALTER TABLE post_reactions DISABLE ROW LEVEL SECURITY;
   ```
4. Restart app dan coba lagi

### ❌ Error: "Could not find a relationship between 'community_posts' and 'users'"

**Penyebab:** Menggunakan Supabase joins dengan foreign key yang tidak ada

**Solusi:** ✅ Sudah diperbaiki dengan menggunakan manual fetch user data (tidak pakai Supabase joins)

### ❌ Error: "invalid input syntax for type uuid"

**Penyebab:** Kolom `user_id` masih tipe UUID, tapi Firebase UID bukan format UUID

**Solusi:**
1. Ubah tipe kolom ke TEXT:
   ```sql
   ALTER TABLE users ALTER COLUMN id TYPE TEXT;
   ALTER TABLE community_posts ALTER COLUMN user_id TYPE TEXT;
   ALTER TABLE post_reactions ALTER COLUMN user_id TYPE TEXT;
   ```
2. Restart Expo dev server: `npx expo start --clear`

### ❌ Error: "duplicate key value violates unique constraint"

**Penyebab:** User sudah ada di database

**Solusi:** ✅ Sudah ditangani dengan `ensureUserExists()` yang cek dulu sebelum insert

### ❌ Error: "violates check constraint community_posts_post_type_check"

**Penyebab:** Check constraint di database tidak cocok dengan nilai yang dikirim, atau constraint tidak ada

**Solusi:**
1. Jalankan script dari [`docs/fix-all-constraints.sql`](./fix-all-constraints.sql)
2. Atau manual run:
   ```sql
   ALTER TABLE community_posts DROP CONSTRAINT IF EXISTS community_posts_post_type_check;
   ALTER TABLE community_posts ADD CONSTRAINT community_posts_post_type_check
     CHECK (post_type IN ('progress', 'tips', 'photo', 'story'));
   ```
3. Restart app dan coba lagi

### ❌ Error: "relation 'post_reactions' does not exist"

**Penyebab:** Tabel `post_reactions` belum dibuat di database

**Solusi:**
1. Jalankan script lengkap dari [`docs/create-tables.sql`](./create-tables.sql)
2. Script ini akan create semua tabel yang dibutuhkan beserta constraints, indexes, dan triggers
3. Setelah selesai, restart app dan coba lagi

### ⚠️ User tidak muncul di feed

**Check:**
1. Apakah user sudah ada di tabel `users`?
   ```sql
   SELECT * FROM users WHERE id = 'your-firebase-uid';
   ```
2. Apakah `user_id` di `community_posts` match dengan `id` di `users`?
   ```sql
   SELECT cp.*, u.full_name
   FROM community_posts cp
   LEFT JOIN users u ON cp.user_id = u.id
   WHERE cp.user_id = 'your-firebase-uid';
   ```
3. Check console untuk error

### 🔍 Debug Mode

Untuk melihat log detail saat posting:

```typescript
// Di CreatePost.tsx, console.log akan otomatis show:
console.log('🔄 Syncing user...');
console.log('📝 Creating post...');
```

Check di Expo terminal untuk log tersebut.

## File yang Dimodifikasi

1. ✅ `src/services/database/user.service.ts` - Tambah method `ensureUserExists()`
2. ✅ `app/screens/community/CreatePost.tsx` - Tambah sync user sebelum create post
3. ✅ `src/services/database/community.service.ts` - Gunakan manual fetch (tidak pakai joins)
4. ✅ `app/(tabs)/komunitas.tsx` - Display posts dari database

## Next Steps

- [ ] Test dengan multiple users
- [ ] Test upload image
- [ ] Test reactions
- [ ] Test delete post
- [ ] Optimize: Add caching untuk user data
- [ ] Security: Implement RLS dengan Firebase Auth integration
