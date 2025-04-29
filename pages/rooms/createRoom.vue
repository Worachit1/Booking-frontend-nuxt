<script setup>
import { ref, onMounted } from "vue";
import { useRoomStore } from "@/store/roomStore";
import { useBuildingStore } from "@/store/buildingStore";
import { useBuilding_RoomStore } from "@/store/building_roomStrore"; 
// Removed unused import for useRoute

const roomStore = useRoomStore();
const buildingStore = useBuildingStore();
const building_roomStore = useBuilding_RoomStore();

const Room = ref({
  name: "",
  description: "",
  capacity: 1,
  image_url: "",     // ใช้สำหรับ preview รูป
  imageFile: null,   // ไฟล์จริง ใช้ส่งไป backend
  building_id: null,
});

const buildings = ref([]);

onMounted(async () => {
  await buildingStore.fetchBuildings();
  buildings.value = buildingStore.buildings;
});

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    Room.value.imageFile = file;
    Room.value.image_url = URL.createObjectURL(file); // Preview รูป
  }
};

const handleCreate = async () => {
  if (!Room.value.name.trim()) {
    alert("กรุณากรอกชื่อห้อง");
    return;
  }
  if (!Room.value.building_id) {
    alert("กรุณาเลือกอาคาร");
    return;
  }
  if (!Room.value.imageFile) {
    alert("กรุณาเลือกไฟล์รูปภาพ");
    return;
  }

  const createdRoom = await roomStore.addRoom({
    name: Room.value.name,
    description: Room.value.description,
    capacity: Room.value.capacity,
    image_url: Room.value.imageFile, // สำคัญ! ส่งไฟล์
  });

  if (createdRoom && createdRoom.data && createdRoom.data.ID) {
    await building_roomStore.addBuilding_Room({
      roomId: createdRoom.data.ID,
      buildingId: Room.value.building_id,
    });

    alert("สร้างห้องสำเร็จ!");
    window.location.href = "/rooms";
  } else {
    alert("สร้างห้องไม่สำเร็จ");
  }

  // Reset
  Room.value = {
    name: "",
    description: "",
    capacity: 1,
    image_url: "",
    imageFile: null,
    building_id: null,
  };
};

</script>

<template>
  <div>
    <h2>สร้างห้องใหม่</h2>
    <div>
      <input type="text" v-model="Room.name" placeholder="ชื่อห้อง" />
    </div>

    <div>
      <input type="text" v-model="Room.description" placeholder="คำอธิบาย" />
    </div>

    <div>
      <input type="number" v-model="Room.capacity" min="1" />
    </div>

    <div>
      <input type="file" @change="handleImageUpload" accept="image/*" />
      <div v-if="Room.image_url">
        <p>ตัวอย่างรูป:</p>
        <img :src="Room.image_url" alt="Room Image" width="150" />
      </div>
    </div>

    <div>
      <select v-model="Room.building_id">
        <option disabled value="">-- เลือกอาคาร --</option>
        <option v-for="building in buildings" :key="building.id" :value="building.id">
          {{ building.name }}
        </option>
      </select>
    </div>

    <button @click="handleCreate">สร้างห้อง</button>
  </div>
</template>

<style scoped>
/* ตกแต่งนิดหน่อย */
div {
  margin-bottom: 1rem;
}
button {
  padding: 0.5rem 1rem;
}
</style>
