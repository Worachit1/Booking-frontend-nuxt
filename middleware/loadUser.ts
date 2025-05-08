// middleware/loadUser.ts
import { useUserStore } from "@/store/userStore";
import { useUserRoleStore } from "@/store/userRoleStore";

import { useRoute, useRouter } from 'vue-router';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const userStore = useUserStore();
  const userRoleStore = useUserRoleStore();

  const userId =
    Array.isArray(to.params.id)
      ? to.params.id[0]
      : to.params.id || localStorage.getItem("user_id");

  if (!userId) {
    console.warn("⚠️ ไม่พบ user_id — redirect ไปหน้า /");

    // ✅ หยุด redirect ถ้าอยู่ที่หน้า "/" อยู่แล้ว
    if (to.path !== "/") {
      alert("กรุณาเข้าสู่ระบบก่อน");
      return navigateTo("/");
    }
    return; // อย่า redirect ซ้ำ
  }

  // โหลด user ถ้ายังไม่มี
  if (!userStore.currentUser || userStore.currentUser.id !== userId) {
    try {
      await userStore.getUserById(userId);
    } catch (err) {
      console.error("โหลด user ไม่สำเร็จ:", err);
    }
  }

  // โหลด role ถ้ายังไม่มี
  if (
    !userRoleStore.currentUserRole ||
    userRoleStore.currentUserRole.length === 0
  ) {
    try {
      await userRoleStore.getUserRoleById(userId);
    } catch (err) {
      console.error("โหลด role ไม่สำเร็จ:", err);
    }
  }
});
