<script setup>
import { useRoute } from "vue-router";
import { useRoomStore } from "@/store/roomStore";
import { ref, onMounted } from "vue";

const route = useRoute();
const roomId = route.params.id; // รับ ID จาก URL
const roomStore = useRoomStore();
const room = ref(null);

onMounted(async () => {
    room.value = await roomStore.getById(roomId);
});
</script>

<template>
    <div>
        <h1>หน้ารายละเอียดห้อง</h1>
        <div v-if="room">
            <h2>ชื่อห้อง: {{ room.name }}</h2>
            <p>คำอธิบาย: {{ room.description }}</p>
            <p>ความจุของห้อง: {{ room.capacity }}</p>
        </div>
    </div>
</template>



<style scoped>

</style>