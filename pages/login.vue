<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';


const email = ref('');
const password = ref('');
const router = useRouter();
const authStore = useAuthStore();

const login = async () => {
  try {
    const user = await authStore.login({ email: email.value, password: password.value }); 
    
    if (!user || !user.id) {
      throw new Error('ไม่พบข้อมูลผู้ใช้');
    }

    // เก็บข้อมูลลง localStorage
    localStorage.setItem('user_id', user.ID);
    localStorage.setItem('user_email', user.Email);
    localStorage.setItem('user_first_name', user.first_name);
    localStorage.setItem('user_last_name', user.last_name);
    localStorage.setItem('user_image_url', String(user.image_url));
    localStorage.setItem('user_position', user.position_name);
    localStorage.setItem('user_token', user.token || '');

    router.push('/users/' + user.id); // เปลี่ยนเส้นทางไปหน้าผู้ใช้
  } catch (error) {
    console.error("Login error:", error);
    alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
  }
};



</script>

<template>
  <div class="login-page">
    <h2>เข้าสู่ระบบ</h2>
    <div class="form-group">
      <label for="email">อีเมล</label>
      <input type="email" id="email" v-model="email" required />
    </div>
    <div class="form-group">
      <label for="password">รหัสผ่าน</label>
      <input type="password" id="password" v-model="password" required />
    </div>
    <button @click="login">เข้าสู่ระบบ</button>
    <p>ยังไม่มีบัญชี? <router-link to="/register">ลงทะเบียน</router-link></p>
  </div>
  <div v-if="error" class="error">{{ error }}</div>
</template>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 100px auto;
  padding: 2rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.form-group {
  margin-bottom: 1rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #04bd35;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>