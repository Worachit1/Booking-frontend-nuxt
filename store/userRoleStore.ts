// import axio from "axios";
// import { defineStore } from "pinia";

// const config = useRuntimeConfig()

// interface UserRole {
//     id: string;
//     user_id: string;
//     role_id: string;
// }

// export const useUserRoleStore = defineStore("userRole", {
//     state: () => ({
//         userRoles: [] as UserRole[],
//     }),
//     actions: {
//         async addUserRole(newUserRole: UserRole) {
//             try {
//                 const response = await axio.post(`${config.public.apiBase}/api/v1/roles/create`, newUserRole);
//                 if (response.status === 200) {
//                     console.log("User role added successfully:", response.data.data);
//                     return response.data;
//                 } else {
//                     console.error("Error adding user role:", response.statusText);
//                 }
//             } catch (error) {
//                 console.error("Error adding user role:", error);
//             }
//         }
//     },
// });