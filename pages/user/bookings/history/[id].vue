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

const formatDateTime = (date) => {
  const timestamp = date < 10000000000 ? date * 1000 : date;
  return dayjs(timestamp).locale("th").format("D MMMM YYYY HH:mm:ss น.");
};

const route = useRoute();
const userId = route.params.id || localStorage.getItem("user_id");

const bookingStore = useBookingStore();
const userStore = useUserStore();
const bookings = ref([]);
const user = ref(null);

const statusMap = {
  Pending: "กำลังรอ...",
  Approved: "ได้รับอนุมัติการจองแล้ว",
  Canceled: "ถูกปฏิเสธการจอง",
  Finished: "การจองสิ้นสุดแล้ว",
};

const allStatuses = Object.keys(statusMap);
const selectedStatuses = ref([...allStatuses]);

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

const filteredBookings = computed(() => {
  return bookings.value.filter(
    (b) =>
      (!b.deleted_at || b.deleted_at === 0) &&
      selectedStatuses.value.includes(b.status)
  );
});

const statusClass = (status) => {
  return {
    "btn-pending": status === "Pending",
    "btn-approved": status === "Approved",
    "btn-cancel": status === "Canceled",
    "btn-finished": status === "Finished",
  };
};

const openModal = (booking) => {
  console.log("เปิด modal ของ booking:", booking);
};
</script>

<template>
  <div class="container my-5">
    <h2 class="mb-2">
      <i class="fa-solid fa-clock-rotate-left "></i> ประวัติการจองของคุณ
    </h2>

    <!-- ตัวกรองสถานะ -->
    <div class="status-filter mb-3">
      <label class="filter-title">กรองตามสถานะ:</label>
      <div class="status-option" v-for="status in allStatuses" :key="status">
        <input
          class="custom-checkbox"
          type="checkbox"
          :id="status"
          :value="status"
          v-model="selectedStatuses"
        />
        <label class="custom-label" :for="status">
          {{ statusMap[status] }}
        </label>
      </div>
    </div>

    <!-- รายการที่กรองแล้ว -->
    <div v-if="filteredBookings.length">
      <table class="table table-bordered table-hover">
        <thead class="table-light">
          <tr>
            <th>วัน/เวลาที่จอง</th>
            <th>ห้องที่จอง</th>
            <th>เวลาเริ่ม</th>
            <th>เวลาสิ้นสุด</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(booking, index) in filteredBookings" :key="index">
            <td>{{ formatDateTime(booking.created_at) }}</td>
            <td>{{ booking.room_name }}</td>
            <td>{{ formatDateTime(booking.start_time) }}</td>
            <td>{{ formatDateTime(booking.end_time) }}</td>
            <td>
              <button
                :class="statusClass(booking.status)"
                :disabled="['Approved', 'Canceled'].includes(booking.status)"
                @click="openModal(booking)"
              >
                {{ statusMap[booking.status] }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="alert alert-info">ไม่มีรายการจองในขณะนี้</div>
  </div>
</template>

<style scoped>
.container {
  margin: 20px;
}

.mb-2{
  text-decoration: underline;
}

.status-filter {
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  display: inline-block;
}

.filter-title {
  font-weight: bold;
  margin-bottom: 8px;
  display: block;
  color: #333;
  font-size: 16px;
}

.status-option {
  display: inline-flex;
  align-items: center;
  margin-right: 16px;
  margin-bottom: 8px;
}

.custom-checkbox {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #ccc;
  border-radius: 4px;
  margin-right: 8px;
  position: relative;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.custom-checkbox:checked {
  background-color: #13131f;
  border-color: #13131f;
}

.custom-checkbox:checked::after {
  content: "✔";
  color: white;
  font-size: 12px;
  position: absolute;
  top: -2%;
  left: 3px;
}

.custom-checkbox:hover {
  border-color: #999;
}

.custom-label {
  cursor: pointer;
  font-size: 14px;
  color: #13131f;
  user-select: none;
  font-weight: bold;
}


table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
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
  background-color: #3d3c3c31;
  color: #13131f;
  font-weight: bold;
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
  color: rgb(255, 239, 239);
}

.btn-pending {
  background-color: #f9c749;
}
.btn-pending:hover {
  background-color: #d8ba6f;
  transition: background-color 0.3s ease;
}

.btn-approved {
  background-color: #73ea8d;
}
.btn-approved:hover {
  background-color: #5bcf6b;
  transition: background-color 0.3s ease;
}

.btn-cancel {
  background-color: #f06666;
}
.btn-cancel:hover {
  background-color: #d9534f;
  transition: background-color 0.3s ease;
}

.btn-finished {
  background-color: #6c757d;
}
.btn-finished:hover {
  background-color: #5a6268;
  transition: background-color 0.3s ease;
}
</style>
