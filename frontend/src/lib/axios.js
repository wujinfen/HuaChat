import axios from axios

export const axiosService = axios.create({
    baseUrl: "http://localhost:5001/api",
    withCredentials: true //sends cookies with request
})