import axios from "axios";
import { defineStore } from "pinia";

const config = useRuntimeConfig()



export const useUserStore = defineStore("user", {
    state: () => ({  
        users: [],
    }),
    actions: {
        async fetchUsers() {
            try {
                const response = await axios.get(`${config.public.apiBase}/api/v1/users/list`);
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
        async fetchUserById(user_id: string) {
            try {
                const response = await axios.get(`${config.public.apiBase}/api/v1/users/${user_id}`);
                
                // ตรวจสอบ status และการมีอยู่ของข้อมูล
                if (response.status === 200 && response.data && response.data.data) {
                    this.users = response.data.data;
                    console.log("User fetchedById successfully:", this.users);
                } else {
                    console.error("Error fetching user:", response.statusText || 'No data found');
                }
            } catch (error) {
                // จัดการข้อผิดพลาดจากการร้องขอ API
                console.error("Error fetching user:", error);
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