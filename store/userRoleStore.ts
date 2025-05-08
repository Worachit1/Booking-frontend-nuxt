import { defineStore } from 'pinia';
import axios from 'axios';

export const useUserRoleStore = defineStore('userRole', {
  state: () => ({
    currentUserRole: [] as any[], // ✅ แก้จาก null เป็น array
  }),

  actions: {
    async getUserRoleById(user_id: string) {
      const config = useRuntimeConfig();
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const response = await axios.get(`${config.public.apiBase}/api/v1/userRoles/${user_id}`, {
          headers,
        });

        // console.log("📦 API Response for Role:", response.data);

        if (response.status === 200 && Array.isArray(response.data.data)) {
          this.currentUserRole = response.data.data;
          return response.data.data;
        } else {
          this.currentUserRole = [];
          return [];
        }
      } catch (error) {
        console.error("⚠️ ดึง user role ผิดพลาด:", error);
        this.currentUserRole = [];
        return [];
      }
    },
  },
});
