<script setup>
import { ref, computed, watch, onMounted } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import thLocale from "@fullcalendar/core/locales/th";
import { useBookingStore } from "@/store/bookingStore";
import { useRoomStore } from "@/store/roomStore";
import { useRoute, useRouter } from "vue-router";
import dayjs from "dayjs";
import "dayjs/locale/th";

definePageMeta({
  middleware: ["load-user"],
});

const formatDateTime = (date) => {
  const timestamp = date < 10000000000 ? date * 1000 : date; // ถ้าน้อยกว่า 10 หลัก → เป็น seconds
  return dayjs(timestamp).locale("th").format("D MMMM YYYY HH:mm:ss น.");
};


const route = useRoute();
const router = useRouter();
const roomId = ref(route.params.id);
const roomStore = useRoomStore();
const bookingStore = useBookingStore();

const roomName = ref("");
const rooms = ref([]);
const selectedRoomId = ref("");

const events = ref([]);
const calendarRef = ref(null);
const popupVisible = ref(false);
const selectedEvent = ref(null);
const searchDate = ref(null);

const loading = ref(false);
const loadedOnce = ref(false);

onMounted(async () => {
  await roomStore.fetchRooms();
  rooms.value = roomStore.rooms;
  await loadBookings();
});

const loadBookings = async () => {
  if (!roomId.value || loadedOnce.value) return;
  loading.value = true;

  await bookingStore.fetchBookingByRoomId(roomId.value);
  
  // กรอง booking ที่สถานะไม่ใช่ Cancel
  const filteredBookings = bookingStore.bookings.filter(booking => booking.status !== "Canceled" && booking.status !== "Finished");  

  // แปลงข้อมูลจาก filteredBookings
  events.value = filteredBookings.map((booking) => {
    let backgroundColor = "#04bd35";
    if (booking.status === "Pending") backgroundColor = "#dbdb02";

    return {
      id: booking.id,
      title: booking.title || "ไม่ระบุหัวข้อ", 
      room_name: booking.room_name || "ไม่ระบุห้อง",
      description: booking.description || "ไม่ระบุรายละเอียด",
      start: booking.start_time * 1000,
      end: booking.end_time * 1000,
      first_name: booking.user_name || "ไม่ระบุชื่อ",
      last_name: booking.user_lastname || "ไม่ระบุนามสกุล",
      backgroundColor,
      borderColor: backgroundColor,
      status: booking.status || "Unknown",
    };
  });

  if (filteredBookings.length > 0) {
    roomName.value = filteredBookings[0].room_name;
  } else {
    const roomData = await roomStore.getById(roomId.value);
    roomName.value = roomData ? roomData.name : "ไม่ระบุห้อง";
  }

  loadedOnce.value = true;
  loading.value = false;
};

watch(
  roomId,
  () => {
    if (roomId.value && !loadedOnce.value) {
      loadBookings();
    }
  },
  { immediate: true }
);

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  locale: thLocale,
  events: events.value,
  eventClick: handleEventClick,
  headerToolbar: {
    start: "prev,next today",
    center: "title",
    end: "",
  },
  height: "auto",
  contentHeight: "auto",
  eventDidMount(info) {
    info.el.style.cursor = "pointer";
    info.el.classList.add(
      `status-${info.event.extendedProps.status.toLowerCase()}`
    );
  },
  eventContent(info) {
    const room = info.event.extendedProps.room_name || "";
    const status = info.event.extendedProps.status || "Unknown";
    let color = "#78f657";
    if (status === "Pending") color = "#f3f85c";
    if (status === "Canceled") color = "#f06666";

    return {
      html: `<div style="display:flex; align-items:center; gap:5px;">
        <div style="width:10px; height:10px; border-radius:50%; background:${color};"></div>
        <div>
          <b>${room}</b>
        </div>
      </div>`,
    };
  },
  dayMaxEvents: 2,  // แสดงได้แค่ 1 เหตุการณ์ในแต่ละวัน
  views: {
    dayGrid: {
      eventLimit: true,  // เปิดใช้งาน eventLimit สำหรับ dayGrid
    },
  },
}));
function handleEventClick(info) {
  selectedEvent.value = info.event;
  popupVisible.value = true;
}

function closePopup() {
  popupVisible.value = false;
}

function goToDate() {
  if (searchDate.value && calendarRef.value) {
    const calendarApi = calendarRef.value.getApi();
    calendarApi.gotoDate(searchDate.value);
  }
}

const todayBookings = computed(() => {
  const today = dayjs().startOf("day");
  const tomorrow = today.add(1, "day");
  return events.value.filter(
    (event) =>
      event.status === "Approved" &&
      dayjs(normalizeToMs(event.start)).isAfter(today) &&
      dayjs(normalizeToMs(event.start)).isBefore(tomorrow)
  );
});


