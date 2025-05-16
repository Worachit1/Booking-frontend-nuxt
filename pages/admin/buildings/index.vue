<script setup>
import { onMounted, ref } from "vue";
import { useBuildingStore } from "@/store/buildingStore";
import { useBookingStore } from "@/store/bookingStore";
import { useBuilding_RoomStore } from "~/store/building_roomStore";

definePageMeta({
  middleware: ["load-user"],
});

// Store
const buildingStore = useBuildingStore();
const buildingRoomStore = useBuilding_RoomStore();

// State
const buildings = ref([]);
const editableBuildings = ref([]);
const showModal = ref(false);
const showDeleteModal = ref(false);
const newBuildingName = ref("");
const buildingToDelete = ref(null);

// Fetch and setup
const loadBuildings = async () => {
  await buildingStore.fetchBuildings();
  buildings.value = buildingStore.buildings;
  editableBuildings.value = buildings.value.map((b) => ({
    ...b,
    isEditing: false,
  }));
};

onMounted(loadBuildings);

// Edit
const startEdit = (index) => {
  editableBuildings.value[index].isEditing = true;
};

const saveEdit = async (id, index) => {
  const updated = { name: editableBuildings.value[index].name };
  await buildingStore.updateBuilding(id, updated);
  editableBuildings.value[index].isEditing = false;
  await loadBuildings(); // Refresh
};

// Create
const createBuilding = async () => {
  const name = newBuildingName.value.trim();
  if (!name) {
    alert("กรุณากรอกชื่ออาคาร");
    return;
  }
  await buildingStore.addBuilding({ name });
  newBuildingName.value = "";
  showModal.value = false;
  await loadBuildings();
};



const deleteBuilding = async () => {
  if (!buildingToDelete.value) return;

  const buildingId = buildingToDelete.value.id;

  // ดึงห้องในอาคารนั้น
  let roomsInBuilding = await buildingRoomStore.getRoomsByBuildingId(buildingId);
  if (!Array.isArray(roomsInBuilding)) {
    roomsInBuilding = [];
  }

  // ถ้าไม่มีห้องเลย → ลบได้
  if (roomsInBuilding.length === 0) {
    await buildingStore.deleteBuilding(buildingId);
    await refreshBuildings();
  } else {
    alert("ไม่สามารถลบอาคารนี้ได้ เนื่องจากยังมีห้องอยู่ในอาคาร");
  }

  // ปิด modal และ reset state
  showDeleteModal.value = false;
  buildingToDelete.value = null;
};

// Delete
const setToDeleteBuilding = (building) => {
  buildingToDelete.value = building;
  showDeleteModal.value = true;
};

// helper สำหรับรีเฟรชรายการ
const refreshBuildings = async () => {
  await buildingStore.fetchBuildings();
  buildings.value = buildingStore.buildings;
  editableBuildings.value = buildings.value.map((b) => ({
    ...b,
    isEditing: false,
  }));
};


const closeModals = () => {
  showModal.value = false;
  showDeleteModal.value = false;
};

</script>

<template>
  <div class="container">
    <div class="header">
      <h1>รายการอาคาร</h1>
      <button class="createbuilding" @click="showModal = true">
        <i class="fa-solid fa-circle-plus mr-2"></i> เพิ่มอาคาร
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
                <div style="display: flex; align-items: center">
                  <button
                    class="edit"
                    v-if="!b.isEditing"
                    @click="startEdit(index)"
                  >
                  <i class="fa-solid fa-pen-to-square mr-2"></i>แก้ไข
                  </button>
                  <button class="confirm" v-else @click="saveEdit(b.id, index)">
                    <i class="fa-solid fa-check mr-2"></i> บันทึก
                  </button>

                  <button @click="setToDeleteBuilding(b)" class="delete">
                    <i class="fa-solid fa-trash-can mr-2"></i> ลบ
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

    <!-- showModal เพิ่อที่จะเพิ่มอาคารหรือ จะลบอาคาร-->
    <div v-if="showModal || showDeleteModal" class="modal-overlay">
      <div class="modal">
        <template v-if="showModal">
          <h3>เพิ่มอาคารใหม่</h3>
          <input
            v-model="newBuildingName"
            type="text"
            placeholder="ชื่ออาคาร"
          />
          <div class="modal-actions">
            <button @click="createBuilding" class="modal-confirm">
              บันทึก
            </button>
            <button @click="closeModals" class="modal-cancel">ยกเลิก</button>
          </div>
        </template>

        <template v-else-if="showDeleteModal">
          <h3>คุณแน่ใจหรือไม่ที่จะลบ "{{ buildingToDelete?.name }}" ?</h3>
          <div class="modal-actions">
            <button @click="deleteBuilding" class="modal-confirm">
              ยืนยัน
            </button>
            <button @click="closeModals" class="modal-cancel">ยกเลิก</button>
          </div>
        </template>
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
  max-width: 1180px;
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
  text-decoration: underline;
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
  transition: background-color 0.3s ease;
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
  width: 125%;
  height: 100%; 
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
  margin-right: 10px;
}

.edit:hover {
  background-color: #0088cc;
  transition: background-color 0.3s ease;
}

.confirm {
  background-color: #ffb700;
  color: white;
}

.confirm:hover {
  background-color: #cc9a00;
  transition: background-color 0.3s ease;
}

.delete {
  background-color: #f13c3c;
  color: white;
}

.delete:hover {
  background-color: #cc0000;
  transition: background-color 0.3s ease;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(151, 150, 150, 0.142);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: fadeIn 0.2s ease-in-out;
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
  animation: scaleIn 0.25s ease;
}

.modal-actions {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 5px;
}

.modal-confirm {
  background-color: #39e65e;
  padding: 8px 12px;
  border-radius: 5px;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.modal-confirm:hover {
  background-color: #2b9f3c;
  transition: background-color 0.3s ease;
}

.modal-cancel {
  background-color: #ff0000;
  padding: 8px 12px;
  border-radius: 5px;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.modal-cancel:hover {
  background-color: #cf4c4c;
  transition: background-color 0.3s ease;
}
</style>
