<script setup>
import { onMounted, ref } from "vue";
import { useBookingStore } from "@/store/bookingStore";
import dayjs from "dayjs";
import "dayjs/locale/th"; // ภาษาไทย

const bookingStore = useBookingStore();
const bookings = ref([]);

const formatDate = (date) => {
  return dayjs(date).locale("th").format("D MMMM YYYY เวลา HH:mm น.");
};

onMounted(async () => {
  await bookingStore.fetchBookings();
  bookings.value = bookingStore.bookings;
});
</script>


<template>
  <div>
    <h1>แสดงการจองทั้งหมด</h1>
    <div v-if="bookings.length > 0">
      <table border="1" cellpadding="8">
        <thead>
          <tr>
            <th>หัวข้อ</th>
            <th>รายละเอียด</th>
            <th>เวลาเริ่ม</th>
            <th>เวลาสิ้นสุด</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in bookings" :key="booking.id">
            <td>{{ booking.title }}</td>
            <td>{{ booking.description }}</td>
            <td>{{ formatDate(booking.start_time) }}</td>
            <td>{{ formatDate(booking.end_time) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>ไม่มีการจองในขณะนี้</div>
  </div>
</template>

<style scoped></style>