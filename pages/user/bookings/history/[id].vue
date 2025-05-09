<script setup>
import { useRoute } from "vue-router";
import { useBookingStore } from "@/store/bookingStore";
import { useUserStore } from "@/store/userStore";
import { ref, onMounted, computed } from "vue";
import dayjs from "dayjs";
import "dayjs/locale/th";

definePageMeta({
    middleware: ["load-user"],
});

const formatDate = (date) => {
    return dayjs(date).locale("th").format("D MMMM YYYY เวลา HH:mm น.");
};
const formatDateTime = (date) => {
    return dayjs(date * 1000)
        .locale("th")
        .format("D MMMM YYYY เวลา HH:mm:ss น.");
};

const route = useRoute();
const userId = route.params.id || localStorage.getItem("user_id");

const bookingStore = useBookingStore();
const userStore = useUserStore();
const bookings = ref([]);
const user = ref(null);

const showDeleted = ref(false);

onMounted(async () => {
    try {
        await bookingStore.getBookingByuserId(userId);
        bookings.value = bookingStore.bookings.sort(
            (a, b) => b.created_at - a.created_at
        );
        await userStore.getUserById(userId);
        user.value = userStore.currentUser;
    } catch (error) {
        console.error("Error fetching booking details:", error);
    }
});

const activeBookings = computed(() => {
    return bookings.value.filter((b) => !b.deleted_at || b.deleted_at === 0);
});

const deletedBookings = computed(() => {
    return bookings.value.filter((b) => b.deleted_at && b.deleted_at !== 0);
});

const statusClass = (status) => {
    return {
        "btn-pending": status === "Pending",
        "btn-approved": status === "Approved",
        "btn-cancel": status === "Cancel",
    };
};

const openModal = (booking) => {
    console.log("เปิด modal ของ booking:", booking);
};
</script>

<template>
    <div class="container my-5">
        <h3 class="mb-3">
            <i class="fas fa-calendar-check me-2"></i> ประวัติการจองของคุณ
        </h3>

        <!-- รายการที่ยังไม่ถูกลบ -->
        <div v-if="activeBookings.length">
            <table class="table table-bordered table-hover">
                <thead class="table-light">
                    <tr>
                        <th>วัน/เวลาที่จอง</th>
                        <th>เวลาเริ่ม</th>
                        <th>เวลาสิ้นสุด</th>
                        <th>สถานะ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(booking, index) in activeBookings" :key="index">
                        <td>{{ formatDateTime(booking.created_at) }}</td>
                        <td>{{ formatDate(booking.start_time) }}</td>
                        <td>{{ formatDate(booking.end_time) }}</td>
                        <td>
                            <button :class="statusClass(booking.status)"
                                :disabled="['Approved', 'Cancel'].includes(booking.status)" @click="openModal(booking)">
                                {{ booking.status }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else class="alert alert-info">ไม่มีรายการจองในขณะนี้</div>

        <!-- ปุ่มแสดงรายการที่ถูกลบ -->
        <div class="form-check form-switch my-4">
            <input class="form-check-input" type="checkbox" id="showDeletedSwitch" v-model="showDeleted" />
            <label class="form-check-label" for="showDeletedSwitch">
                แสดงรายการที่ถูกลบไปแล้ว
            </label>
        </div>

        <!-- รายการที่ถูกลบ -->
        <div v-if="showDeleted && deletedBookings.length">
            <h5 class="mb-3">รายการที่ถูกลบไปแล้ว</h5>
            <table class="table table-bordered table-hover">
                <thead class="table-light">
                    <tr>
                        <th>วัน/เวลาที่จอง</th>
                        <th>เวลาเริ่ม</th>
                        <th>เวลาสิ้นสุด</th>
                        <th>สถานะ</th>
                        <th>ลบเมื่อ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(booking, index) in deletedBookings" :key="'deleted-' + index">
                        <td>{{ formatDateTime(booking.created_at) }}</td>
                        <td>{{ formatDate(booking.start_time) }}</td>
                        <td>{{ formatDate(booking.end_time) }}</td>
                        <td>
                            <button :class="statusClass(booking.status)" disabled>
                                {{ booking.status }}
                            </button>
                        </td>
                        <td>{{ formatDate(booking.deleted_at) }}</td>
                    </tr>
                </tbody>
            </table>
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
    background-color: #f9f9f9;
    transition: background-color 0.3s ease;
}

button {
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
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
</style>
