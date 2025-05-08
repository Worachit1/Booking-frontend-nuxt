import type { option } from "~/models/axios.model";
import axios from "axios";

export const client = (ops: option) => {
    const config: any = useRuntimeConfig();
    
    let api: any = axios.create()

    api.defaults.baseURL = config.public.apiBase;
    api.defaults.headers.common["Content-Type"] = "application/json";

    //ตรวจสอบ token ที่ใช้ใน cookie 
    api.interceptors.request.use(
        async function (config: any) {
            let token = await useCookie("token")
            config.headers["Authorization"] = `Bearer ${token.value}`
            return config;
        },
        function (error: any) {
            return Promise.reject(error);
        },
    )

    // ตรวจสอบ status code ที่ได้รับจาก API ก่อนทำการ response 
    api.defaults.validateStatus = false
    ops.method = ops.method.toLowerCase()

    return api({
        ...ops,
    })
}