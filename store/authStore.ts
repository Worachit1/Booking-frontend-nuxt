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
                    { withCredentials: true }
                );

                console.log("Login Response:", response.data);

                const user = response.data.user;
                const token = response.data.token;

                if (!user || !token) {
                    throw new Error("ข้อมูลผู้ใช้ไม่สมบูรณ์");
                }

                // จัดเก็บ token ใน localStorage ถ้าต้องการให้ใช้ใน session ถัดไป
                localStorage.setItem("token", token);
                localStorage.setItem("user_id", user.id);
                localStorage.setItem("user_email", user.email);
                localStorage.setItem("user_first_name", user.first_name);
                localStorage.setItem("user_last_name", user.last_name);
                localStorage.setItem("user_image_url", user.image_url);
                localStorage.setItem("user_position", user.position_id); 

                this.user = user;
                this.token = token;

                localStorage.setItem("token", token);
                console.log("Token saved to localStorage:", token);
                return user;
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
                console.log("Logout successfully");
                this.user = null;
                this.token = null;

                localStorage.removeItem("token");
                localStorage.removeItem("user_id");
                localStorage.removeItem("user_email");
                localStorage.removeItem("user_first_name");
                localStorage.removeItem("user_last_name");
                localStorage.removeItem("user_image_url");
                localStorage.removeItem("user_position");
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
