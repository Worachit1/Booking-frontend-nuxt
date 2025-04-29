<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/store/authStore";
import { useUserPositionStore } from "@/store/userPositionStore";

const authStore = useAuthStore();
const userPositionStore = useUserPositionStore();
const User = ref({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    position_name: null,
    image_url: "", // ใช้สำหรับ preview รูป
    imageFile: null, // ไฟล์จริง ใช้ส่งไป backend
});

const positions = ref([]);

onMounted(async () => {
    await userPositionStore.fetchUserPositions();
    positions.value = userPositionStore.userPositions;
});


const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        User.value.imageFile = file;
        User.value.image_url = URL.createObjectURL(file); // Preview รูป
    }
};

const handleRegister = async () => {
    if (!User.value.first_name.trim()) {
        alert("กรุณากรอกชื่อ");
        return;
    }
    if (!User.value.last_name.trim()) {
        alert("กรุณากรอกนามสกุล");
        return;
    }
    if (!User.value.email.trim()) {
        alert("กรุณากรอกอีเมล");
        return;
    }
    if (!User.value.password.trim()) {
        alert("กรุณากรอกรหัสผ่าน");
        return;
    }
    if (!User.value.phone.trim()) {
        alert("กรุณากรอกเบอร์โทรศัพท์");
        return;
    }
    // if (!User.value.position_name) {
    //     alert("กรุณาเลือกตำแหน่ง");
    //     return;
    // }
    if (!User.value.imageFile) {
        alert("กรุณาเลือกไฟล์รูปภาพ");
        return;
    }

    const register = await authStore.register({
        first_name: User.value.first_name,
        last_name: User.value.last_name,
        email: User.value.email,
        password: User.value.password,
        phone: User.value.phone,
        position_name: User.value.position_name,
        image_url: User.value.imageFile, // สำคัญ! ส่งไฟล์
    });

    if (register && register.data && register.data.ID) {
        alert("สมัครสมาชิกสำเร็จ!");
        window.location.href = "/login";
    } else {
        alert("สมัครสมาชิกไม่สำเร็จ");
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
    <div>
        <h1>สมัครสมาชิก</h1>
        <div>
            <label for="first_name">ชื่อ:</label>
            <input type="text" v-model="User.first_name" required />
        </div>
        <div>
            <label for="last_name">นามสกุล:</label>
            <input type="text" v-model="User.last_name" required />
        </div>
        <div>
            <label for="email">อีเมล:</label>
            <input type="email" v-model="User.email" required />
        </div>
        <div>
            <label for="password">รหัสผ่าน:</label>
            <input type="password" v-model="User.password" required />
        </div>
        <div>
            <label for="phone">เบอร์โทรศัพท์:</label>
            <input type="text" v-model="User.phone" required />
        </div>
        <div>
            <label for="position_id">ตำแหน่ง:</label>
            <select v-model="User.position_name" required>
                <option disabled value="">-- เลือกตำแหน่ง --</option>
                <option v-for="position in positions" :key="position.id" :value="position.name">
                    {{ position.name }}
                </option>
            </select>

        </div>

        <div>
            <label for="image">อัปโหลดรูปภาพ:</label>
            <input type="file" @change="handleImageUpload" accept="image/*" />
            <div v-if="User.image_url">
                <p>ตัวอย่างรูป:</p>
                <img :src="User.image_url" alt="User Image" width="150" />
            </div>
        </div>
        <button @click="handleRegister">สมัครสมาชิก</button>
        <div v-if="authStore.error" class="error-message">{{ authStore.error }}</div>
    </div>
</template>



<style scoped></style>