<script setup>
import { onMounted, ref, watch } from "vue";
import { useBuildingStore } from "@/store/buildingStore";

const buildingStore = useBuildingStore();
const buildings = ref([]);
const editableBuildings = ref([]);

// โหลดข้อมูลเมื่อ mount
onMounted(async () => {
  await buildingStore.fetchBuildings();
  buildings.value = buildingStore.buildings;

  // สร้างสำเนา editable สำหรับแต่ละแถว
  editableBuildings.value = buildings.value.map((b) => ({
    ...b,
    isEditing: false,
  }));
});

const startEdit = (index) => {
  editableBuildings.value[index].isEditing = true;
};

const saveEdit = async (id, index) => {
  const updated = {
    name: editableBuildings.value[index].name,
  };
  await buildingStore.updateBuilding(id, updated);
  editableBuildings.value[index].isEditing = false;
};

// const goToDetail = (id) => {
//   // นำทางไปยังหน้ารายละเอียดอาคาร
//   window.location.href = `/buildings/${id}`;
// };

const showModal = ref(false);
const newBuildingName = ref("");

const createBuilding = async () => {
  if (!newBuildingName.value.trim()) return;

  await buildingStore.addBuilding({ name: newBuildingName.value });
  await buildingStore.fetchBuildings();

  buildings.value = buildingStore.buildings;
  editableBuildings.value = buildings.value.map((b) => ({ ...b, isEditing: false }));

  newBuildingName.value = "";
  showModal.value = false;
};

</script>

<template>
  <div>
    <h1>แสดงอาคารทั้งหมด</h1>
    <div v-if="editableBuildings.length > 0">
      <table border="1" cellpadding="8">
        <thead>
          <tr>
            <th>ชื่ออาคาร</th>
            <th>การกระทำ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(b, index) in editableBuildings" :key="b.id">
            <td>
              <input
                type="text"
                v-model="b.name"
                :disabled="!b.isEditing"
              />
            </td>
            <td>
              <!-- <button @click="goToDetail(b.id)">ดูรายละเอียด</button> -->
              <button v-if="!b.isEditing" @click="startEdit(index)">แก้ไข</button>
              <button v-else @click="saveEdit(b.id, index)">บันทึก</button>
              <button @click="buildingStore.deleteBuilding(b.id)">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>ยังไม่ได้เพิ่มอาคาร</p>
    </div>
    <button @click="showModal = true">เพิ่มอาคาร</button>
  </div>

  <div v-if="showModal" class="modal-overlay">
  <div class="modal">
    <h3>เพิ่มอาคารใหม่</h3>
    <input v-model="newBuildingName" type="text" placeholder="ชื่ออาคาร" />
    <div style="margin-top: 10px;">
      <button @click="createBuilding">บันทึก</button>
      <button @click="showModal = false">ยกเลิก</button>
    </div>
  </div>
</div>

</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 200%;
  background: rgba(192, 189, 189, 0.378);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: #13131f;
  padding: 10px;
  border-radius: 8px;
  width: 200px;
  color: white;
  text-align: center;
  margin-top: -150px;
}
</style>