# Setup Avatar Storage

## Storage Bucket untuk Avatar User

Untuk menyimpan foto profil user, perlu dibuat storage bucket di Supabase.

## Langkah Setup

### 1. Buka Supabase Dashboard

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik **Storage** di sidebar kiri

### 2. Create Bucket untuk Avatar

Buat bucket dengan nama: `user-uploads`

**Settings:**
- **Name:** `user-uploads`
- **Public bucket:** ✅ **Enable** (agar avatar bisa diakses publik)
- **File size limit:** 5 MB (5242880 bytes)
- **Allowed MIME types:** `image/jpeg`, `image/png`, `image/jpg`, `image/webp`

### 3. Verify Bucket Created

Setelah dibuat, cek di Storage > user-uploads, seharusnya ada folder `avatars/` yang akan otomatis dibuat saat user pertama upload.

## Cara Kerja

1. User buka Edit Profile screen
2. User pilih foto dari galeri (menggunakan `AvatarPicker`)
3. Saat save:
   - Foto di-upload ke `user-uploads/avatars/{userId}-{timestamp}.jpg`
   - URL public disimpan ke `users.avatar_url` di database
4. Foto muncul di:
   - Profile screen
   - Community feed
   - Semua tempat yang menampilkan user info

## File Terkait

- `src/services/storage/image.service.ts` - Upload logic
- `src/services/database/user.service.ts` - Update avatar_url di database
- `app/screens/Profile/EditProfile.tsx` - UI untuk edit profile & upload avatar
- `components/AvatarPicker.tsx` - Component untuk pilih avatar

## Troubleshooting

### Error: "Bucket not found"

**Solusi:** Pastikan bucket `user-uploads` sudah dibuat di Supabase Dashboard > Storage

### Error: "File size too large"

**Solusi:** Image lebih dari 5MB. Bucket sudah set limit 5MB. User perlu resize image terlebih dahulu.

### Error: "Invalid MIME type"

**Solusi:** Pastikan allowed MIME types include: `image/jpeg`, `image/png`, `image/jpg`, `image/webp`

### Avatar tidak muncul setelah upload

**Check:**
1. Apakah bucket `user-uploads` public?
2. Apakah kolom `avatar_url` di tabel `users` sudah ada?
3. Check Supabase Storage > user-uploads > avatars, apakah file ter-upload?
4. Check console log untuk error saat upload

## Verifikasi Upload Berhasil

Setelah user upload avatar, check di Supabase:

```sql
-- Check avatar_url tersimpan
SELECT id, full_name, avatar_url
FROM users
WHERE avatar_url IS NOT NULL;
```

Dan check di Storage > user-uploads > avatars, seharusnya ada file image.

## Security Note

- Bucket `user-uploads` adalah **public bucket**
- Semua orang bisa akses URL avatar
- Untuk production, consider:
  - Implement image compression
  - Add watermark untuk prevent misuse
  - Implement rate limiting untuk prevent spam upload
  - Scan uploaded images untuk inappropriate content
