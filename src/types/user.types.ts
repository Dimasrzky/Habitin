export interface UserData {
  id?: number;
  firebase_uid: string;
  email: string;
  nama: string;
  foto_profile?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserResponse {
  success: boolean;
  data?: UserData;
  error?: string;
}