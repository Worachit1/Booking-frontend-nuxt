<script setup>
import { onMounted, ref, computed } from "vue";
import { defineProps, defineEmits } from "vue";
import { useBuildingStore } from "@/store/buildingStore";
import { useBuilding_RoomStore } from "~/store/building_roomStore";
import { useUserRoleStore } from "~/store/userRoleStore";
import { useUserStore } from "@/store/userStore";
import { useRoute } from "vue-router";

const route = useRoute();
const userId = route.params.id || localStorage.getItem("user_id");

// const userStore = useUserStore();
const props = defineProps({
  isSidebarOpen: Boolean,
});

const emit = defineEmits(["toggleSidebar"]);

const buildingStore = useBuildingStore();
const building_roomStore = useBuilding_RoomStore();
const userRoleStore = useUserRoleStore();

const buildings = computed(() => buildingStore.buildings);
const building_rooms = computed(() => building_roomStore.building_rooms);
const currentUserRole = computed(() => userRoleStore.currentUserRole);

const isRoomDropdownOpen = ref(false);
const openBuildingId = ref(null);

const toggleSidebar = () => {
  emit("toggleSidebar");
  if (!props.isSidebarOpen) {
    window.scrollTo({ left: 200, behavior: "smooth" });
  }
};

const filteredRooms = (buildingId) => {
  return building_rooms.value.filter((br) => br.building_id === buildingId);
};
const openRoomId = ref(null);

const toggleRoom = (roomId) => {
  openRoomId.value = openRoomId.value === roomId ? null : roomId;
};


const isAdmin = computed(() => currentUserRole.value?.[0]?.role_name === "Admin");
const isRoleLoaded = ref(false);

onMounted(async () => {
  await buildingStore.fetchBuildings();
  await building_roomStore.fetchBuilding_Rooms();

  const userId = localStorage.getItem("user_id");
  if (userId) {
    await userRoleStore.getUserRoleById(userId);
    isRoleLoaded.value = true;
  }
});

</script>

<template>
  <div :class="['sidebar', { open: props.isSidebarOpen }]">
    <button @click="toggleSidebar" class="toggle-btn">
     <i
      v-if="!props.isSidebarOpen"
      class="fa-solid fa-bars"
      style="font-size: 24px; color: whitesmoke"
    ></i>
      <i
      v-else
      class="fa-solid fa-backward"
      style="font-size: 24px; color: whitesmoke"
    ></i>
    </button>

    <div v-if="props.isSidebarOpen" class="sidebar-content">
      <!-- โลโก้ -->
      <div>
        <a href="/" class="home-link-header">
          <img src="/public/images/logo_sidebar.png" alt="menu"
            style="width: 100px; height: 100px; object-fit: contain; margin-top: -15%" />
          <span style=" font-size: 16px">BOOKING ROOM</span>
        </a>
      </div>
      <br />

      <!-- หน้าหลัก -->
      <a href="/" class="home-link">
        <i class="fas fa-home  "></i> หน้าหลัก
      </a>

      <!-- เลือกห้อง Dropdown -->
      <div class="home-link" @click="isRoomDropdownOpen = !isRoomDropdownOpen" style="cursor: pointer">
        <i class="fas fa-map-pin  "></i> เลือกห้อง
        <i :class="isRoomDropdownOpen ? 'fas fa-chevron-up ml-2' : 'fas fa-chevron-down ml-2'"></i>
      </div>

      <!-- รายการอาคาร -->
      <ul v-if="isRoomDropdownOpen" class="dropdown-list">
        <li v-for="b in buildings" :key="b.id" class="dropdown-item">
          <div class="building-name" @click="openBuildingId = openBuildingId === b.id ? null : b.id">
            <i class="fa-solid fa-building  "></i> {{ b.name }}
            <i :class="openBuildingId === b.id
              ? 'fas fa-chevron-up'
              : 'fas fa-chevron-down'
              " />
          </div>
          <!-- รายการห้องในอาคาร -->
          <ul v-if="openBuildingId === b.id" class="dropdown-sub">
            <li v-for="room in filteredRooms(b.id)" :key="room.building_room_id" class="dropdown-sub-item">
              <!-- ชั้นแรก: ชื่อห้องที่กดเพื่อเปิด dropdown -->
              <div @click="toggleRoom(room.room_id)" class="room-link" style="cursor: pointer;">
                <i class="fa-solid fa-archway  "></i> {{ room.room_name }}
                <i :class="openRoomId === room.room_id ? 'fas fa-chevron-up ml-1' : 'fas fa-chevron-down ml-1'"></i>
              </div>

              <!-- ชั้นสอง: รายการภายใต้ห้องนั้น -->
              <ul v-if="openRoomId === room.room_id" class="dropdown-sub-sub">
                <li>
                  <router-link :to="`/user/bookings/bookingroom/${room.room_id}`" class="dropdown-sub-item" style="font-size: 12px;">
                    รายการจอง
                  </router-link>
                </li>
                <li>
                  <router-link :to="`/user/bookings/detailroom/${room.room_id}`" class="dropdown-sub-item" style="font-size: 12px;">
                    รายละเอียดห้อง
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>

      <a href="/user/bookings/createBooking" class="home-link">
        <i class="fas fa-edit  "></i> จองห้องประชุม
      </a>

      <!-- เฉพาะ Admin  เท่านั้น -->
      <div v-if="isRoleLoaded && isAdmin">
        <a href="/admin/buildings" class="home-link">
          <i class="fa-solid fa-pen-nib  "></i> จัดการอาคาร
        </a>
        <a href="/admin/rooms" class="home-link">
          <i class="fa-solid fa-pen-nib  "></i> จัดการห้อง
        </a>
        <a href="/admin/bookings" class="home-link">
          <i class="fas fa-receipt  "></i> รายการจองห้อง
        </a>
      </div>
      <div v-else>
        <a :href="`/user/bookings/history/${userId}`" class="home-link">
          <i class="fas fa-history  "></i> ประวัติการจอง
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 200px;
  background-color: #13131f;
  height: 150vh;
  position: fixed;
  left: 0;
  top: 10px;
  transform: translateX(-100%);
  transition: transform 0.75s ease;
  z-index: 1000;
}

