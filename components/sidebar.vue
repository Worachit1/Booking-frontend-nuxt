<script setup>
import { onMounted, ref } from "vue";
import { defineProps, defineEmits } from "vue";
import { useBuildingStore } from "@/store/buildingStore";
import { useBuilding_RoomStore } from "~/store/building_roomStrore";


const buildingStore = useBuildingStore();
const buildings = computed(() => buildingStore.buildings);

const building_roomStore = useBuilding_RoomStore();
const building_rooms = computed(() => building_roomStore.building_rooms);

onMounted(async () => {
  await buildingStore.fetchBuildings();
  await building_roomStore.fetchBuilding_Rooms();
});


const props = defineProps({
  isSidebarOpen: Boolean,
});

const emit = defineEmits(["toggleSidebar"]);

const toggleSidebar = () => {
  emit("toggleSidebar");
  if (!props.isSidebarOpen) {
    window.scrollTo({ left: 200, behavior: "smooth" });
  }
};

const isRoomDropdownOpen = ref(false);
const openBuildingId = ref(null);

// ฟังก์ชันกรองห้องเฉพาะของอาคารที่เปิดอยู่
const filteredRooms = (buildingId) => {
  return building_rooms.value.filter((br) => br.building_id === buildingId);
};
</script>

<template>


  <div :class="['sidebar', { open: props.isSidebarOpen }]">
    <button @click="toggleSidebar" class="toggle-btn">
      <img v-if="!props.isSidebarOpen" src="/public/images/logo_sidebar(2).png" alt="menu"
        style="width: 30px; height: 30px; object-fit: cover" />
      <img v-else src="/public/images/sildebar_back.png" alt="back"
        style="width: 30px; height: 30px; object-fit: cover" />
    </button>

    <div v-if="props.isSidebarOpen" class="sidebar-content">
      <!-- โลโก้ -->
      <div>
        <a href="/" class="home-link">
          <img src="/public/images/logo_sidebar.png" alt="menu"
            style="width: 100px; height: 100px; object-fit: contain; margin-top: -15%" />
          <span style="font-family: Arial, sans-serif; font-size: 16px">BOOKING ROOM</span>
        </a>
      </div>
      <br />

      <!-- หน้าหลัก -->
      <a href="/" class="home-link">
        <i class="fas fa-home mr-2"></i> หน้าหลัก
      </a>

      <!-- เลือกห้อง Dropdown -->
      <div class="home-link" @click="isRoomDropdownOpen = !isRoomDropdownOpen" style="cursor: pointer">
        <i class="fas fa-door-open mr-2"></i> เลือกห้อง
        <i :class="isRoomDropdownOpen ? 'fas fa-chevron-up ml-2' : 'fas fa-chevron-down ml-2'"></i>
      </div>

      <!-- รายการอาคาร -->
      <ul v-if="isRoomDropdownOpen" class="dropdown-list">
        <li v-for="b in buildings" :key="b.id" class="dropdown-item">
          <div @click="openBuildingId = openBuildingId === b.id ? null : b.id">
            🏢 {{ b.name }}
            <i :class="openBuildingId === b.id ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" />
          </div>

          <!-- แสดงห้องเฉพาะเมื่อคลิกอาคาร -->
          <ul v-if="openBuildingId === b.id" class="dropdown-sub">
            <li v-for="room in filteredRooms(b.id)" :key="room.building_room_id" class="dropdown-sub-item"
              style="font-size: 16px;">
              <router-link :to="`/bookings/room/${room.room_id}`" class="room-link">
                🏠 {{ room.room_name }}
              </router-link>
            </li>
          </ul>
        </li>
      </ul>

      <!-- <a href="/" class="home-link">
        <i class="fas fa-calendar-check mr-2"></i> จองห้องประชุม
      </a> -->
      <a href="/buildings" class="home-link">
        <i class="fas fa-calendar-check mr-2"></i> เพิ่มอาคาร
      </a>
      <a href="/rooms" class="home-link">
        <i class="fas fa-calendar-check mr-2"></i> เพิ่มห้อง
      </a>
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

.sidebar-content {
  padding: 20px;
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

}

.dropdown-item {
  margin: 5px 0;
  color: #ffffff;
  font-size: 16px;
  cursor: pointer;
  transition: 0.2s;
  text-decoration: none;

}

.dropdown-item:hover {
  text-decoration: underline;
}

.dropdown-sub {
  list-style: none;
  padding-left: 15px;
  margin-top: 5px;
}

.dropdown-sub-item {
  font-size: 16px;
  color: #ddd;
  margin-top: 4px;
  cursor: pointer;
  transition: 0.2s;
  text-decoration: none;
}

.room-link {
  text-decoration: none;
  color: inherit; 
}

.sidebar {
  transform: translateX(-100%);
  transition: transform 1s ease;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
</style>
