<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useRoomStore } from "@/store/roomStore";
import { useBuildingStore } from "~/store/buildingStore";
import { useBuilding_RoomStore } from "@/store/building_roomStrore"; 


const route = useRoute();
const roomId = route.params.id; // รับ ID จาก URL
const roomStore = useRoomStore();
const buildingId = route.params.buildingId; // รับ ID ของอาคารจาก URL
const buildingStore = useBuildingStore();
const building_roomStore = useBuilding_RoomStore(); // Store สำหรับการเชื่อมโยงห้องและอาคาร

const room = ref(null);

onMounted(async () => {
  try {
    // 1. ดึงข้อมูลห้อง
    room.value = await roomStore.getById(roomId);

    // 2. หา building_id จาก store ที่เชื่อม room กับ building
    const link = await building_roomStore.getByRoomId(roomId); // 👈 เขียน method นี้ใน store

    if (link && link.building_id) {
      const building = await buildingStore.getById(link.building_id);
      if (building) {
        room.value.building = building;
      } else {
        console.error("Building not found");
      }
    } else {
      console.error("Building-Room link not found");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});
</script>

<template>
    <div>
        <h1>รายละเอียดห้อง</h1>
        <div v-if="room">
            <h2>ชื่อห้อง: {{ room.name }} อาคาร: {{ room.building?.name || 'ไม่พบข้อมูลอาคาร' }}</h2>
            <p>คำอธิบาย: {{ room.description }}</p>
            <p>ความจุของห้อง: {{ room.capacity }}</p>
            <img :src="room.image_url || '/images/default-room.jpg'" alt="Room Image" style="max-width: 400px; border-radius: 8px;" />
        </div>
    </div>
</template>

<style scoped>
</style>
