import axios from "axios";
import { defineStore } from "pinia";

const config = useRuntimeConfig()

export const useBookingStore = defineStore("booking", {
    state: () => ({
        bookings: [],
    }),
    actions: {
        async fetchBookings() {
            try {
                const response = await axios.get(`${config.public.apiBase}/api/v1/bookings/list`);
                if (response.status === 200) {
                    this.bookings = response.data.data;
                    // console.log("Bookings fetched successfully:", this.bookings);
                } else {
                    console.error("Error fetching bookings:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
            }
        },
        async fetchBookingByRoomId(room_id: string) {
            try {
                const response = await axios.get(`${config.public.apiBase}/api/v1/bookings/room/${room_id}`);
                
                // ตรวจสอบ status และการมีอยู่ของข้อมูล
                if (response.status === 200 && response.data && response.data.data) {
                    this.bookings = response.data.data;
                    console.log("Bookings fetchedByRoomId successfully:", this.bookings);
                } else {
                    console.error("Error fetching bookings:", response.statusText || 'No data found');
                }
            } catch (error) {
                // จัดการข้อผิดพลาดจากการร้องขอ API
                console.error("Error fetching bookings:", error);
            }
        },        
        async addBooking(newBooking: { room_id: string; user_id: string; title: string; description: string; start_time: string; end_time: string; status: string; }) {
            try {
                const response = await axios.post(`${config.public.apiBase}/api/v1/bookings/create`, newBooking);
                if (response.status === 200) {
                    console.log("Booking added successfully:", response.data.data);
                } else {
                    console.error("Error adding booking:", response.statusText);
                }
            } catch (error) {
                console.error("Error adding booking:", error);
            }
        },
    },
});