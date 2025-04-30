import axios from "axios";
import { defineStore } from "pinia";

const config = useRuntimeConfig()

export const useBuildingStore = defineStore("building", {
  state: () => ({
    buildings: [], 
  }),
  actions: {
    async fetchBuildings() {
      try {
        const response = await axios.get(`${config.public.apiBase}/api/v1/buildings/list`);
        if (response.status === 200) {
          this.buildings = response.data.data; 
          console.log("Buildings fetched successfully:", this.buildings);
        } else {
          console.error("Error fetching buildings:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching buildings:", error);
      }
    },
    async getById(id: string) {
      try {
        const response = await axios.get(`${config.public.apiBase}/api/v1/buildings/${id}`);
        if (response.status === 200) {
          return response.data.data; 
        } else {
          console.error("Error fetching building:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching building:", error);
      }
    },
    async addBuilding(newBuilding: { name: string;}) {
      try {
        const response = await axios.post(`${config.public.apiBase}/api/v1/buildings/create`, newBuilding);
        if (response.status === 200) {
          console.log("Building added successfully:", response.data.data);
        } else {
          console.error("Error adding building:", response.statusText);
        }
      } catch (error) {
        console.error("Error adding building:", error);
      }
    },
    async updateBuilding(id: string, updatedBuilding: { name: string;}) {
      try {
        const response = await axios.patch(`${config.public.apiBase}/api/v1/buildings/${id}`, updatedBuilding);
        if (response.status === 200) {
          console.log("Building updated successfully:", response.data.data);
        } else {
          console.error("Error updating building:", response.statusText);
        }
      } catch (error) {
        console.error("Error updating building:", error);
      }
    },
    async deleteBuilding(id: string) {
      try {
        const response = await axios.delete(`${config.public.apiBase}/api/v1/buildings/${id}`);
        if (response.status === 200) {
          console.log("Building deleted successfully:", response.data.data);
        } else {
          console.error("Error deleting building:", response.statusText);
        }
      } catch (error) {
        console.error("Error deleting building:", error);
      }
    },
  },
});
