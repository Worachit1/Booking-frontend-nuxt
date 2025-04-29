import axios from "axios";
import { defineStore } from "pinia";

const config = useRuntimeConfig()

interface User {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    position_name: string;
    phone: string;
    image_url: File | string; // image_url จะเป็นไฟล์หรือ URL ก็ได้
}

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null,
        token: null,
    }),
    actions: {
        async login(email: string, password: string) {
            try {
                const response = await axios.post(`${config.public.apiBase}/api/v1/login`, { email, password });
                if (response.status === 200) {
                    this.user = response.data.user;
                    this.token = response.data.token;
                    console.log("Login successful:", this.user);
                } else {
                    console.error("Error logging in:", response.statusText);
                }
            } catch (error) {
                console.error("Error logging in:", error);
            }
        },
        async logout() {
            try {
                const response = await axios.post(`${config.public.apiBase}/api/v1/logout`, {}, { headers: { Authorization: `Bearer ${this.token}` } });
                if (response.status === 200) {
                    this.user = null;
                    this.token = null;
                    console.log("Logout successful");
                } else {
                    console.error("Error logging out:", response.statusText);
                }
            } catch (error) {
                console.error("Error logging out:", error);
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
                formData.append("image_url", newUser.image_url); // image_url จะเป็นไฟล์หรือ URL ก็ได้

                if(newUser.image_url instanceof File) {
                    formData.append("image_url", newUser.image_url);
                }
                else {
                    // ถ้าเป็น URL (rare case) ก็ส่งไป
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
                if (response.status === 200) {
                    console.log("User added successfully:", response.data.data);
                    return response.data;
                }
                else {
                    console.error("Error adding user:", response.statusText);
                    return null;
                }
            } catch (error) {
                console.error("Error adding user:", error);
            }
        }
    },
});