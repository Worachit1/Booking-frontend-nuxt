<script setup>
import { ref, onMounted } from "vue";
import { useBookingStore } from "@/store/bookingStore";
import { useRoomStore } from "@/store/roomStore";
import { useBuildingStore } from "@/store/buildingStore";
import dayjs from "dayjs";
import "dayjs/locale/th";

const bookingStore = useBookingStore();
const roomStore = useRoomStore();
const buildingStore = useBuildingStore();
const Booking = ref({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    phone: "",
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
            phone: Booking.value.phone,
            status: Booking.value.status,
        };

        const createBooking = await bookingStore.addBooking(data);
        if (createBooking) {
            alert("สร้างการจองสำเร็จ");
        } else {
            alert("ไม่สามารถสร้างการจองได้");
        }
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
        phone: "",
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
    <div class="container">
        <h2 class="h2">จองห้องประชุม</h2>
        <form @submit.prevent="handleConfirm" class="booking-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="title">หัวข้อการประชุม:</label>
                    <input id="title" v-model="Booking.title" type="text" required />
                </div>
                <div class="form-group">
                    <label for="start_time">วันเวลาเริ่มจอง:</label>
                    <input id="start_time" v-model="Booking.start_time" type="datetime-local" required />
                </div>
                <div class="form-group">
                    <label for="end_time">วันเวลาสิ้นสุดการจอง:</label>
                    <input id="end_time" v-model="Booking.end_time" type="datetime-local" required />
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="room_id">ห้องที่จอง:</label>
                    <select id="room_id" v-model="Booking.room_id" required>
                        <option v-for="room in roomStore.rooms" :key="room.id" :value="room.id">
                            {{ room.name }}
                        </option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="user_id">ผู้ที่จองห้องประชุม:</label>
                    <input id="user_id" v-model="Booking.user_id" type="text" required />
                </div>
                <div class="form-group">
                    <label for="phone">เบอร์ติดต่อ:</label>
                    <input id="phone" v-model="Booking.phone" type="text" required />
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="description">รายละเอียดการประชุม:</label>
                    <textarea id="description" v-model="Booking.description" required></textarea>
                </div>
            </div>

            <button type="submit" class="create">สร้างการจอง</button>

            <!-- Modal -->
            <div v-if="showMoadal" class="modal-overlay">
                <div class="modal-content">
                    <h3 class="modal-title">🧾 รายละเอียดการจองประชุม</h3>

                    <div class="modal-section">
                        <p><strong>📋 หัวข้อการประชุม:</strong></p>
                        <p class="detail">{{ Booking.title }}</p>
                    </div>

                    <div class="modal-section">
                        <p><strong>📝 รายละเอียดการประชุม:</strong></p>
                        <p class="detail">{{ Booking.description }}</p>
                    </div>

                    <div class="modal-section">
                        <p><strong>🕓 วันที่เริ่ม - สิ้นสุด กิจกรรม:</strong></p>
                        <p class="detail">{{ dayjs(Booking.start_time).format("DD/MM/YYYY HH:mm") }} น.</p>
                        <p class="detail">{{ dayjs(Booking.end_time).format("DD/MM/YYYY HH:mm") }} น.</p>
                        
                    </div>

                    <div class="modal-section">
                        <p><strong>🙋‍♂️ ผู้จองห้องประชุม:</strong></p>
                        <p class="detail">{{ Booking.user_id }}</p>
                    </div>

                    <div class="modal-section">
                        <p><strong>📞 เบอร์ติดต่อ:</strong></p>
                        <p class="detail">{{ Booking.phone }}</p>
                    </div>

                    <div class="modal-section">
                        <p><strong>🏠 ห้องประชุม:</strong></p>
                        <p class="detail">{{roomStore.rooms.find(room => room.id === Booking.room_id)?.name}}</p>
                    </div>

                    <div class="modal-buttons">
                        <button @click="handleCreateBooking" class="confirm">ยืนยันการจอง</button>
                        <button @click="handleCancel" class="cancel">ยกเลิก</button>
                    </div>
                </div>
            </div>

        </form>
    </div>
</template>

<style scoped>
.container {
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin: 20px auto;
    max-width: 800px;
}

.h2 {
    color: #13131f;
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
    font-weight: bold;
    margin-right: 650px;
}

.booking-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.form-row {
    display: flex;
    gap: 20px;
    justify-content: space-between;
}

.form-group {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.form-group label {
    margin-bottom: 5px;
    font-weight: bold;
}

input,
select,
textarea {
    padding: 8px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

textarea {
    height: 100px;
}

.create {
    padding: 10px 20px;
    background-color: #39E65E;
    color: white;
    border: none;
    border-radius: 9px;
    cursor: pointer;
    margin-top: 20px;
    width: 20%;
    align-self: center;
}

.create:hover {
    background-color: #2b9f3c;
    transition: background-color 0.3s;
}


.modal-buttons {
    display: flex;
    justify-content: flex-end;
    /* ดันไปด้านขวาสุด */
    gap: 20px;
    /* ระยะห่างระหว่างปุ่ม */
    margin-top: 20px;
}

.confirm {
    background-color: #04bd35;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}
.confirm:hover {
    background-color: #039d2b;
    transition: background-color 0.3s;
}

.cancel {
    background-color: #ff4d4d;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}
.cancel:hover {
    background-color: #e63939;
    transition: background-color 0.3s;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 120%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background-color: whitesmoke;
    padding: 24px 32px;
    border-radius: 12px;
    color: #13131f;
    width: 500px;
    max-width: 90%; 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25); 
    text-align: left;
    overflow-y: auto;
    max-height: 90vh; 
    
}


.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
}

.modal-section {
  margin-bottom: 12px;
  line-height: 1.5;
}

.detail{
    text-indent: 3em;
}

</style>