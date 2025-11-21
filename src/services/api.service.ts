import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '../config/api.config';
import { UserData, UserResponse } from '../types/user.types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async saveUser(userData: UserData): Promise<UserResponse> {
    try {
      const response = await this.api.post(API_CONFIG.ENDPOINTS.USERS, userData);
      return { success: true, data: response.data.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async getUserByFirebaseUid(firebase_uid: string): Promise<UserResponse> {
    try {
      const response = await this.api.get(
        API_CONFIG.ENDPOINTS.USER_BY_ID(firebase_uid)
      );
      return { success: true, data: response.data.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async updateUser(firebase_uid: string, userData: Partial<UserData>): Promise<UserResponse> {
    try {
      const response = await this.api.put(
        API_CONFIG.ENDPOINTS.USER_BY_ID(firebase_uid),
        userData
      );
      return { success: true, data: response.data.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }
}

export default new ApiService();