<script setup>
import { ref, onMounted } from "vue";
import { useUserStore } from "@/store/userStore";

const userStore = useUserStore();
const users = ref([]);

onMounted(async () => {
    await userStore.fetchUsers();
    users.value = userStore.users;
});
</script>

<template>
    <div>
        <h1>แสดงข้อมูลผู้ใช้ทั้งหมด</h1>
        <div v-if="users.length > 0">
            <table border="1" cellpadding="8">
                <thead>
                    <tr>
                        <th>ชื่อ</th>
                        <th>อีเมล</th>
                        <th>เบอร์โทรศัพท์</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id">
                        <td>{{ user.first_name }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.phone }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else>ไม่มีข้อมูลผู้ใช้ในขณะนี้</div>
    </div>
</template>



<style scoped>

</style>