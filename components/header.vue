<script setup>
import { onMounted, computed } from "vue";
import { useUserStore } from "@/store/userStore";

const userStore = useUserStore();
const userId = localStorage.getItem("user_id");
console.log("userId:", userId); // ✅ ต้องไม่เป็น undefined


onMounted(async () => {
  if (userId) {
    await userStore.getUserById(userId); // ดึงข้อมูลผู้ใช้โดยใช้ user_id
  }
});

const user = computed(() => userStore.currentUser || null); // ใช้ currentUser จาก store
const userProfileImage = computed(() =>
  user.value?.image_url || "/images/default-profile.jpg"
);
const userFirstName = computed(() => user.value?.first_name || "Guest");
const userLastName = computed(() => user.value?.last_name || "User");
</script>

<template>
  <div class="header">
    <div class="profile">
      <img :src="userProfileImage" alt="Profile" class="profile-image" />
      <div class="profile-name">{{ userFirstName }} {{ userLastName }}</div>
    </div>
  </div>
</template>

<style scoped>
.header {
  width: 100%;
  height: 50px;
  background-color: #13131f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* ชิดขวา */
  padding: 0 20px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
}

.profile {
  display: flex;
  align-items: center;
}

.profile-image {
  width: 32px;
  height: 32px;
  border-radius: 50%; /* ทำให้เป็นวงกลม */
  object-fit: cover;
  margin-right: 20px;
}

.profile-name {
  font-size: 16px;
  font-weight: bold;
  margin-right: 50px;
}

.profile-image:hover {
  cursor: pointer;
  transform: scale(1.1); /* ขยายขนาดเมื่อ hover */
  transition: transform 0.3s ease; /* เพิ่มการเคลื่อนไหว */
}

.profile-name:hover {
  cursor: pointer;
  color: #04bd35; /* เปลี่ยนสีเมื่อ hover */
  transition: color 0.3s ease; /* เพิ่มการเคลื่อนไหว */
}
</style>
