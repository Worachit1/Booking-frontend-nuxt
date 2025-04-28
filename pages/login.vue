<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; 
import axios from 'axios'; 

const email = ref('');
const password = ref('');
const router = useRouter();

const login = async () => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_PATH}/login`, {
      email: email.value,
      password: password.value,
    });
    
    console.log("✅ Login success", response.data);

    localStorage.setItem('token', response.data.token);

    router.push('/');

  } catch (error) {
    console.error("❌ Login failed", error);
    alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  }
};
</script>

<template>
  <div class="login-page">
    <h1>เข้าสู่ระบบ</h1>

    <div class="form-group">
      <label>Email</label>
      <input v-model="email" type="email" placeholder="กรอกอีเมล" />
    </div>

    <div class="form-group">
      <label>Password</label>
      <input v-model="password" type="password" placeholder="กรอกรหัสผ่าน" />
    </div>

    <button @click="login">เข้าสู่ระบบ</button>
  </div>
</template>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 100px auto;
  padding: 2rem;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
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
