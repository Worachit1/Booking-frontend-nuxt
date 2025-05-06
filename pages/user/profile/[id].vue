<script setup>
import { onMounted, computed } from "vue";
import { useUserStore } from "@/store/userStore";
import { useUserRoleStore } from "~/store/userRoleStore";
import { useRoute } from "vue-router";

const route = useRoute();
const userId = route.params.id || localStorage.getItem("user_id");

const userStore = useUserStore();
const userRoleStore = useUserRoleStore();

const user = computed(() => userStore.currentUser || null);
const userRole = computed(() => userRoleStore.currentUserRole || null);

onMounted(async () => {
  if (!localStorage.getItem("reloaded")) {
    localStorage.setItem("reloaded", "true");
    window.location.reload();
  } else {
    localStorage.removeItem("reloaded");
    if (userId) {
      await userStore.getUserById(userId);
    }
  }
});
</script>


<template>
  <div v-if="user">
    <h1>ข้อมูลผู้ใช้</h1>
    <p>ชื่อ: {{ user.first_name }} {{ user.last_name }}</p>
    <p>อีเมล: {{ user.email }}</p>
    <img :src="user.image_url || '/images/default-profile.jpg'" alt="Profile Image" @error="handleImageError" />

    <!-- แสดง role_name ของผู้ใช้ -->
    <div v-if="userRole && Array.isArray(userRole)">
      <p v-for="role in userRole" :key="role.id">บทบาท: {{ role.role_name }}</p>
    </div>

  </div>
  <div v-else>
    <p>กำลังโหลดข้อมูล...</p>
  </div>
</template>
