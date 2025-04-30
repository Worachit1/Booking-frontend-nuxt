import axios from "axios";
import { defineStore } from "pinia";

const config = useRuntimeConfig();

interface User {
    id?: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    position_name: string;
    phone: string;
    image_url: File | string;
    token?: string;
}

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null as User | null,
        token: null as string | null,
    }),
    actions: {
        async login(payload: { email: string; password: string }) {
            try {
                console.log("Login Payload:", payload);

                const response = await axios.post(
                    `${config.public.apiBase}/api/v1/login`,
                    payload,
                    { withCredentials: true }  // ส่งคุกกี้ที่สามารถใช้ได้
                );
                console.log("Response:", response);

                if (response.status === 200 && response.data.user) {
                    this.user = response.data.user;
                    this.token = response.data.token || null;

                    // ตรวจสอบข้อมูล token และ user
                    if (!this.token || !this.user) {
                        throw new Error('ข้อมูลผู้ใช้ไม่สมบูรณ์');
                    }

                    // จัดเก็บ token ใน localStorage ถ้าต้องการให้ใช้ใน session ถัดไป
                    localStorage.setItem("token", this.token);
                    return this.user;
                } else {
                    throw new Error('ไม่สามารถเข้าสู่ระบบได้');
                }
            } catch (error: any) {
                console.error("Login error:", error);
                throw new Error(error.response?.data?.message || "เข้าสู่ระบบไม่สำเร็จ");
            }
        },
        async logout() {
            try {
                await axios.post(
                    `${config.public.apiBase}/api/v1/logout`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${this.token}`,
                        },
                    }
                );
                this.user = null;
                this.token = null;
            } catch (error) {
                console.error("Logout error:", error);
            }
        },

        async register(newUser: User) {
            try {
                const formData = new FormData();
                formData.append("first_name", newUser.first_name);
                formData.append("last_name", newUser.last_name);
                formData.append("email", newUser.email);
                formData.append("password", newUser.password);
                formData.append("position_name", newUser.position_name);
                formData.append("phone", newUser.phone);

                if (newUser.image_url instanceof File) {
                    formData.append("image_url", newUser.image_url);
                } else {
                    formData.append("image_url", newUser.image_url);
                }

                const response = await axios.post(
                    `${config.public.apiBase}/api/v1/users/register`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: `Bearer ${this.token}`,
                        },
                    }
                );

                if (response.status === 200 && response.data.data) {
                    console.log("User registered:", response.data.data);
                    return response.data.data;
                } else {
                    console.error("Registration failed:", response.statusText);
                    return null;
                }
            } catch (error) {
                console.error("Register error:", error);
                throw error;
            }
        },
    },
});
