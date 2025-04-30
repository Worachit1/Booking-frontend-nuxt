import axios from "axios";
import { defineStore } from "pinia";

const config = useRuntimeConfig();
const token = localStorage.getItem("token") || null; // ดึง token จาก localStorage
const headers = token ? { Authorization: `Bearer ${token}` } : {}; // ถ้ามี token ให้แนบไปใน header


export const useUserStore = defineStore("user", {
    state: () => ({
        users: [] as any[], // Explicitly define the type of users
        currentUser: null as any, // เก็บข้อมูลผู้ใช้ที่ถูกดึงมา
    }),
    actions: {
        async fetchUsers() {
            try {
                const response = await axios.get(`${config.public.apiBase}/api/v1/users/list`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // ส่ง token ใน header
                        },
                    }
                );
                if (response.status === 200) {
                    this.users = response.data.data;
                    console.log("Users fetched successfully:", this.users);
                } else {
                    console.error("Error fetching users:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        },

        async getUserById(user_id: string) {
            try {
                const response = await axios.get(`${config.public.apiBase}/api/v1/users/${user_id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // ส่ง token ใน header
                        },
                    }
                );
                if (response.status === 200) {
                    this.currentUser = response.data.data; // เก็บข้อมูลผู้ใช้ใน store
                    // console.log("User fetched successfully:", this.currentUser);
                    return this.currentUser; // ส่งกลับข้อมูลผู้ใช้
                } else {
                    console.error("Error fetching user:", response.statusText);
                    return null; // หากไม่พบข้อมูลผู้ใช้
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                return null; // หากเกิดข้อผิดพลาด
            }
        },

        async addUser(newUser: any) {
            try {
                const formData = new FormData();
                formData.append("first_name", newUser.first_name);
                formData.append("last_name", newUser.last_name);
                formData.append("email", newUser.email);
                formData.append("password", newUser.password);
                formData.append("position_name", newUser.position_name);
                formData.append("phone", newUser.phone);
                formData.append("image_url", newUser.image_url); // image_url จะเป็นไฟล์หรือ URL ก็ได้

                const response = await axios.post(`${config.public.apiBase}/api/v1/users`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                if (response.status === 200) {
                    console.log("User added successfully:", response.data.data);
                    return response.data;
                } else {
                    console.error("Error adding user:", response.statusText);
                }
            } catch (error) {
                console.error("Error adding user:", error);
            }
        },

        async updateUser(user_id: string, updatedUser: any) {
            try {
                const formData = new FormData();
                formData.append("first_name", updatedUser.first_name);
                formData.append("last_name", updatedUser.last_name);
                formData.append("password", updatedUser.password);
                formData.append("phone", updatedUser.phone);
                formData.append("position_name", updatedUser.position_name);
                formData.append("image_url", updatedUser.image_url); // image_url จะเป็นไฟล์หรือ URL ก็ได้

                const response = await axios.put(`${config.public.apiBase}/api/v1/users/${user_id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`, // ส่ง token ใน header
                        "Content-Type": "multipart/form-data",
                    },
                });
                if (response.status === 200) {
                    console.log("User updated successfully:", response.data.data);
                    return response.data;
                } else {
                    console.error("Error updating user:", response.statusText);
                }
            } catch (error) {
                console.error("Error updating user:", error);
            }
        },
    },
});
