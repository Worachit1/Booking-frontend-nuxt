<script setup>
import { onMounted, ref, computed } from "vue";
import { useBookingStore } from "@/store/bookingStore";
import { useUserStore } from "@/store/userStore";
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import "dayjs/locale/th";
definePageMeta({
  middleware: ["load-user"] // Corrected middleware name
});


const bookingStore = useBookingStore();
const bookings = computed(() => bookingStore.bookings);

const userStore = useUserStore();
const route = useRoute();
const userId = route.params.id || localStorage.getItem("user_id");


const formatDateTime = (date) => {
  const timestamp = date < 10000000000 ? date * 1000 : date; // ถ้าน้อยกว่า 10 หลัก → เป็น seconds
  return dayjs(timestamp).locale("th").format("D MMMM YYYY HH:mm:ss น.");
};

const statusClass = (status) => {
    return {
        'btn-pending': status === 'Pending',
        'btn-approved': status === 'Approved',
        'btn-cancel': status === 'Cancel'
    };
};
const showModal = ref(false);
const selectedBooking = ref(null);

const handleUpdateStatus = async (bookingId, status) => {
    try {
        const updatedBooking = {
            status: status
        };
        await bookingStore.updateStatusBooking(bookingId, updatedBooking);
        alert("อัปเดตสถานะเรียบร้อยแล้ว");
        window.location.reload(); // รีเฟรชหน้าเพื่อแสดงการเปลี่ยนแปลง
    } catch (error) {
        console.error("Error updating booking status:", error);
        alert("เกิดข้อผิดพลาดในการอัปเดต");
    } finally {
        showModal.value = false;
        selectedBooking.value = null;
    }
};


const openModal = (booking) => {
    selectedBooking.value = booking;
    showModal.value = true;
};



onMounted(async () => {
    await bookingStore.fetchBookings();
    bookings.value = bookingStore.bookings;
    
});

</script>

<template>
    <h1>รายการ การจองห้องประชุม</h1>
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <table class="table table-bordered table-striped" v-if="bookings && bookings.length">
                    <thead>
                        <tr>
                            <th>วัน / เวลา ที่จอง</th>
                            <th>ผู้จอง</th>
                            <th>ห้องที่จอง</th>
                            <th>เวลาเริ่มจอง</th>
                            <th>เวลาสิ้นสุดจอง</th>
                            <th>สถานะ</th>
                            <th>อนุมัติการจองโดย</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- แสดงการจอง  -->
                        <tr v-for="booking in bookings" :key="booking.id">
                            <td>{{ formatDateTime(booking.created_at) }}</td>
                            <td>{{ booking.user_name }} {{ booking.user_lastname }}</td>
                            <td>{{ booking.room_name }} </td>
                            <td>{{ formatDateTime(booking.start_time) }}</td>
                            <td>{{ formatDateTime(booking.end_time) }}</td>
                            <td>
                                <button :class="statusClass(booking.status)"
                                    :disabled="booking.status === 'Approved' || booking.status === 'Cancel'"
                                    @click="openModal(booking)">
                                    {{ booking.status }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-else>ไม่มีการจองในขณะนี้</div>
            </div>
        </div>
    </div>

    <!-- แสดง Modal สำหรับการอัพเดทสถานะการจอง -->
    <div v-if="showModal" class="modal">
        <div class="modal-content">
            <h3>คุณต้องการอนุมัติ หรือ ปฏิเสธการจองนี้ใช่หรือไม่?</h3>
            <p>ผู้จอง: {{ selectedBooking?.user_name }} {{ selectedBooking?.user_lastname }}</p>
            <p>ห้องที่จอง: {{ selectedBooking?.room_name }}</p>
            <div class="modal-actions">
                <button @click="handleUpdateStatus(selectedBooking.id, 'Approved')"
                    class="btn-approved">อนุมัติ</button>
                <button @click="handleUpdateStatus(selectedBooking.id, 'Cancel')" class="btn-cancel">ปฏิเสธ</button>
                <button @click="showModal = false" class="btn-close">ปิด</button>
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
    transition: background-color 0.3s ease;
}
button {
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    color: white;
}
.btn-pending {
  background-color: #F9C749;
  color: white;
}
.btn-pending:hover {
    background-color: #d8ba6f;
    transition: background-color 0.3s ease;
}

.btn-approved {
  background-color: #73ea8d;
  color: white;
}
.btn-approved:hover {
    background-color: #5bcf6b;
    transition: background-color 0.3s ease;
}

.btn-cancel {
  background-color: #f06666;
  color: white;
}
.btn-cancel:hover {
    background-color: #d9534f;
    transition: background-color 0.3s ease;
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

.btn-close {
    background-color: #f3c735;
    color: white;
}
.btn-close:hover {
    background-color: #d8ba6f;
    transition: background-color 0.3s ease;
}

</style>