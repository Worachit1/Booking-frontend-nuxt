<script setup>
import { onMounted, ref, computed } from "vue";
import { useBookingStore } from "@/store/bookingStore";
import { useUserStore } from "@/store/userStore";
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import "dayjs/locale/th";
definePageMeta({
  middleware: ["load-user"], // Corrected middleware name
});

const bookingStore = useBookingStore();
const bookings = computed(() => bookingStore.bookings);

const route = useRoute();
const userId = route.params.id || localStorage.getItem("user_id");
const userStore = useUserStore();
const user = computed(() => userStore.currentUser);

const formatDateTime = (date) => {
  const timestamp = date < 10000000000 ? date * 1000 : date; // ถ้าน้อยกว่า 10 หลัก → เป็น seconds
  return dayjs(timestamp).locale("th").format("D MMMM YYYY HH:mm:ss น.");
};

const statusClass = (status) => {
  return {
    "btn-pending": status === "Pending",
    "btn-approved": status === "Approved",
    "btn-cancel": status === "Canceled",
    "btn-finished": status === "Finished",
  };
};
const statusMap = {
  Pending: "กำลังรอ...",
  Approved: "อนุมัติการจองแล้ว",
  Canceled: "ปฏิเสธการจอง",
  Finished: "การจองสิ้นสุดแล้ว",
};

const allStatuses = Object.keys(statusMap);
const selectedStatuses = ref([...allStatuses]);
const filteredBookings = computed(() => {
  return bookings.value.filter(
    (b) =>
      (!b.deleted_at || b.deleted_at === 0) &&
      selectedStatuses.value.includes(b.status)
  );
});

const showModal = ref(false);
const selectedBooking = ref(null);

const handleUpdateStatus = async (bookingId, status) => {
  try {
    const updatedBooking = {
      status: status,
      approved_by: userId,
    };

    console.log("📦 Updating booking:", updatedBooking); // 🟡 ดูว่า approved_by มาไหม
    await bookingStore.updateStatusBooking(bookingId, updatedBooking);
    alert("อัปเดตสถานะเรียบร้อยแล้ว");
    window.location.reload();
  } catch (error) {
    console.error("❌ Error updating booking status:", error);
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

  await userStore.fetchUsers(); // ดึง user ทั้งหมด

  // สร้าง Map user_id => ชื่อ
  const userMap = {};
  userStore.users.forEach((user) => {
    userMap[user.id] = `${user.first_name} ${user.last_name}`;
  });

  // ผูกชื่อให้ booking
  bookings.value.forEach((booking) => {
    if (booking.approved_by) {
      booking.approved_by_name = userMap[booking.approved_by] || null;
    }
  });

  user.value = userStore.currentUser;
});
</script>

<template>
  <h1 style="margin-left: 5px;"><i class="fa-solid fa-book-open mr-2"></i> รายการจองห้องประชุม</h1>
  <div class="container">
    <div class="row">
      <div class="col-md-12">
        <!-- ตัวกรองสถานะ -->
        <div class="status-filter mb-3">
          <label class="filter-title">กรองตามสถานะ:</label>
          <div class="status-option" v-for="status in allStatuses" :key="status">
            <input class="custom-checkbox" type="checkbox" :id="status" :value="status" v-model="selectedStatuses" />
            <label class="custom-label" :for="status">
              {{ statusMap[status] }}
            </label>
          </div>
        </div>


        <table class="table table-bordered table-striped" v-if="bookings && filteredBookings.length">
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
            <tr v-for="booking in filteredBookings" :key="booking.id">
              <td>{{ formatDateTime(booking.created_at) }}</td>
              <td>{{ booking.user_name }} {{ booking.user_lastname }}</td>
              <td>{{ booking.room_name }}</td>
              <td>{{ formatDateTime(booking.start_time) }}</td>
              <td>{{ formatDateTime(booking.end_time) }}</td>
              <td>
                <button :class="statusClass(booking.status)" :disabled="booking.status === 'Approved' ||
                  booking.status === 'Canceled' ||
                  booking.status === 'Finished'
                  " @click="openModal(booking)">
                  {{ booking.status }}
                </button>
              </td>
              <td>
                <span v-if="booking.approved_by_name">
                  {{ booking.approved_by_name }}
                </span>
                <span v-else>ยังไม่ได้อนุมัติ</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else><br />ไม่มีการจองในขณะนี้</div>
      </div>
    </div>
  </div>

  <!-- แสดง Modal สำหรับการอัพเดทสถานะการจอง -->
  <div v-if="showModal" class="modal">
    <div class="modal-content">
      <h3>คุณต้องการอนุมัติ หรือ ปฏิเสธการจองนี้ใช่หรือไม่?</h3>
      <p>
        ผู้จอง: {{ selectedBooking?.user_name }}
        {{ selectedBooking?.user_lastname }}
      </p>
      <p>ห้องที่จอง: {{ selectedBooking?.room_name }}</p>
      <div class="modal-actions">
        <button @click="handleUpdateStatus(selectedBooking.id, 'Approved')" class="btn-approved">
          อนุมัติ
        </button>
        <button @click="handleUpdateStatus(selectedBooking.id, 'Canceled')" class="btn-cancel">
          ปฏิเสธ
        </button>
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

h1 {
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
  background-color: #4caf50;
  border-color: #4caf50;
}

.custom-checkbox:checked::after {
  content: "✔";
  color: white;
  font-size: 12px;
  position: absolute;
  top: 0;
  left: 3px;
}

.custom-checkbox:hover {
  border-color: #999;
}

.custom-label {
  cursor: pointer;
  font-size: 14px;
  color: #444;
  user-select: none;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
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
  background-color: #f1f1f1;
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
  background-color: #f9c749;
  color: white;
  cursor: pointer;
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
  text-decoration: line-through;
}

.btn-cancel:hover {
  background-color: #d9534f;
  transition: background-color 0.3s ease;
}

.btn-finished {
  background-color: #6c757d;
  color: white;
  text-decoration: line-through;
}

.btn-finished:hover {
  background-color: #5a6268;
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
