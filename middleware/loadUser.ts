// middleware/loadUser.ts
import { useUserStore } from "@/store/userStore";
import { useUserRoleStore } from "@/store/userRoleStore";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const userStore = useUserStore();
  const userRoleStore = useUserRoleStore();

  const userId =
    Array.isArray(to.params.id) ? to.params.id[0] : to.params.id || localStorage.getItem("user_id");

  if (!userId) {
    console.warn("⚠️ ไม่พบ user_id — จะไม่ redirect เพราะอาจเป็น guest");
    return; // ✅ แค่ return ออก ไม่ redirect
  }

  // โหลดข้อมูล user ถ้ายังไม่มี
  if (!userStore.currentUser || userStore.currentUser.id !== userId) {
    try {
      await userStore.getUserById(userId);
    } catch (err) {
      console.error("โหลด user ไม่สำเร็จ:", err);
    }
  }

  // โหลด role ด้วยถ้าจำเป็น
  if (!userRoleStore.currentUserRole || userRoleStore.currentUserRole.length === 0) {
    try {
      await userRoleStore.getUserRoleById(userId);
    } catch (err) {
      console.error("โหลด role ไม่สำเร็จ:", err);
    }
  }
});
