import axios from "axios";
import { defineStore } from "pinia";

const config = useRuntimeConfig();

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
        if (response.status === 200 && response.data?.data) {
          this.bookings = response.data.data;
        } else {
          console.error("Error fetching bookings:", response.statusText || "No data found");
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    },

    async addBooking(newBooking: {
      room_id: string;
      user_id: string;
      title: string;
      description: string;
      start_time: string;
      end_time: string;
      status: string;
    }) {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        };

        const response = await axios.post(`${config.public.apiBase}/api/v1/bookings/create`, newBooking, {
          headers,
        });

        if (response.status === 200) {
          return response.data;
        } else {
          console.error("Error adding booking:", response.statusText);
        }
      } catch (error) {
        console.error("Error adding booking:", error);
      }
    },
    async getBookingByuserId(user_id: string) {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
            const response = await axios.get(`${config.public.apiBase}/api/v1/bookings/user/${user_id}`, {
            headers,
            });
    
            if (response.status === 200) {
            return response.data.data;
            } else {
            console.error("Error fetching booking:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching booking:", error);
        }
        },
    async updateStatusBooking(id: string, updatedBooking: { status: string }) {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.patch(
          `${config.public.apiBase}/api/v1/bookings/${id}`,
          updatedBooking,
          { headers }
        );

        if (response.status === 200) {
          console.log("Booking Status updated successfully:", response.data.data);
        } else {
          console.error("Error updating booking:", response.statusText);
        }
      } catch (error) {
        console.error("Error updating status:", error);
      }
    },

    async deleteBooking(id: string) {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.delete(`${config.public.apiBase}/api/v1/bookings/${id}`, {
          headers,
        });

        if (response.status === 200) {
          return response.data;
        } else {
          console.error("Error deleting booking:", response.statusText);
        }
      } catch (error) {
        console.error("Error deleting booking:", error);
      }
    },
  },
});
