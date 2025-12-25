# Habitin - Dokumentasi Fitur Komunitas

Dokumentasi lengkap untuk setup dan troubleshooting fitur komunitas di aplikasi Habitin.

## 📁 File Dokumentasi

| File | Deskripsi | Untuk Siapa |
|------|-----------|-------------|
| **[QUICK-SETUP.md](./QUICK-SETUP.md)** | Setup cepat dalam 5 menit | ⭐ **Mulai dari sini!** |
| **[create-tables.sql](./create-tables.sql)** | Create semua tabel (Fresh install) | ⭐ **Setup database** |
| [community-setup.md](./community-setup.md) | Panduan lengkap & troubleshooting | Developer |
| [database-schema.sql](./database-schema.sql) | Full database schema reference | Database Admin |
| [disable-rls.sql](./disable-rls.sql) | Script disable RLS | Quick Fix |
| [fix-all-constraints.sql](./fix-all-constraints.sql) | Fix check constraints | Quick Fix |

## 🎯 Quick Start

**Baru setup?** → Mulai dari [QUICK-SETUP.md](./QUICK-SETUP.md)

**Ada error?** → Lihat troubleshooting di [community-setup.md](./community-setup.md)

**Mau lihat schema?** → Buka [database-schema.sql](./database-schema.sql)

## 🏗️ Arsitektur

### Stack Teknologi

- **Frontend:** React Native + Expo
- **Auth:** Firebase Authentication
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage

### Hybrid Architecture: Firebase Auth + Supabase DB

```
┌─────────────────┐
│  React Native   │
│   (Expo App)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐  ┌──────────┐
│Firebase│  │ Supabase │
│  Auth  │  │    DB    │
└────────┘  └──────────┘
    │            │
    │            │
    └────────────┘
         │
    User Data Sync
```

**Penting:** Firebase UID (TEXT) ≠ Supabase UUID
- Firebase: `sgDRMEBdxeXra0yqk8zeiA5b6u43`
- Supabase: `123e4567-e89b-12d3-a456-426614174000`

**Solusi:** Gunakan `TEXT` untuk kolom `user_id`, bukan `UUID`

## 📊 Database Schema

### Tables

1. **users** - Data user (synced dari Firebase Auth)
2. **community_posts** - Postingan komunitas
3. **post_reactions** - Reactions (like, support, celebrate)

### Storage Buckets

1. **community-images** - Foto postingan (public)

Lihat detail di [database-schema.sql](./database-schema.sql)

## 🔧 Common Issues

### 1. Error RLS Policy

```
Error: new row violates row-level security policy for table "users"
```

**Fix:** Jalankan [disable-rls.sql](./disable-rls.sql)

### 2. Error UUID

```
Error: invalid input syntax for type uuid: "sgDRMEBdxeXra0yqk8zeiA5b6u43"
```

**Fix:** Ubah kolom `user_id` ke tipe TEXT

### 3. Error Relationship Not Found

```
Error: Could not find a relationship between 'community_posts' and 'users'
```

**Fix:** ✅ Sudah diperbaiki di code (tidak pakai Supabase joins)

Lihat semua troubleshooting di [community-setup.md](./community-setup.md#troubleshooting)

## 🚀 Fitur Komunitas

### User dapat:

- ✅ Membuat postingan (Story, Progress, Tips, Photo)
- ✅ Upload foto di postingan
- ✅ Input metrics untuk Progress post (steps, calories, distance, duration)
- ✅ Like/Support/Celebrate postingan
- ✅ Hapus postingan sendiri
- ✅ Filter postingan by type
- ✅ Pull-to-refresh
- ✅ Auto-sync user data dari Firebase ke Supabase

### Coming Soon:

- [ ] Comments
- [ ] User profiles
- [ ] Follow/Unfollow
- [ ] Notifications
- [ ] Search posts
- [ ] Hashtags

## 📝 Code Structure

```
app/
├── (tabs)/
│   └── komunitas.tsx          # Main feed screen
└── screens/
    └── community/
        └── CreatePost.tsx      # Create post screen

src/
├── services/
│   └── database/
│       ├── community.service.ts  # CRUD operations
│       └── user.service.ts       # User sync & management
└── types/
    └── community.types.ts        # TypeScript interfaces

docs/
├── README.md                   # This file
├── QUICK-SETUP.md             # Quick setup guide
├── community-setup.md         # Detailed setup
├── database-schema.sql        # Database schema
└── disable-rls.sql            # RLS fix
```

## 🧪 Testing

### Test Flow

1. Login dengan Firebase Auth
2. Buka tab Komunitas
3. Create post pertama → User otomatis sync ke Supabase
4. Test reactions
5. Test delete own post
6. Test filter by type
7. Test pull-to-refresh

### Verify Data

```sql
-- Check user created
SELECT * FROM users LIMIT 5;

-- Check posts
SELECT * FROM community_posts ORDER BY created_at DESC LIMIT 10;

-- Check reactions
SELECT * FROM post_reactions LIMIT 10;
```

## 👨‍💻 Developer Notes

### Auto User Sync

Saat user create post pertama kali, `UserService.ensureUserExists()` akan:
1. Check apakah user sudah ada di Supabase
2. Jika belum, buat user baru dengan data dari Firebase Auth
3. Return user data

Lihat: [user.service.ts:27-59](../src/services/database/user.service.ts)

### Manual User Fetch (No Joins)

Karena Firebase Auth + Supabase DB hybrid, tidak bisa pakai Supabase joins dengan foreign keys.

**Solusi:** Fetch user data secara manual
```typescript
// 1. Fetch posts
const { data: posts } = await supabase
  .from('community_posts')
  .select('*');

// 2. Fetch users separately
const userIds = [...new Set(posts.map(p => p.user_id))];
const users = await Promise.all(
  userIds.map(id => UserService.getUserById(id))
);

// 3. Map users to posts
const postsWithUser = posts.map(post => ({
  ...post,
  user: userMap.get(post.user_id)
}));
```

Lihat: [community.service.ts:14-83](../src/services/database/community.service.ts)

## 📞 Support

Jika menemukan bug atau butuh bantuan:

1. Check [community-setup.md](./community-setup.md) troubleshooting section
2. Verify database schema dengan `\d table_name`
3. Check Expo console untuk error logs
4. Check Supabase logs di Dashboard > Logs

## 📄 License

Internal documentation - Habitin Project
