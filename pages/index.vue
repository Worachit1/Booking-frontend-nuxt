<script setup>
import { ref, computed, watch } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import thLocale from "@fullcalendar/core/locales/th";
import { useBookingStore } from "@/store/bookingStore";
import dayjs from "dayjs";
import "dayjs/locale/th";

definePageMeta({
  middleware: ["load-user"],
});

const bookingStore = useBookingStore();
const events = ref([]);
const popupVisible = ref(false);
const selectedEvent = ref(null);
const searchDate = ref(null);
const loading = ref(false);
const loadedOnce = ref(false);

const loadBookings = async () => {
  if (loadedOnce.value) return; // ป้องกันโหลดซ้ำ
  loading.value = true;
  await bookingStore.fetchBookings();
  events.value = bookingStore.bookings.map((booking) => {
    let backgroundColor = "#04bd35";
    if (booking.status === "Pending") backgroundColor = "#dbdb02";
    if (booking.status === "Cancel") backgroundColor = "#f06666";

    return {
      id: booking.id,
      title: booking.title || "ไม่ระบุหัวข้อ",
      description: booking.description || "ไม่ระบุรายละเอียด",
      start: booking.start_time,
      end: booking.end_time,
      first_name: booking.user_name || "ไม่ระบุชื่อ",
      last_name: booking.user_lastname || "ไม่ระบุนามสกุล",
      room: booking.room_name || "ไม่ระบุห้อง",
      backgroundColor,
      borderColor: backgroundColor,
      status: booking.status,
    };
  });
  loadedOnce.value = true;
  loading.value = false;
};

// call loadBookings ทันทีเมื่อ component ถูกสร้าง
watch(
  () => true,
  async () => {
    await loadBookings();
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
}));

function handleEventClick(info) {
  selectedEvent.value = info.event;
  popupVisible.value = true;
}

function closePopup() {
  popupVisible.value = false;
}

const todayBookings = computed(() => {
  const today = dayjs().startOf("day");
  const tomorrow = today.add(1, "day");
  return events.value.filter(
    (event) =>
      dayjs(event.start).isAfter(today) && dayjs(event.start).isBefore(tomorrow)
  );
});

const dailyBookings = computed(() => {
  const grouped = {};
  events.value.forEach((event) => {
    const date = dayjs(event.start).startOf("day").format("YYYY-MM-DD");
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(event);
  });
  return grouped;
});

function goToDate() {
  if (searchDate.value) {
    const calendarApi = document.querySelector(".fc").__vueParentComponent.ctx.getApi();
    calendarApi.gotoDate(searchDate.value);
  }
}
</script>


<template>
  <div class="app-container">
    <div class="main-content">
      <!-- 🎯 ซ้าย: ปฏิทิน -->
      <div class="left-content">
        <div class="header">ปฏิทินการจอง</div>

        <div class="calendar-container">
          <div class="calendar-header-row">
            <div class="header">ตารางการจองทั้งหมด</div>
            <!-- 🔍 ค้นหาวันที่ -->
            <div class="calendar-search">
              <input type="date" v-model="searchDate" class="date-input" />
              <button @click="goToDate" class="search-button">ค้นหา</button>
            </div>
          </div>
          <FullCalendar :options="calendarOptions" />
          <div class="calendar-footer">
            <a class="booking-button" href="/user/bookings/createBooking"
              >จองห้อง</a
            >
          </div>
        </div>
      </div>

      <!-- 🧾 ขวา: ตารางวันนี้ + รวม -->
      <div class="right-content">
        <!-- 📌 ตารางการจองวันนี้ -->
        <div class="today-bookings">
          <h2>
            📌 ตารางการจองวันนี้ ({{
              dayjs().locale("th").format("D MMMM YYYY")
            }})
          </h2>

          <div v-if="todayBookings.length > 0">
            <table
              border="1"
              cellpadding="8"
              cellspacing="0"
              style="width: 100%; margin-bottom: 20px"
            >
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
                  <td>
                    {{ dayjs(event.start).format("DD/MM/YYYY") }}<br />
                    เวลา {{ dayjs(event.start).format("HH:mm") }} น.
                  </td>
                  <td>
                    {{ dayjs(event.end).format("DD/MM/YYYY") }}<br />
                    เวลา {{ dayjs(event.end).format("HH:mm") }} น.
                  </td>
                  <td>{{ event.first_name }} {{ event.last_name }}</td>
                  <td>{{ event.room }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="no-bookings">ไม่มีการจองในวันนี้</div>
        </div>

        <!-- 📋 ตารางรวมการจองทั้งหมด -->
        <div class="all-bookings">
          <h2>📋 ตารางรวมการจองทั้งหมด</h2>
          <div v-if="Object.keys(dailyBookings).length > 0">
            <div v-for="(events, date) in dailyBookings" :key="date">
              <h3 class="date-header">
                {{ dayjs(date).locale("th").format("D MMMM YYYY") }}
              </h3>

              <table
                border="1"
                cellpadding="8"
                cellspacing="0"
                style="width: 100%; margin-bottom: 20px"
              >
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
                    <td>
                      {{ dayjs(event.start).format("DD/MM/YYYY") }}<br />
                      เวลา {{ dayjs(event.start).format("HH:mm") }} น.
                    </td>
                    <td>
                      {{ dayjs(event.end).format("DD/MM/YYYY") }}<br />
                      เวลา {{ dayjs(event.end).format("HH:mm") }} น.
                    </td>
                    <td>{{ event.first_name }} {{ event.last_name }}</td>
                    <td>{{ event.room }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="no-bookings">ไม่มีข้อมูลการจอง</div>
        </div>
      </div>
    </div>

    <!-- 🔥 Popup แสดงรายละเอียดการจอง -->
    <div v-if="popupVisible" class="popup-wrapper">
      <div class="popup-content">
        <div class="popup-header">📌{{ selectedEvent?.title }}</div>
        <div class="popup-body">
          <p>
            📝<strong>รายละเอียด:</strong>
            {{ selectedEvent?.extendedProps?.description }}
          </p>
          <p>
            🕓<strong>เริ่ม:</strong>
            {{ dayjs(selectedEvent?.start).format("DD/MM/YYYY HH:mm") }}น.
          </p>
          <p>
            🕓<strong>สิ้นสุด:</strong>
            {{ dayjs(selectedEvent?.end).format("DD/MM/YYYY HH:mm") }}น.
          </p>
          <p>
            🙋‍♂️<strong>ผู้จอง:</strong>
            {{ selectedEvent?.extendedProps?.first_name }}
            {{ selectedEvent?.extendedProps?.last_name }}
          </p>
          <p>
            🏠<strong>ห้องที่จอง:</strong>
            {{ selectedEvent?.extendedProps?.room }}
          </p>
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
}

.search-button:hover {
  background-color: #45a049;
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
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.popup-footer button:hover {
  background-color: #45a049;
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
}

.fc {
  background-color: #fffbfb;
  /* สีพื้นหลังของปฏิทิน */
  border-radius: 8px;
  /* มุมมน */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  /* เงา */
  padding: 5px;
  /* ระยะห่างภายใน */
  border: 1px solid #ccc;
  /* เส้นขอบ */
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
}

::v-deep(.status-approved:hover) {
  background-color: #90ee90 !important;
}

::v-deep(.status-cancel:hover) {
  background-color: #f08080 !important;
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
}

::v-deep(.fc-button) {
  background-color: #13131f !important;
}
</style>
