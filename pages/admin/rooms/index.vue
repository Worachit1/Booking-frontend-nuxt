<script setup>
import { ref, onMounted } from "vue";
import { useRoomStore } from "@/store/roomStore";
import { useBuildingStore } from "@/store/buildingStore";
import { useRouter } from "vue-router";


const router = useRouter();
definePageMeta({
  middleware: ["load-user"] // Corrected middleware name
});


const roomStore = useRoomStore();
const buildingStore = useBuildingStore();

const rooms = ref([]);
const buildings = ref([]);


const selectedRoom = ref(null);

const fetchRooms = async () => {
  await roomStore.fetchRooms();
  rooms.value = roomStore.rooms;
};

const fetchBuildings = async () => {
  await buildingStore.fetchBuildings();
  buildings.value = buildingStore.buildings;
};

const handleDeleteRoom = async (roomId) => {
  try {
    await roomStore.deleteRoom(roomId);
    alert("ลบห้องเรียบร้อยแล้ว");
    await fetchRooms();
  } catch (error) {
    console.error("ลบไม่สำเร็จ:", error);
    alert("เกิดข้อผิดพลาดในการลบห้อง");
  } finally {
    showModal.value = false;
    selectedRoom.value = null;
  }
};

const goTodetail = (id) => {
  router.push(`/admin/rooms/detail/${id}`);
};

onMounted(async () => {
  await fetchBuildings();
  await fetchRooms();
});
</script>

<template>
  <h1>รายการห้องประชุม</h1>
  <div class="container">
    <div class="row">
      <div class="col-md-12">
        <div class="header-actions">
          <button class="btn-create" @click="router.push('/admin/rooms/createRoom')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="svg-icon" width="20px" height="20px">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            เพิ่มห้อง
          </button>
        </div>
        <table class="table table-bordered table-striped" v-if="rooms.length">
          <thead>
            <tr>
              <th>ชื่อห้อง</th>
              <th>คำอธิบาย</th>
              <th>ความจุ</th>
              <th>รูปภาพ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="room in rooms" :key="room.id">
              <td>{{ room.name }}</td>
              <td>{{ room.description }}</td>
              <td>{{ room.capacity }}</td>
              <td>
                <img :src="room.image_url" alt="room" width="100" height="100" />
              </td>
              <td>
                <button class="btn-edit" @click="goTodetail(room.id)">ดูข้อมูล</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else>ไม่มีห้องประชุมในระบบ</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin: 20px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
}

tr:hover {
  background-color: #f1f1f1;
}

img {
  border-radius: 6px;
  object-fit: cover;
}

button {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  color: white;
}

.btn-create {
  background-color: #39e65e;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  gap: 5px;
  transition: background-color 0.3s;
  border: 1px solid #13131f;;
}

.header-actions {
  display: flex;
  justify-content: flex-end; 
  margin-bottom: 20px;
}

.btn-create:hover {
  background-color: #4cae4c;
}

.btn-edit {
  background-color: #5bc0de;
}

.btn-edit:hover {
  background-color: #31b0d5;
}

.btn-cancel {
  background-color: #f06666;
}

.btn-cancel:hover {
  background-color: #d9534f;
}

.btn-close {
  background-color: #f3c735;
}

.btn-close:hover {
  background-color: #d8ba6f;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(61, 60, 60, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: whitesmoke;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  width: 400px;
}

.modal-actions button {
  margin: 10px;
}


</style>