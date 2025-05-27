<script setup>
import { ref } from "vue";
import Sidebar from "@/components/sidebar.vue";
import Header from "~/components/Header.vue";
import loginModal from "@/components/loginModal.vue"; // เพิ่มบรรทัดนี้
import { useAuthStore } from "@/store/authStore"; // เพิ่มบรรทัดนี้

const authStore = useAuthStore(); // เพิ่มบรรทัดนี้

const isSidebarOpen = ref(false);
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  document.body.style.overflow = isSidebarOpen.value ? "hidden" : "";
};
</script>

<template>
  <Header />
  <loginModal
    v-if="authStore.showLoginModal"
    @close="authStore.closeLoginModal()"
  />
  <div class="flex">
    <!-- Sidebar -->
    <Sidebar :isSidebarOpen="isSidebarOpen" @toggleSidebar="toggleSidebar" />

    <!-- Main Content -->
    <div
      class="transition-all duration-300 w-full p-4 sidebar"
      :style="{
        transform: isSidebarOpen ? 'translateX(220px)' : 'translateX(0)',
      }"
    >
      <br /><br /><br /><br /><slot />
    </div>
  </div>
</template>

<style>
.sidebar {
  transition: transform 0.8s ease;
}
</style>