const dailyBookings = computed(() => {
  const grouped = {};
  events.value.forEach((event) => {
    if (event.status !== "Approved") return; // กรองสถานะไม่ใช่ Approved

    const date = dayjs(normalizeToMs(event.start)).startOf("day").format("YYYY-MM-DD");
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(event);
  });
  return grouped;
});

function goToRoomDetail() {
  if (selectedRoomId.value && selectedRoomId.value !== "ทั้งหมด") {
    // ถ้ามีการเลือกห้อง, ไปที่รายละเอียดห้อง
    router.push(`/user/bookings/bookingroom/${selectedRoomId.value}`);
    loading.value = true;
  } else if (selectedRoomId.value === "ทั้งหมด") {
    // ถ้าเลือก "ทั้งหมด", ไปที่หน้าแรก
    router.push("/");
  } else {
    // ถ้ายังไม่ได้เลือกห้อง
    alert("กรุณาเลือกห้อง");
  }
}
</script>
<template>
  <div class="app-container">
    <div class="main-content">
      <!-- 🎯 ปฏิทิน -->
      <div class="left-content">
        <div class="header">ปฏิทินการจอง</div>

        <!-- 🏠 ค้นหาห้องแบบเลือก dropdown -->
        <div style="display: flex; align-items: center; justify-content: flex-end;">
          <label for="room-select" style="margin-right: 7px;">เลือกห้อง: </label>
          <select v-model="selectedRoomId" id="room-select" class="date-input" style="margin-bottom: 10px; width: 20%">
            <option disabled value="">--- กรุณาเลือกห้อง ---</option>
            <option value="ทั้งหมด">ทั้งหมด</option>
            <option v-for="room in rooms" :key="room.id" :value="room.id">
              {{ room.name }}
            </option>
          </select>

          <button class="search-button" @click="goToRoomDetail" :disabled="!selectedRoomId">
            <i class="fa-solid fa-magnifying-glass mr-2"></i> ค้นหาห้อง
          </button>

        </div>

        <!-- 📅 ปฏิทิน -->
        <div class="calendar-container">
          <div class="calendar-header-row">
            <div class="header">ตารางการจอง ของห้อง: {{ roomName }}</div>
            <div class="calendar-search">
              <input type="date" v-model="searchDate" class="date-input" />
              <button @click="goToDate" class="search-button">
                <i class="fa-solid fa-magnifying-glass mr-2"></i> ค้นหา
              </button>
            </div>
          </div>

          <FullCalendar :options="calendarOptions" />

          <div class="calendar-footer">
            <a class="booking-button" href="/user/bookings/createBooking">
              <i class="fa-solid fa-circle-plus mr-2"></i> จองห้อง
            </a>
          </div>
        </div>
      </div>

      <!-- 🧾 ตาราง -->
      <div class="right-content">
        <!-- 📌 วันนี้ -->
        <div class="today-bookings">
          <h2>
            📌 ตารางการจองวันนี้ ({{
              dayjs(date, "YYYY-MM-DD").locale("th").format("D MMMM YYYY")
            }})
          </h2>

          <div v-if="todayBookings.length > 0">
            <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; margin-bottom: 20px">
              <thead>
                <tr class="header-row">
                  <th>หัวข้อ</th>
                  <th>รายละเอียด</th>
                  <th>เริ่ม</th>
                  <th>สิ้นสุด</th>
                  <th>ผู้จอง</th>
                  <th>ห้องที่จอง</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(event, index) in todayBookings" :key="index">
                  <td>{{ event.title }}</td>
                  <td>{{ event.description }}</td>
                  <td>{{ formatDateTime(event.start)  }}</td>
                  <td>{{ formatDateTime(event.end) }}</td>
                  <td>{{ event.first_name }} {{ event.last_name }}</td>
                  <td>{{ event.room_name }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="no-bookings">ไม่มีการจองในวันนี้</div>
        </div>

        <!-- 📋 รวมทั้งหมด -->
        <div class="all-bookings">
          <h2>📋 ตารางรวมการจองทั้งหมด</h2>
          <div v-if="Object.keys(dailyBookings).length > 0">
            <div v-for="(events, date) in dailyBookings" :key="date">
              <h3 class="date-header">
               {{ dayjs(date, "YYYY-MM-DD").locale("th").format("D MMMM YYYY") }}
              </h3>
              <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; margin-bottom: 20px">
                <thead>
                  <tr class="header-row">
                    <th>หัวข้อ</th>
                    <th>รายละเอียด</th>
                    <th>เริ่ม</th>
                    <th>สิ้นสุด</th>
                    <th>ผู้จอง</th>
                    <th>ห้องที่จอง</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(event, index) in events" :key="index">
                    <td>{{ event.title }}</td>
                    <td>{{ event.description }}</td>
                    <td>{{ formatDateTime(event.start)}}</td>
                    <td>{{ formatDateTime(event.end) }}</td>
                    <td>{{ event.first_name }} {{ event.last_name }}</td>
                    <td>{{ event.room_name }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="no-bookings">ไม่มีข้อมูลการจอง</div>
        </div>
      </div>
    </div>

    <!-- 🔥 Popup -->
   <div v-if="popupVisible" class="popup-wrapper">
      <div class="popup-content">
        <div class="popup-header">📌{{ selectedEvent?.title }}</div>
        <div class="popup-body">
          <p><strong>รายละเอียด:</strong> {{ selectedEvent?.extendedProps?.description }}</p>
          <p><strong>เริ่ม:</strong> {{ formatDateTime(selectedEvent?.start) }} </p>
          <p><strong>สิ้นสุด:</strong> {{ formatDateTime(selectedEvent?.end) }} </p>
          <p><strong>ผู้จอง:</strong> {{ selectedEvent?.extendedProps?.first_name }} {{
            selectedEvent?.extendedProps?.last_name }}</p>
          <p><strong>ห้องที่จอง:</strong> {{ selectedEvent?.extendedProps?.room_name }}</p>
        </div>
        <div class="popup-footer">
          <button @click="closePopup">ปิด</button>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.app-container {
  display: flex;
  flex-wrap: wrap;
}

.main-content {
  display: flex;
  flex: 1;
  min-height: 100vh;
  transition: margin-left 0.5s ease;
}

.left-content {
  width: 66.666%;
  padding: 20px;
}

.right-content {
  width: 33.333%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 20px;
}

/* ปรับขนาด header */
.header {
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 16px;
  margin-left: 15px;
}

.sub-header {
  font-size: 1.125rem;
  font-weight: bold;
  margin-bottom: 16px;
}

.calendar-container {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding-bottom: 10px;
}

.calendar-footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.search-button {
  background-color: #4caf50;
  color: white;
  font-family: Kanit;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
  transition: background-color 0.3s ease;
}

.search-button:hover {
  background-color: #388e3c;
  transition: background-color 0.3s ease;
}

.popup-wrapper {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
}

.popup-content {
  background: whitesmoke;
  padding: 25px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease;
  max-height: 90vh;
  overflow-y: auto;
}

.popup-header {
  font-size: 20px;
  font-weight: bold;
  color: #13131f;
  margin-bottom: 10px;
}

.popup-body {
  font-size: 16px;
  color: #13131f;
  margin-bottom: 20px;
}

.popup-footer {
  display: flex;
  justify-content: center;
}

.popup-footer button {
  background-color: #dbdb02;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.popup-footer button:hover {
  background-color: #f0e68c;
  transition: background-color 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-row {
  background-color: #191925;
  font-weight: bold;
  color: #ffffff;
}

.today-bookings {
  border-radius: 5px;
  background-color: #f9f9f9;
  padding: 10px;
  margin-bottom: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-size: 10px;
  width: 100%;
}

.all-bookings {
  border-radius: 5px;
  background-color: #f9f9f9;
  padding: 10px;
  margin-bottom: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-size: 10px;
  width: 100%;
}

.booking-button {
  background-color: #4caf50;
  border: #000 solid 1px;
  color: white;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 6px;
  font-weight: bold;
  transition: background-color 0.3s ease;
  margin-right: 10px;
  margin-top: 5px;
}

.booking-button:hover {
  background-color: #388e3c;
  transition: background-color 0.3s ease;
}

.fc {
  background-color: #fffbfb;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 5px;
  border: 1px solid #ccc;
}

.calendar-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-search {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 10px;
  margin-top: 12px;
  margin-right: 10px;
}

.date-input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

/* hover ของstatus ที่ขึ้นในหน้าปฏิทิน */
::v-deep(.status-pending:hover) {
  background-color: #f0e68c !important;
  transition: background-color 0.3s ease;
}

::v-deep(.status-approved:hover) {
  background-color: #90ee90 !important;
  transition: background-color 0.3s ease;
}

::v-deep(.status-cancel:hover) {
  background-color: #f08080 !important;
  transition: background-color 0.3s ease;
}

::v-deep(.fc-button-group) {
  gap: 0.5em;
}

::v-deep(.fc-prev-button),
::v-deep(.fc-next-button) {
  border-radius: 50% !important;
}

::v-deep(.fc-prev-button):hover,
::v-deep(.fc-next-button):hover {
  background-color: #5a5959 !important;
  transition: background-color 0.3s ease;
}

::v-deep(.fc-button) {
  background-color: #13131f !important;
}

/* Responsive: ปรับการแสดงผลเมื่อหน้าจอเล็กลง */
@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }

  .main-content {
    flex-direction: column;
    margin-left: 0;
  }

  .left-content {
    width: 100%;
    padding: 15px;
  }

  .right-content {
    width: 100%;
    padding: 15px;
    max-height: none;
  }

  .header {
    font-size: 24px;
  }

  .sub-header {
    font-size: 1rem;
  }

  .search-button {
    width: 100%;
    margin-top: 10px;
  }

  .booking-button {
    width: 100%;
    margin-top: 10px;
  }
}
</style>
