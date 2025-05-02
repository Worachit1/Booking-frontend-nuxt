<script setup>
import { onMounted, computed } from "vue";
import { useUserStore } from "@/store/userStore";
import { useRoute } from "vue-router";

const route = useRoute();
const userId = route.params.id; // รับ ID จาก URL

const token = localStorage.getItem("token"); // รับ token จาก localStorage
if (!token) {
  console.error("Token is missing. Please log in again.");
  // Redirect to login page or show an error message
}
const userStore = useUserStore();
console.log("userId:", userId); // ✅ ต้องไม่เป็น undefined
console.log("token:", token); // ✅ ต้องไม่เป็น undefined


onMounted(async () => {
  if (userId) {
    await userStore.getUserById(userId); // ดึงข้อมูลผู้ใช้จาก store
  }
});

const user = computed(() => userStore.currentUser || null);
</script>

<template>
  <div v-if="user">
    <h1>ข้อมูลผู้ใช้</h1>
    <p>ชื่อ: {{ user.first_name }} {{ user.last_name }}</p>
    <p>อีเมล: {{ user.email }}</p>
    <img :src="user.image_url || '/images/default-profile.jpg'" alt="Profile Image" @error="handleImageError"/>
  </div>
  <div v-else>
    <p>กำลังโหลดข้อมูล...</p>
  </div>
</template>
