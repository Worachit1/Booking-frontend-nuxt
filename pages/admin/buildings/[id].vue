<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useBuildingStore } from "@/store/buildingStore";
definePageMeta({
  middleware: ["load-user"] // Corrected middleware name
});


const route = useRoute();
const buildingId = route.params.id; // รับ ID จาก URL
const buildingStore = useBuildingStore();
const building = ref(null);

onMounted(async () => {
    building.value = await buildingStore.getById(buildingId);
});
</script>

<template>
    <div v-if="building">
        <h1>หน้ารายละเอียดของอาคาร</h1>
        <p>ชื่ออาคาร: {{ building.name }}</p>
    </div>
    <div v-else>
        <p>กำลังโหลดข้อมูลอาคาร...</p>
    </div>
</template>