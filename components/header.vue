<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import loginmodal from '@/components/loginModal.vue';
import registerModal from '@/components/registerModal.vue';

const userStore = useUserStore();
const authStore = useAuthStore();
const user = computed(() => userStore.currentUser);
const isLoading = computed(() => userStore.isLoading);
const isLoggedIn = computed(() => !!user.value?.id);


const userProfileImage = computed(() =>
  user.value?.image_url || '/images/default-profile.png'
);
const userFirstName = computed(() =>
  isLoading.value ? 'กำลังโหลด...' : user.value?.first_name || 'Guest'
);
const userLastName = computed(() =>
  isLoading.value ? '' : user.value?.last_name || 'User'
);

const showMenu = ref(false);
const profileWrapperRef = ref(null);
const isModalOpenLogin = ref(false);
const isModalOpenRegister = ref(false);

function handleProfileClick() {
  showMenu.value = !showMenu.value;
}

function closeMenu() {
  showMenu.value = false;
}

function handleClickOutside(event) {
  if (
    profileWrapperRef.value &&
    !profileWrapperRef.value.contains(event.target)
  ) {
    closeMenu();
  }
}

function openLoginModal() {
  isModalOpenLogin.value = true; // เปิด modal login

}
function openRegisterModal() {
  isModalOpenRegister.value = true; // เปิด modal register
}

async function logout() {
  try {
    await authStore.logout();
    closeMenu();
    window.location.reload();
    window.location.href = '/'; // Redirect to home page after logout
  } catch (error) {
    console.error('Logout failed:', error);
  }
  showMenu.value = false;
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div v-if="!isLoading" class="header">
    <div class="profile-wrapper" ref="profileWrapperRef">
      <div class="profile">
        <img :src="userProfileImage" alt="Profile" class="profile-image" @click="handleProfileClick" />
        <div class="profile-name" @click="handleProfileClick">
          {{ userFirstName }} {{ userLastName }}
        </div>
      </div>

      <div v-if="showMenu" class="dropdown-menu">
        <ul>
          <template v-if="isLoggedIn">
            <li @click="viewProfile">ดูโปรไฟล์</li>
            <li @click="logout">ออกจากระบบ</li>
          </template>
          <template v-else>
            <li @click="openLoginModal">เข้าสู่ระบบ</li>
            <li @click="openRegisterModal">สมัครสมาชิก</li>
          </template>

        </ul>
      </div>
    </div>
  </div>

  <loginmodal v-if="isModalOpenLogin" @close="isModalOpenLogin = false" @open-register="() => {
    isModalOpenLogin = false;
    isModalOpenRegister = true;
  }" />
  <registerModal v-if="isModalOpenRegister" @close="isModalOpenRegister = false" @open-login="() => {
    isModalOpenRegister = false;
    isModalOpenLogin = true;
  }" />

</template>
<style scoped>
.header {
  width: 100%;
  height: 50px;
  background-color: #13131f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
}

.profile-wrapper {
  position: relative;
}

.profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 35px;
}

.profile-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.profile-image:hover {
  border: 2px solid #fff;
  transition: border 0.3s ease;
}

.profile-name {
  font-size: 16px;
  font-weight: bold;
  margin-right: 10px;
}

.profile-name:hover {
  color: #767474;
  transition: color 0.3s ease;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background-color: whitesmoke;
  border-radius: 6px;
  padding: 10px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 10000;
  color: #000;
  margin-right: 20px;
}

.dropdown-menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dropdown-menu li {
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.dropdown-menu li:hover {
  background-color: #f0f0f0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #04bd35;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #5ef684;
}

.error {
  margin-top: 1rem;
  color: red;
}

.close-btn {
  margin-top: 10px;
  background-color: #f44336;
  border: none;
  color: white;
}
</style>
