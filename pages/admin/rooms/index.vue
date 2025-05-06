<script setup>
import { ref, onMounted } from "vue";
import { useRoomStore } from "@/store/roomStore";
import { useBuildingStore } from "@/store/buildingStore";
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
  // Redirect to the detail page of the room
  window.location.href = `/admin/rooms/detail/${id}`;
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
th, td {
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