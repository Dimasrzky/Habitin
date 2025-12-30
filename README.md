# Habitin 2025 🏥💚

Aplikasi Mobile Pencegahan Dini Diabetes, Kolesterol, dan Obesitas untuk Remaja Indonesia

---

## 📋 Informasi Project

**Mata Kuliah**: Pengembangan Aplikasi Bergerak
**Prodi**: Informatika
**Fakultas**: Teknologi Industri - Universitas Islam Indonesia  
**Semester**: Ganjil 2025/2026

### 👥 Tim Pengembang - BoyKotlin

| Nama                         | NIM      | Role                              |
| ---------------------------- | -------- | --------------------------------- |
| Muhamad Dimas Rizky Darmawan | 23523252 | Project Lead, fullstack Developer |
| Tio Ananda Sinaga            | 23523201 | Frontend Developer, QA Testing    |
| Alfi Akbar Rahmada           | 23523149 | Database Architect, QA Testing    |

**Dosen Pembimbing**: Arrie Kurniawardhani, S.Si., M.Kom.

---

## 🎯 Deskripsi Aplikasi

Habitin adalah aplikasi mobile berbasis React Native yang dirancang untuk:

- ✅ Monitoring risiko diabetes dan kolesterol pada remaja (13-22+ tahun)
- ✅ Analisis hasil lab menggunakan OCR technology
- ✅ Gamifikasi dengan sistem challenge dan streak
- ✅ Edukasi kesehatan melalui artikel dan chatbot AI
- ✅ Reminder untuk gaya hidup sehat

**Target Pengguna**: Remaja Indonesia usia 13-22+ tahun

---

## 🛠️ Tech Stack

### Frontend

- React Native 0.74.5
- Expo SDK 51
- TypeScript
- Expo Router (file-based routing)
- React Native Reanimated (animations)
- Zustand (state management)

### Backend & Services

- Firebase Authentication (user authentication)
- Supabase (PostgreSQL database + storage)
- Google Gemini AI (chatbot)
- NewsAPI (health articles)
- DeepL (translation service)

### Libraries Utama

```json
{
  "expo": "~51.0.28",
  "react-native": "0.74.5",
  "firebase": "^10.13.0",
  "@supabase/supabase-js": "^2.45.0",
  "expo-notifications": "~0.28.16",
  "react-native-gesture-handler": "~2.16.1",
  "zustand": "^4.5.0"
}
```

---

## 📦 Instalasi & Setup

### Prerequisites

- Node.js (v18 atau lebih tinggi)
- npm atau yarn
- Expo Go app di smartphone (untuk testing)
- Git

### Langkah Instalasi

1. **Clone Repository**

```bash
git clone https://github.com/Dimasrzky/Habitin.git
cd Habitin
```

2. **Install Dependencies**

```bash
npm install
# atau
yarn install
```

3. **Setup Environment Variables**
   Buat file `.env` di root folder:

```env
# Firebase Config
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Supabase Config
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Keys
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_NEWS_API_KEY=your_news_api_key
EXPO_PUBLIC_DEEPL_API_KEY=your_deepl_api_key
```

4. **Jalankan Aplikasi**

```bash
# Development mode
npx expo start

# Atau dengan options
npx expo start --clear  # Clear cache
npx expo start --tunnel # Untuk akses dari network lain
```

5. **Testing di Device**

- Install **Expo Go** dari Play Store/App Store
- Scan QR code dari terminal
- Atau tekan `a` untuk Android emulator / `i` untuk iOS simulator

---

## 🔐 Testing Credentials

| Role             | Email               | Password |
| ---------------- | ------------------- | -------- |
| **User Testing** | dimdev454@gmail.com | Admin123 |

---

## 📁 Struktur Project

```
Habitin_2025/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Main tab navigation
│   ├── (auth)/              # Authentication screens
│   ├── admin/               # Admin panel
│   └── _layout.tsx          # Root layout
├── components/              # Reusable components
│   ├── ui/                  # UI components
│   ├── forms/               # Form components
│   └── cards/               # Card components
├── services/                # API & services
│   ├── firebase/            # Firebase services
│   ├── supabase/            # Supabase services
│   └── api/                 # External APIs
├── contexts/                # React contexts
├── hooks/                   # Custom hooks
├── utils/                   # Utility functions
├── assets/                  # Images, fonts, icons
│   ├── images/
│   ├── fonts/
│   └── icons/
├── types/                   # TypeScript types
├── constants/               # App constants
├── app.json                 # Expo configuration
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── README.md               # This file
```

---

## 🚀 Fitur Utama

### 1. **Authentication**

- Login & Register dengan Firebase
- Email verification
- Password reset
- Onboarding flow

### 2. **OCR Lab Analysis**

- Upload foto hasil lab
- Ekstraksi data otomatis (Glucose, Cholesterol, BMI)
- Analisis risiko kesehatan
- Riwayat hasil lab

### 3. **Gamifikasi**

- Daily challenges (nutrition, exercise, hydration)
- Streak tracking
- Point & badge system
- Leaderboard komunitas

### 4. **Konten Edukasi**

- Artikel kesehatan (NewsAPI)
- Rekomendasi personalized
- Chatbot AI (Gemini)
- Tips kesehatan harian

### 5. **Reminder System**

- Notifikasi challenge harian
- Reminder minum air
- Jadwal olahraga
- Background notifications

### 6. **Community**

- Post & sharing experience
- Like & comment system
- User profile
- Social interactions

### 7. **Admin Panel**

- User management
- Content moderation
- Analytics dashboard
- Challenge management
