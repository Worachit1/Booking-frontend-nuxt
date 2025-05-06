<script setup>
import { ref, onMounted } from "vue";
import { useRoomStore } from "@/store/roomStore";
import { useBuildingStore } from "@/store/buildingStore";
import { useBuilding_RoomStore } from "~/store/building_roomStore";
definePageMeta({
  middleware: ["load-user"] // Corrected middleware name
});

// Removed unused import for useRoute

const roomStore = useRoomStore();
const buildingStore = useBuildingStore();
const building_roomStore = useBuilding_RoomStore();

const Room = ref({
  name: "",
  description: "",
  capacity: 1,
  image_url: "", // ใช้สำหรับ preview รูป
  imageFile: null, // ไฟล์จริง ใช้ส่งไป backend
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
  <div class="row-1">
    <div style="margin-top: 10px">
      <img
        :src="Room.image_url || '/images/default-picture.png'"
        alt="Room Image"
        width="350"
        class="image-preview"
      />
      <div class="input-image">
        <input
          id="fileInput"
          type="file"
          @change="handleImageUpload"
          accept="image/*"
          class="file-hidden"
        />
        <label for="fileInput" class="upload-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="svg-icon"
            width="20"
            height="20"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          เพิ่มรูป
        </label>
      </div>
    </div>

    <div class="form-right">
      <div class="room-and-building">
        <div>
          <p><strong>ชื่อห้อง:</strong></p>
          <input type="text" v-model="Room.name" placeholder="ชื่อห้อง" />
        </div>
        <div>
          <p><strong>อาคาร:</strong></p>
          <select v-model="Room.building_id">
            <option disabled value="">-- เลือกอาคาร --</option>
            <option
              v-for="building in buildings"
              :key="building.id"
              :value="building.id"
            >
              {{ building.name }}
            </option>
          </select>
        </div>
      </div>

      <div style="margin-top: 15px">
        <p><strong>จำนวนคนที่เข้าประชุมได้:</strong></p>
        <input type="number" v-model="Room.capacity" min="1" />
      </div>

      <div style="margin-top: 15px">
        <p><strong>รายละเอียดห้องประชุม:</strong></p>
        <input
          type="text"
          v-model="Room.description"
          placeholder="คำอธิบาย"
          class="input-description"
        />
      </div>
      <button @click="handleCreate" class="create-room">สร้างห้อง</button>
    </div>
  </div>
</template>

<style scoped>
.title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: bold;
  margin-top: 15px;
}

.title svg {
  vertical-align: middle;
}

/* ตกแต่งนิดหน่อย */
div {
  margin-bottom: 1rem;
}

button {
  padding: 0.5rem 1rem;
}

.file-hidden {
  /* ซ่อนไฟล์ input อย่างแนบเนียน */
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
  z-index: -1;
}

.upload-button {
  display: inline-block;
  padding: 5px 5px;
  background-color: #3b82f6;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.upload-button:hover {
  background-color: #2563eb;
}

.image-preview {
  display: flex;
  align-items: center;
  border: 1px solid #000;
  border-radius: 10px;
  padding: 10px;
  box-shadow: #ccc 0px 0px 40px;
  margin-left: 10px;
}

.input-image {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  margin-left: 150px;
}

.row-1 {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  justify-content: flex-start;
  border: #8e8d8d49 1px solid;
  box-shadow: #ccc 0px 0px 40px;
  border-radius: 5px;
  padding: 20px;
  box-sizing: border-box; /* ทำให้ border และ padding นับรวมกับขนาดของ container */
}

.image-preview {
  display: flex;
  align-items: center;
  border: 1px solid #000;
  border-radius: 10px;
  padding: 10px;
  box-shadow: #ccc 0px 0px 40px;
  margin-left: 10px;
  max-width: 400px;
  max-height: 400px;
  object-fit: cover;
  overflow: hidden;
}

.input-image {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  margin-left: 150px;
}

.file-hidden {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
  z-index: -1;
}

.upload-button {
  display: inline-block;
  padding: 5px 5px;
  background-color: #3b82f6;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.upload-button:hover {
  background-color: #2563eb;
}

.room-and-building {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 15px;
}

.room-and-building input,
.room-and-building select {
  width: 168px;
}

.input-description {
  width: 360px;
}

ิbody {
  padding: 10px;
}
input,
select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 0.5rem 1rem;
  align-self: flex-start; /* วางปุ่มที่ขวาสุด */
  margin-top: 20px; /* เพิ่มระยะห่างจากฟอร์ม */
}
.create-room {
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
  padding: 10px 20px;
  margin-left: 140px;
  margin-top: 150px;
}
.create-room:hover {
  background-color: #388e3c;
}

.form-right {
  margin-left: 15px;
}

.vue-cropper {
  max-width: 350px;
  max-height: 350px;
  border-radius: 10px;
}
</style>
