// middleware/loadUser.ts
import { useUserStore } from "@/store/userStore";
import { useUserRoleStore } from "@/store/userRoleStore";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const userStore = useUserStore();
  const userRoleStore = useUserRoleStore();

  const userId = Array.isArray(to.params.id) ? to.params.id[0] : to.params.id || localStorage.getItem("user_id");

  if (!userId) {
    console.warn("❗ ไม่มี user_id, redirect ไป login");
    return navigateTo("/login");
  }

  // ถ้ายังไม่มีข้อมูลใน store ให้โหลดใหม่
  if (!userStore.currentUser || userStore.currentUser.id !== userId) {
    if (typeof userId === "string") {
      await userStore.getUserById(userId);
    }
  }

  if (!userRoleStore.currentUserRole || userRoleStore.currentUserRole.length === 0) {
    await userRoleStore.getUserRoleById(userId);
  }
});
