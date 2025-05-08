<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { useUserRoleStore } from "@/store/userRoleStore";
import { useBookingStore } from "~/store/bookingStore";
import loginmodal from "@/components/loginModal.vue";
import registerModal from "@/components/registerModal.vue";

import { useRoute } from "vue-router";

import dayjs from "dayjs";
import "dayjs/locale/th";
const formatDate = (date) => {
  return dayjs(date).locale("th").format("D MMMM YYYY เวลา HH:mm น.");
};

// const route = useRoute();
const userStore = useUserStore();
const authStore = useAuthStore();
const bookingStore = useBookingStore();
const userRoleStore = useUserRoleStore();
const userId = localStorage.getItem("user_id");

const user = computed(() => userStore.currentUser);
const isLoading = computed(() => userStore.isLoading);
const isLoggedIn = computed(() => !!user.value?.id);

const userProfileImage = computed(
  () => user.value?.image_url || "/images/default-profile.png"
);
const userFirstName = computed(() =>
  isLoading.value ? "กำลังโหลด..." : user.value?.first_name || "Guest"
);
const userLastName = computed(() =>
  isLoading.value ? "" : user.value?.last_name || "User"
);

const showMenu = ref(false);
const profileWrapperRef = ref(null);
const isModalOpenLogin = ref(false);
const isModalOpenRegister = ref(false);
const bookingsDropdownRef = ref(null);
const currentUserRole = computed(() => userRoleStore.currentUserRole);
const showBookings = ref(false);

// กรองเฉพาะการจองที่มีสถานะ Pending ของ Admin
const pendingBookings = computed(() => {
  if (currentUserRole.value?.[0]?.role_name === "Admin") {
    const filteredBookings = bookingStore.bookings.filter(
      (booking) => booking.status === "Pending"
    );
    // console.log("Pending Bookings:", filteredBookings); // ตรวจสอบรายการที่กรองแล้ว
    return filteredBookings;
  }
  return [];
});

// กรองเฉพาะการจองที่มีสถานะ Approved และ Cancel ของ User
const statusUserBookings = computed(() => {
  if (currentUserRole.value?.[0]?.role_name !== "Admin") {
    return bookingStore.bookings.filter(
      (booking) =>
        booking.user_id === userId &&
        (booking.status === "Approved" || booking.status === "Cancel")
    );
  }
  return [];
});

// สำหรับจุดแดงกระดิ่ง Admin
const hasPendingBookings = computed(() =>
  currentUserRole.value?.[0]?.role_name === "Admin"
    ? pendingBookings.value.length > 0
    : false
);
// สำหรับจุดแดงกระดิ่ง User
const hasUserBookings = computed(() =>
  currentUserRole.value?.[0]?.role_name !== "Admin"
    ? statusUserBookings.value.length > 0
    : false
);

function toggleBookings() {
  showBookings.value = !showBookings.value;
}
function closeBookings() {
  showBookings.value = false;
}

function handleProfileClick() {
  showMenu.value = !showMenu.value;
}

function closeMenu() {
  showMenu.value = false;
}

function handleClickProfileOutside(event) {
  if (
    profileWrapperRef.value &&
    !profileWrapperRef.value.contains(event.target)
  ) {
    closeMenu();
  }
}

function handleClickBookingOutside(event) {
  if (
    bookingsDropdownRef.value &&
    !bookingsDropdownRef.value.contains(event.target) &&
    !event.target.closest(".bell")
  ) {
    closeBookings();
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
    window.location.href = "/"; // Redirect to home page after logout
  } catch (error) {
    console.error("Logout failed:", error);
  }
  showMenu.value = false;
}

onMounted(async () => {
  document.addEventListener("click", handleClickBookingOutside);
  document.addEventListener("click", handleClickProfileOutside);

  const userId = localStorage.getItem("user_id");

  if (userId) {
    await userRoleStore.getUserRoleById(userId);
    await bookingStore.fetchBookings(); // โหลด booking ทุกกรณี
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickBookingOutside);
  document.removeEventListener("click", handleClickProfileOutside);
});
</script>

