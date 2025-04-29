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
const showMoadal = ref(false);

onMounted(async () => {
    await roomStore.fetchRooms();
    await buildingStore.fetchBuildings();
});

const handleConfirm = async () => {
    if (!Booking.value.title.trim()) {
        alert("กรุณากรอกชื่อการจอง");
        return;
    }
    if (!Booking.value.room_id) {
        alert("กรุณาเลือกห้อง");
        return;
    }
    if (!Booking.value.start_time || !Booking.value.end_time) {
        alert("กรุณาเลือกวันและเวลา");
        return;
    }
    if (new Date(Booking.value.start_time) >= new Date(Booking.value.end_time)) {
        alert("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น");
        return;
    }

    showMoadal.value = true;
};

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
    } catch (error) {
        console.error("Error creating booking:", error);
        alert("เกิดข้อผิดพลาดในการสร้างการจอง");
    }

    showMoadal.value = false;
    Booking.value = {
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        room_id: null,
        user_id: null,
        status: "Pending",
    };
}

const handleCancel = () => {
    showMoadal.value = false; // ปิด modal
};

</script>

<template>
    <h2>จองห้อง</h2>
    <form @submit.prevent="handleConfirm">
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

        <div v-if="showMoadal" class="modal-overlay">
            <div class="modal-content">
                <h3>🧾รายละเอียกการจองประชุม</h3>
                <p>📋หัวข้อการประชุม</p>
                <p>{{ Booking.title }}</p>
                <p>📝คำอธิบาย</p>
                <p>{{ Booking.description }}</p>
                <p>🕓วันที่เริ่ม - สิ้นสุด กิจกรรม</p>
                <p>{{ Booking.start_time }} - {{ Booking.end_time }} น.</p>
                <p>🙋‍♂️ผู้จองห้องประชุม</p>
                <p>{{ Booking.user_id }}</p>
                <p>🏠ห้องประชุม</p>
                <p>{{roomStore.rooms.find(room => room.id === Booking.room_id)?.name}}</p>
                <button @click="handleCreateBooking">ยืนยัน</button>
                <button @click="handleCancel">ยกเลิก</button>
            </div>
        </div>

    </form>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 200%;
    background: rgba(192, 189, 189, 0.378);
    display: flex;
    align-items: center;
    justify-content: center;
    
}

.modal {
    background: #13131f;
    padding: 10px;
    border-radius: 8px;
    width: 200px;
    color: white;
    text-align: center;
    margin-top: -150px;
    
}

.modal-content {
    background: whitesmoke;
    padding: 20px;
    border-radius: 8px;
    width: 300px;
    color: #13131f;
    text-align: center;
    margin-top: -50px;
}
</style>


  