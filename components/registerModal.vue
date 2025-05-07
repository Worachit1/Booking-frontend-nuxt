<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/store/authStore";
import { useUserPositionStore } from "@/store/userPositionStore";

const emit = defineEmits(['close', 'open-login']);

const isModalOpen = ref(true); // ตั้งค่าให้เปิด modal
const showLoginModal = ref(false); // ตั้งค่าให้ไม่เปิด modal login

const authStore = useAuthStore();
const userPositionStore = useUserPositionStore();

function closeModal() {
    emit('close'); // ส่งอีเวนต์เพื่อปิดโมเดล
}

const User = ref({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    position_name: null,
    image_url: "",
    imageFile: null,
});

const positions = ref([]);



const openLoginModal = () => {
    isModalOpen.value = false;
    showLoginModal.value = true;
};

onMounted(async () => {
    await userPositionStore.fetchUserPositions();
    positions.value = userPositionStore.userPositions;
});

const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        User.value.imageFile = file;
        User.value.image_url = URL.createObjectURL(file);
    }
};

const handleRegister = async () => {
    const u = User.value;
    if (!u.first_name.trim() || !u.last_name.trim() || !u.email.trim() ||
        !u.password.trim() || !u.phone.trim() || !u.imageFile) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
    }

    const res = await authStore.register({
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        password: u.password,
        phone: u.phone,
        position_name: u.position_name,
        image_url: u.imageFile,
    });
    console.log("📦 REGISTER RESPONSE:", res);

    if (res?.ID || res?.data?.ID) {
        alert("สมัครสมาชิกสำเร็จ!");
        closeModal();
    } else {
        alert("สมัครไม่สำเร็จ");
    }

    User.value = {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        position_name: "",
        image_url: "",
        imageFile: null,
    };
};


</script>

<template>
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
            <h2 class="title">สมัครสมาชิก</h2>

            <div class="form-group">
                <label>ชื่อ:</label>
                <input type="text" v-model="User.first_name" />
            </div>

            <div class="form-group">
                <label>นามสกุล:</label>
                <input type="text" v-model="User.last_name" />
            </div>

            <div class="form-group">
                <label>อีเมล:</label>
                <input type="email" v-model="User.email" />
            </div>

            <div class="form-group">
                <label>รหัสผ่าน:</label>
                <input type="password" v-model="User.password" />
            </div>

            <div class="form-group">
                <label>เบอร์โทรศัพท์:</label>
                <input type="text" v-model="User.phone" />
            </div>

            <div class="form-group">
                <label>ตำแหน่ง:</label>
                <select v-model="User.position_name">
                    <option disabled value="">-- เลือกตำแหน่ง --</option>
                    <option v-for="position in positions" :key="position.id" :value="position.name">
                        {{ position.name }}
                    </option>
                </select>
            </div>

            <div class="form-group">
                <label>อัปโหลดรูปภาพ:</label>
                <input type="file" @change="handleImageUpload" accept="image/*" />
                <div v-if="User.image_url" class="image-preview">
                    <img :src="User.image_url" alt="preview" />
                </div>
            </div>
            <p>มีบัญชีอยู่แล้ว?
                <a href="#" @click.prevent="$emit('open-login')">เข้าสู่ระบบ</a>
            </p>
            <button @click="handleRegister" class="register-btn">สมัครสมาชิก</button>
            <div v-if="error" class="error">{{ error }}</div>
            <button class="close-btn" @click="$emit('close')">ปิด</button>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    padding: 0;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;

}

.modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 500px;
    max-height: 85vh;       
    overflow-y: auto

}

.title {
    text-align: center;
    color: #13131f;
    margin-bottom: 1.5rem;
}

.form-group {
    margin-bottom: 1rem;
}

a {
    color: #13131f;
    font-weight: bold;
    transition: color 0.3s ease;
}

a:hover {
    color: #47476a;
}

input,
select {
    width: 100%;
    padding: 0.6rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 1rem;
}

input:focus,
select:focus {
    border-color: #04bd35;
    outline: none;
    box-shadow: 0 0 0 3px rgba(4, 189, 53, 0.2);
}

button {
    width: 100%;
    padding: 0.75rem;
    background-color: #04bd35;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
}


.error {
    margin-top: 1rem;
    color: #f44336;
    text-align: center;
}

.register-btn {
    margin-top: 1rem;
    background-color: transparent;
    color: #4caf50;
    font-weight: bold;
    border: 2px solid #4caf50;
    border-radius: 8px;
    padding: 0.5rem;
    transition: all 0.3s ease;
}

.register-btn:hover {
    background-color: #4caf50;
    color: white;
}

.close-btn {
    margin-top: 1rem;
    background-color: transparent;
    color: #f44336;
    font-weight: bold;
    border: 2px solid #f44336;
    border-radius: 8px;
    padding: 0.5rem;
    transition: all 0.3s ease;
}

.close-btn:hover {
    background-color: #f44336;
    color: white;
}

.error-message {
    color: red;
    margin-top: 1rem;
    text-align: center;
}

.image-preview {
    margin-top: 10px;
}

.image-preview img {
    max-width: 100%;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>