<template>
  <div v-if="!isLoading" class="header">
    <div class="profile-wrapper" ref="profileWrapperRef">
      <div class="profile">
        <!-- กระดิ่ง -->
        <div class="bell" @click="toggleBookings">
          <i class="fas fa-bell"></i>
          <span v-if="hasPendingBookings || hasUserBookings" class="notification-dot"></span>
        </div>

        <div
          v-if="showBookings"
          class="bookings-dropdown"
          ref="bookingsDropdownRef"
        >
          <!-- Admin -->
          <ul v-if="currentUserRole[0]?.role_name === 'Admin'">
            <router-link to="/admin/bookings" class="view-all-link">
              <li
                v-for="(booking, index) in pendingBookings"
                :key="index"
                class="booking"
              >
                <p class="room_name">{{ booking.room_name }}</p>
                <p>
                  จองโดย: {{ booking.user_name }} {{ booking.user_lastname }}
                </p>
                <p>
                  {{ formatDate(booking.start_time) }} ถึง
                  {{ formatDate(booking.end_time) }}
                </p>
                <p>------------------------------</p>
              </li>
            </router-link>
          </ul>

          <!-- User -->
          <ul v-else>
            <li
              v-for="(booking, index) in statusUserBookings"
              :key="index"
              class="booking"
            >
              <p class="room_name">{{ booking.room_name }}</p>
              <p
                :class="{
                  'text-green': booking.status === 'Approved',
                  'text-red': booking.status === 'Cancel',
                }"
              >
                {{
                  booking.status === "Approved"
                    ? "การจองของคุณได้รับการอนุมัติแล้ว"
                    : "การจองของคุณถูกปฏิเสธ"
                }}
              </p>
              <p>
                {{ formatDate(booking.start_time)}} ถึง<br>
                {{ formatDate(booking.end_time)}}
              </p>
              <p>------------------------------</p>
            </li>
          </ul>
        </div>

        <img
          :src="userProfileImage"
          alt="Profile"
          class="profile-image"
          @click="handleProfileClick"
        />
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

  <loginmodal
    v-if="isModalOpenLogin"
    @close="isModalOpenLogin = false"
    @open-register="
      () => {
        isModalOpenLogin = false;
        isModalOpenRegister = true;
      }
    "
  />
  <registerModal
    v-if="isModalOpenRegister"
    @close="isModalOpenRegister = false"
    @open-login="
      () => {
        isModalOpenRegister = false;
        isModalOpenLogin = true;
      }
    "
  />
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
  margin-top: 10px;
  background-color: #2a2a3c;
  border-radius: 8px;
  padding: 10px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  min-width: 150px;
  z-index: 10000;
  color: #e0e0e0;
  margin-right: 25px;
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
  background-color: #f0f0f07a;
}

.bookings-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background-color: #2a2a3c;
  border-radius: 8px;
  padding: 10px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  min-width: 257px;
  max-height: 350px;
  /* Limit the height */
  overflow-y: auto;
  /* Enable vertical scrolling */
  z-index: 10000;
  color: #e0e0e0;
  margin-right: 30px;
}

.bookings-dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.bookings-dropdown li {
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.bookings-dropdown li:hover {
  background-color: #f0f0f07a;
  color: white;
}

.view-all-link {
  text-decoration: none;
  color: #e0e0e0;
  font-weight: bold;
  display: block;
}

.text-green {
  color: #04bd35;
}
.text-red {
  color: #f44336;
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

.bell {
  font-size: 20px;
  margin-right: 30px;
  cursor: pointer;
  position: relative;
  transition: transform 0.3s ease;
}

.bell:hover {
  transform: scale(1.3);
  transition: transform 0.3s ease;
}

.notification-dot {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 10px;
  height: 10px;
  background-color: red;
  border-radius: 50%;
  border: 2px solid white;
}

.room_name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 5px;
}
</style>
