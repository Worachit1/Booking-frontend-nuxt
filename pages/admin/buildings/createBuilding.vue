<script setup>
import { ref } from "vue";
import { useBuildingStore } from "@/store/buildingStore";

const buildingStore = useBuildingStore();
const buildingName = ref("");

const handleCreate = () => {
  if (!buildingName.value.trim()) {
    alert("กรุณากรอกชื่ออาคาร");
    return;
  }

  const data = {
    name: buildingName.value,
  };

  buildingStore.addBuilding(data);
  buildingName.value = ""; // reset

  window.location.href = "/buildings"; // นำทางไปยังหน้ารายการอาคาร
};
</script>

<template>
  <div>
    <h2>สร้างอาคารใหม่</h2>
    <input type="text" v-model="buildingName" placeholder="ชื่ออาคาร" />
    <button @click="handleCreate">สร้าง</button>
  </div>
</template>
