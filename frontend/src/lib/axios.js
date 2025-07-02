import axios from 'axios'

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api"

export const axiosService = axios.create({
    baseURL: BASE_URL,
    withCredentials: true //sends cookies with request
})