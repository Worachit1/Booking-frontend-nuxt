import axios from "axios";
import { defineStore } from "pinia";
const config = useRuntimeConfig();

export const useBuilding_RoomStore = defineStore("building_room", {
  state: () => ({
    building_rooms: [],
    isLoading: false,
  }),

  actions: {
    async fetchBuilding_Rooms() {
      this.isLoading = true;
      try {
        const response = await axios.get(
          `${config.public.apiBase}/api/v1/buildingRooms/list`
        );
        if (response.status === 200) {
          const data = response.data.data;
          this.building_rooms = data && data.length ? data : [];
        } else {
          this.building_rooms = [];
          console.error("Error fetching buildings:", response.statusText);
        }
      } catch (error) {
        this.building_rooms = [];
        console.error("Error fetching buildings:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async getByRoomId(room_id: string) {
      this.isLoading = true;
      const token = localStorage.getItem("token") || null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        const response = await axios.get(
          `${config.public.apiBase}/api/v1/buildingRooms/room/${room_id}`,
          {
            headers,
          }
        );
        if (response.status === 200) {
          const data = response.data.data;
          return data && data.length ? data : [];
        } else {
          console.error("Error fetching building:", response.statusText);
          return [];
        }
      } catch (error) {
        console.error("Error fetching building:", error);
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    async getRoomsByBuildingId(building_id: string) {
      this.isLoading = true;
      try {
        const response = await axios.get(
          `${config.public.apiBase}/api/v1/buildingRooms/buildRoom/${building_id}`
        );
        if (response.status === 200) {
          const data = response.data.data;
          return data && data.length ? data : [];
        } else {
          console.error("Error fetching building:", response.statusText);
          return [];
        }
      } catch (error) {
        console.error("Error fetching building:", error);
        return [];
      } finally {
        this.isLoading = false;
      }
    },
    async addBuilding_Room(newBuilding_Room: {
      building_id: string;
      room_id: string;
    }) {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.post(
          `${config.public.apiBase}/api/v1/buildingRooms/create`,
          newBuilding_Room,
          {
            headers,
          }
        );
        if (response.status === 200) {
          // console.log("Building_Room added successfully:", response.data.data);
        } else {
          console.error("Error adding building:", response.statusText);
        }
      } catch (error) {
        console.error("Error adding building:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
