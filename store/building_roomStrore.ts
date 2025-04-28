import axios from "axios";
import { defineStore } from "pinia";
const config = useRuntimeConfig()

export const useBuilding_RoomStore = defineStore("building_room", {
  state: () => ({
    building_rooms: [], 
  }),
  actions: {
    async fetchBuilding_Rooms() {
      try {
        const response = await axios.get(`${config.public.apiBase}/api/v1/buildingRooms/list`);
        if (response.status === 200) {
          this.building_rooms = response.data.data; 
          // console.log("BuildingRooms fetched successfully:", this.building_rooms);
        } else {
          console.error("Error fetching buildings:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching buildings:", error);
      }
    },
    async addBuilding_Room(newBuilding_Room: {building_id: string; room_id: string; }) {
      try {
        const response = await axios.post(`${config.public.apiBase}/api/v1/buildingRooms/create`, newBuilding_Room);
        if (response.status === 200) {
          console.log("BuildingRoom added successfully:", response.data.data);
        } else {
          console.error("Error adding building:", response.statusText);
        }
      } catch (error) {
        console.error("Error adding building:", error);
      }
    },
  },
});
