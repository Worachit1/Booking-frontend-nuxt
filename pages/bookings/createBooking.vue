<script setup>
import { ref, onMounted } from "vue";
import { useBookingStore } from "@/store/bookingStore";
import { useRoomStore } from "@/store/roomStore";
import { useBuildingStore } from "@/store/buildingStore";

const bookingStore = useBookingStore();
const roomStore = useRoomStore();
const buildingStore = useBuildingStore();
const Booking = ref({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    room_id: null,
    user_id: null,
    status: "Pending",
});

onMounted(async () => {
    await roomStore.fetchRooms();
    await buildingStore.fetchBuildings();
});

const handleCreateBooking = async () => {
    try {
        const data = {
            title: Booking.value.title,
            description: Booking.value.description,
            start_time: new Date(Booking.value.start_time).toISOString(), // แปลงให้เป็น ISO
            end_time: new Date(Booking.value.end_time).toISOString(),
            room_id: Booking.value.room_id,
            user_id: Booking.value.user_id,
            status: Booking.value.status,
        };


        const createBooking = await bookingStore.addBooking(data);
        window.location.href = "/"; // เปลี่ยนเส้นทางไปยังหน้ารายการการจองหลังจากสร้างการจองเสร็จ 
    } catch (error) {
        console.error("Error creating booking:", error);
        alert("เกิดข้อผิดพลาดในการสร้างการจอง");
    }
};
</script>

<template>
    <h2>จองห้อง</h2>
    <form @submit.prevent="handleCreateBooking">
        <div>
            <label for="title">ชื่อการจอง:</label>
            <input id="title" v-model="Booking.title" type="text" required />
        </div>
        <div>
            <label for="user_id">ผู้จอง:</label>
            <input id="user_id" v-model="Booking.user_id" type="text" required />
        </div>
        <div>
            <label for="description">คำอธิบาย:</label>
            <textarea id="description" v-model="Booking.description" required></textarea>
        </div>
        <div>
            <label for="start_time">เวลาเริ่มต้น:</label>
            <input id="start_time" v-model="Booking.start_time" type="datetime-local" required />
        </div>
        <div>
            <label for="end_time">เวลาสิ้นสุด:</label>
            <input id="end_time" v-model="Booking.end_time" type="datetime-local" required />
        </div>
        <div>
            <label for="room_id">ห้อง:</label>
            <select id="room_id" v-model="Booking.room_id" required>
                <option v-for="room in roomStore.rooms" :key="room.id" :value="room.id">
                    {{ room.name }}
                </option>
            </select>
        </div>
        <button type="submit">สร้างการจอง</button>
    </form>
</template>



<style scoped></style>