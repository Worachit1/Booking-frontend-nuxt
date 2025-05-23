// middleware/loadUser.ts
import { useUserStore } from "@/store/userStore";

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (!process.client) return;

  const userStore = useUserStore();
  const userId = localStorage.getItem("user_id");

  if (!userId) {
    if (to.path !== "/") {
      alert("กรุณาเข้าสู่ระบบก่อน");
      return navigateTo("/");
    }
    return;
  }

  if (!userStore.currentUser || userStore.currentUser.id !== userId) {
    try {
      await userStore.getUserById(userId);
    } catch (err) {
      console.error("โหลด user ไม่สำเร็จ:", err);
    }
  }
});
