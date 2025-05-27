import axios from "axios";
import { defineStore } from "pinia";

const config = useRuntimeConfig();

export const useBuildingStore = defineStore("building", {
  state: () => ({
    buildings: [],
    isLoading: false,
    total: 0,
  }),
  actions: {
    async fetchBuildings() {
      this.isLoading = true;
      let page = 1;
      const size = 1000;
      let allBuildings: any[] = [];

      try {
        while (true) {
          const response = await axios.get(
            `${config.public.apiBase}/api/v1/buildings/list`,
            { params: { page, size } }
          );
          const data = response.data.data;
          const pagination = response.data.pagination;

          if (
            !data ||
            data.length === 0 ||
            !pagination?.total ||
            pagination.total === 0
          ) {
            break;
          }

          allBuildings.push(...data);

          if (page * size >= pagination.total) break;
          page++;
        }

        this.buildings = allBuildings;
        this.total = allBuildings.length;
        return allBuildings;
      } catch (error) {
        this.buildings = [];
        this.total = 0;
        console.error("Error fetching buildings:", error);
        return [];
      } finally {
        this.isLoading = false;
      }
    },
    async addBuilding(newBuilding: { name: string }) {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.post(
          `${config.public.apiBase}/api/v1/buildings/create`,
          newBuilding,
          {
            headers,
          }
        );
        if (response.status === 200) {
          // Optionally: fetchBuildings() เพื่อรีเฟรชข้อมูล
          // await this.fetchBuildings();
        } else {
          console.error("Error adding building:", response.statusText);
        }
      } catch (error) {
        console.error("Error adding building:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async updateBuilding(id: string, updatedBuilding: { name: string }) {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.patch(
          `${config.public.apiBase}/api/v1/buildings/${id}`,
          updatedBuilding,
          {
            headers,
          }
        );
        if (response.status === 200) {
          // Optionally: fetchBuildings() เพื่อรีเฟรชข้อมูล
          // await this.fetchBuildings();
        } else {
          console.error("Error updating building:", response.statusText);
        }
      } catch (error) {
        console.error("Error updating building:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async deleteBuilding(id: string) {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.delete(
          `${config.public.apiBase}/api/v1/buildings/${id}`,
          {
            headers,
          }
        );
        if (response.status === 200) {
          // Optionally: fetchBuildings() เพื่อรีเฟรชข้อมูล
          // await this.fetchBuildings();
        } else {
          console.error("Error deleting building:", response.statusText);
        }
      } catch (error) {
        console.error("Error deleting building:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