.sidebar.open {
  transform: translateX(0);
}

.toggle-btn {
  position: absolute;
  top: 20px;
  left: 210px;
  background-color: #13131f;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 50px;
  z-index: 1100;
  margin-top: 20%;
}
.toggle-btn:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}

.sidebar-content {
  padding: 20px;
}

.home-link-header {
  display: block;
  margin-top: 25px;
  text-decoration: none;
  color: #ffffff;
  font-weight: bold;
}
.home-link-header:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}

.home-link {
  display: block;
  margin-top: 20px;
  text-decoration: none;
  color: #ffffff;
  font-weight: bold;
}

.dropdown-list {
  list-style: none;
  padding-left: 20px;
  margin-top: 5px;
  text-decoration: none;
  animation: fadeIn 0.2s ease-in-out;
}

.dropdown-item {
  margin: 5px 0;
  color: #ffffff;
  font-size: 16px;
  cursor: pointer;
  transition: 0.2s;
  text-decoration: none;
  animation: scaleIn 0.25s ease;
}

.dropdown-sub-item:hover,
.room-link:hover,
.home-link:hover,
.building-name:hover {
  text-decoration: none;
  /* color: #ffb347; */
  background: #e4e1e151;
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.dropdown-sub-item:active,
.room-link:active,
.home-link:active,
.building-name:active {
  color: #ffffff;
  background-color: #4a4a72;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.dropdown-sub {
  list-style: none;
  padding-left: 15px;
  margin-top: 5px;
  animation: fadeIn 0.2s ease-in-out;
}

.dropdown-sub-item {
  font-size: 16px;
  color: #ddd;
  margin-top: 4px;
  cursor: pointer;
  transition: 0.2s;
  text-decoration: none;
  animation: scaleIn 0.25s ease;
}


.room-link {
  text-decoration: none;
  color: inherit;
  font-size: 14px;
  margin-right: 20px;
}

.sidebar {
  transform: translateX(-100%);
  transition: transform 1s ease;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
</style>
