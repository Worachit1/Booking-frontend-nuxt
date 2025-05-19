import axios from "axios";
import { defineStore } from "pinia";

const config = useRuntimeConfig();

interface Room {
  name: string;
  description: string;
  capacity: number;
  image_url: File | string; // image_url จะเป็นไฟล์หรือ URL ก็ได้
}

export const useRoomStore = defineStore("room", {
  state: () => ({
    rooms: [],
    Loading: false,
  }),
  actions: {
    async fetchRooms() {
      try {
        this.Loading = true;
        const response = await axios.get(
          `${config.public.apiBase}/api/v1/rooms/list`
        );
        if (response.status === 200) {
          this.rooms = response.data.data;
          console.log("Rooms fetched successfully:", this.rooms);
        } else {
          console.error("Error fetching rooms:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        this.Loading = false;
      }
    },
    async getById(room_id: string) {
      try {
        this.Loading = true;
        const response = await axios.get(
          `${config.public.apiBase}/api/v1/rooms/${room_id}`
        );
        if (response.status === 200) {
          // console.log("Room fetched successfully:", response.data.data);
          return response.data.data; // ส่งกลับข้อมูลห้อง
        } else {
          console.error("Error fetching room:", response.statusText);
          return null; // หากไม่พบข้อมูลห้อง
        }
      } catch (error) {
        console.error("Error fetching room:", error);
        return null; // หากเกิดข้อผิดพลาด
      } finally {
        this.Loading = false;
      }
    },
    async addRoom(newRoom: Room) {
      try {
        this.Loading = true;
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const formData = new FormData();
        formData.append("name", newRoom.name);
        formData.append("description", newRoom.description);
        formData.append("capacity", newRoom.capacity.toString());

        // ต้องส่ง key เป็น "image_url" ไม่ใช่ "image"
        if (newRoom.image_url instanceof File) {
          formData.append("image_url", newRoom.image_url);
        } else {
          // ถ้าเป็น URL (rare case) ก็ส่งไป
          formData.append("image_url", newRoom.image_url);
        }

        const response = await axios.post(
          `${config.public.apiBase}/api/v1/rooms/create`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...headers,
            },
          }
        );

        if (response.status === 200) {
          console.log("Room added successfully:", response.data.data);
          return response.data;
        } else {
          console.error("Error adding room:", response.statusText);
          return null;
        }
      } catch (error) {
        console.error("Error adding room:", error);
        return null;
      } finally {
        this.Loading = false;
      }
    },
    async updateRoom(id: string, formData: FormData) {
      try {
        this.Loading = true;
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.patch(
          `${config.public.apiBase}/api/v1/rooms/${id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...headers,
            },
          }
        );

        if (response.status === 200) {
          console.log("Room updated successfully:", response.data.data);
          return response.data;
        } else {
          console.error("Error updating room:", response.statusText);
          return null;
        }
      } catch (error) {
        console.error("Error updating room:", error);
        return null;
      } finally {
        this.Loading = false;
      }
    },
    async deleteRoom(id: string) {
      try {
        this.Loading = true;
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.delete(
          `${config.public.apiBase}/api/v1/rooms/${id}`,
          {
            headers: {
              ...headers,
            },
          }
        );
        if (response.status === 200) {
          console.log("Room deleted successfully:", response.data.data);
        } else {
          console.error("Error deleting room:", response.statusText);
        }
      } catch (error) {
        console.error("Error deleting room:", error);
      } finally {
        this.Loading = false;
      }
    },
  },
});
