<script setup>
import { onMounted, computed } from "vue";
import { useRoomStore } from "@/store/roomStore";


const roomStore = useRoomStore();
const rooms = computed(() => roomStore.rooms);


onMounted(async () => {
  await roomStore.fetchRooms();
  rooms.value = roomStore.rooms;
});

const goToEdit = (id) => {
  window.location.href = `/rooms/edit/${id}`;
};

const goTODetail = (id) => {
  window.location.href = `/rooms/detail/${id}`;
};
</script>

<template>
  <div>
    <h1>แสดงห้องทั้งหมด</h1>
    <div v-if="rooms.length > 0">
      <table border="1" cellpadding="8">
        <thead>
          <tr>
            <th>ชื่อห้อง</th>
            <th>คำอธิบาย</th>
            <th>ความจุของห้อง</th>
            <th>ภาพห้อง</th>
            <th>การกระทำ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rooms" :key="r.id">
            <td>{{ r.name }}</td>
            <td>{{ r.description }}</td>
            <td class="getcapacity">{{ r.capacity }}</td>
            <td>
              <img :src="r.image_url || 'data:image/png;base64,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'" alt="Room Image" style="width: 100px; height: 100px;" />
            </td>
            <td>
              <button @click="goTODetail(r.id)">ดูรายละเอียด</button>
              <button @click="goToEdit(r.id)">แก้ไข</button>
              <button @click="roomStore.deleteRoom(r.id)">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>ยังไม่ได้เพิ่มห้อง .</p>
    </div>
    <a href="/rooms/createRoom">เพิ่มห้อง</a>
  </div>
</template>

<style scoped>
.getcapacity {
  text-align: center;
  font-weight: 600;
}
</style>