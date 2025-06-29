import axios from 'axios'

export const axiosService = axios.create({
    baseURL: "http://localhost:5001/api",
    withCredentials: true //sends cookies with request
})