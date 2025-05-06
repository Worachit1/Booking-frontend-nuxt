<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useRoomStore } from "~/store/roomStore";
definePageMeta({
  middleware: ["load-user"] // Corrected middleware name
});



const route = useRoute(); // ใช้ useRoute แทน window.location.pathname
const roomId = route.params.id; // รับ ID จาก URL
const roomStrore = useRoomStore();
const room = ref(null);
const editableRoom = ref([]);

const handleUpdate = async () => {
    if (!editableRoom.value.name.trim()) {
        alert("กรุณากรอกชื่อห้อง");
        return;
    }

    const data = {
        name: editableRoom.value.name,
        description: editableRoom.value.description,
        capacity: editableRoom.value.capacity,
        iamge_url: editableRoom.value.iamge_url, 
    };

    await roomStrore.updateRoom(roomId, data);
    window.location.href = "/rooms"; // นำทางกลับไปที่หน้าห้องทั้งหมด
};

onMounted(async () => {
    room.value = await roomStrore.getById(roomId);
    editableRoom.value = { ...room.value }; 
    
});
</script>

<template>
    <div v-if="room">
        <h2>แก้ไขข้อมูลห้อง</h2>
        <input type="text" v-model="editableRoom.name" placeholder="ชื่อห้อง" />
        <input type="text" v-model="editableRoom.description" placeholder="คำอธิบาย" />
        <input type="number" v-model="editableRoom.capacity" placeholder="ความจุของห้อง" />
        <button @click="handleUpdate">บันทึกการเปลี่ยนแปลง</button>
    </div>
    <div v-else>
        <p>กำลังโหลดข้อมูลห้อง...</p>
    </div>
</template>

<style scoped></style>
