<script setup>
import { ref,onMounted } from 'vue'
import Sidebar from '@/components/sidebar.vue'
import Header from '@/components/header.vue'
import { useBookingStore } from '@/store/bookingStore'

definePageMeta({
  middleware: ["load-user"] // Corrected middleware name
});

const isSidebarOpen = ref(false)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  document.body.style.overflow = isSidebarOpen.value ? 'hidden' : ''
}

onMounted(() => {
  const bookingStore = useBookingStore();
  bookingStore.fetchBookings();
});
</script>

<template>
  <Header />
  <div class="flex">
    <!-- Sidebar -->
    <Sidebar 
      :isSidebarOpen="isSidebarOpen" 
      @toggleSidebar="toggleSidebar" 
    />
    
    <!-- Main Content -->
    <div 
      class="transition-all duration-300 w-full p-4 sidebar" 
      :style="{ transform: isSidebarOpen ? 'translateX(220px)' : 'translateX(0)' }"
    >
      <br><br><slot />
    </div>
  </div>
</template>

<style >
.sidebar {
  transition: transform 1.0s ease;
}

</style>
