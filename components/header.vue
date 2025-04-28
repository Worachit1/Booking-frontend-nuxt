<template>
    <div class="header">
      <div class="profile">
        <!-- รูปโปรไฟล์ -->
        <img :src="userProfileImage" alt="Profile" class="profile-image" />
  
        <!-- ชื่อ-นามสกุล -->
        <div class="profile-name">{{ userFirstName }} {{ userLastName }}</div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  // สมมติว่าโหลดจากระบบ auth หรือ store จริง ๆ จะดึงมาจาก store หรือ api
  const userProfileImage = ref("/images/default-profile.jpg"); // path รูป default หรือจากฐานข้อมูล
  const userFirstName = ref("Dunk");
  const userLastName = ref("112233");
  </script>
  
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
  