<script setup>
import { useRoute } from "vue-router";
import { useRoomStore } from "@/store/roomStore";
import { useBuilding_RoomStore } from "@/store/building_roomStore";
import { ref, onMounted } from "vue";
definePageMeta({
  middleware: ["load-user"] // Corrected middleware name
});

const route = useRoute();
const roomId = route.params.id;
const roomStore = useRoomStore();
const buildingRoomStore = useBuilding_RoomStore();
const buildingRoom = ref(null);

onMounted(async () => {
    try {
        await roomStore.getById(roomId); 
        // Fetch building room details
        console.log("Fetching room details for ID:", roomId);
        buildingRoom.value = await buildingRoomStore.getByRoomId(roomId);
    } catch (error) {
        console.error("Error fetching room details:", error);
    }
});
</script>

<template>
    <div class="room-details-container">
        <!-- แถวบนสุด -->
        <div class="header-row">
            <h1>🏠 รายละเอียดห้อง</h1>
            <h2>ห้อง:{{ buildingRoom?.room_name }} {{ buildingRoom?.building_name ? 'อาคาร:' + buildingRoom.building_name : '' }}</h2>
        </div>

        <!-- รูปภาพตรงกลาง -->
        <div class="image-container">
            <img :src="buildingRoom?.image_url || '/images/default-room.jpg'" alt="Room Image" />
        </div>

        <!-- แถวล่างที่มีรายละเอียด -->
        <div class="info-row">
            <div class="info-box">รายละเอียด : {{ buildingRoom?.description }}</div>
            <div class="info-box">จำนวนที่เข้าได้ : {{ buildingRoom?.capacity }} คน</div>
        </div>

        <!-- ปุ่ม -->
        <div class="button-row">
            <button class="button-calendar" @click="$router.push('/')">ไปยังหน้าปฏิทินการจอง</button>
            <button class="button-back" @click="$router.back()">กลับ</button>
        </div>
    </div>
</template>

<style scoped>
.room-details-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.image-container {
    text-align: center;
    margin-bottom: 24px;
}

.image-container img {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
}

.info-box {
    background-color: #f5f5f5;
    padding: 12px 20px;
    border-radius: 8px;
    flex: 1;
    margin: 0 10px;
    text-align: center;
    font-weight: bold;
}

.button-row {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}
.button-calendar {
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}
.button-calendar:hover {
    background-color: #45a049;
    transition: background-color 0.3s ease;
}

.button-back {
    background-color: #f44336;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}
.button-back:hover {
    background-color: #e53935;
    transition: background-color 0.3s ease;
}
</style>