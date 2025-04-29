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
  <div class="container">
    <div class="header">
      <h1>แสดงอาคารทั้งหมด</h1>
      <button class="createbuilding" @click="showModal = true">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="svg-icon" width="20px" height="20px">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        เพิ่มอาคาร
      </button>
    </div>

    <div v-if="editableBuildings.length > 0">
      <table class="building-table">
        <thead>
          <tr>
            <th>ชื่ออาคาร</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(b, index) in editableBuildings" :key="b.id">
            <td>
              <input type="text" v-model="b.name" :disabled="!b.isEditing" />
            </td>
            <td>
              <div class="action-buttons">
                <!-- <button @click="goToDetail(b.id)">ดูรายละเอียด</button> -->
              <div style="display: flex; align-items: center;">
                <button class="edit" v-if="!b.isEditing" @click="startEdit(index)">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                    stroke="currentColor" className="svg-icon" width="20px" height="20px">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                  แก้ไข
                </button>
                <button class="confirm" v-else @click="saveEdit(b.id, index)">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="svg-icon" width="20px" height="20px">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  บันทึก
                </button>
                <button class="delete" @click="buildingStore.deleteBuilding(b.id)">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="svg-icon" width="20px" height="20px">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  ลบ
                </button>
              </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>ยังไม่ได้เพิ่มอาคาร</p>
    </div>

    <!-- โมดอลเพิ่มอาคาร -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>เพิ่มอาคารใหม่</h3>
        <input v-model="newBuildingName" type="text" placeholder="ชื่ออาคาร" />
        <div class="modal-actions">
          <button @click="createBuilding" class="confirmBuilding">บันทึก</button>
          <button @click="showModal = false" class="cancel">ยกเลิก</button>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.container {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
  max-width: 1200px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  margin: 0;
  font-size: 28px;
  color: #333;
}

.createbuilding {
  background-color: #39e65e;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  gap: 5px;
  transition: background-color 0.3s;
  border: 1px solid #13131f;
}

.createbuilding:hover {
  background-color: #2b9f3c;
}

.building-table {
  width: 100%;
  border-collapse: collapse;
}

.building-table th,
.building-table td {
  padding: 12px 15px;
  text-align: left;
}

.building-table input[type="text"] {
  width: 20%;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-left: -710px;
}

.edit,
.confirm,
.delete {
  padding: 6px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin-right: 5px;
  border: 1px solid #13131f;
}

.edit {
  background-color: #00b7ff;
  color: white;
}

.edit:hover {
  background-color: #0088cc;
}

.confirm {
  background-color: #ffb700;
  color: white;
}

.confirm:hover {
  background-color: #cc9a00;
}

.delete {
  background-color: #f13c3c;
  color: white;
}

.delete:hover {
  background-color: #cc0000;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
}

.modal input {
  width: 40%;
  margin-top: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.modal-actions {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 5px;
}

.confirmBuilding {
  background-color: #39e65e;
  padding: 8px 12px;
  border-radius: 5px;
  color: white;
  border: none;
  cursor: pointer;
}

.confirmBuilding:hover {
  background-color: #2b9f3c;
}

.cancel {
  background-color: #ff5959;
  padding: 8px 12px;
  border-radius: 5px;
  color: white;
  border: none;
  cursor: pointer;
}

.cancel:hover {
  background-color: #ff0000;
}

</style>