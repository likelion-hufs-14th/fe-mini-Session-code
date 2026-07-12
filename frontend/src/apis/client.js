/** 배포 백엔드에 붙는 axios 인스턴스 — baseURL 인라인(환경변수 안 씀). */
import axios from "axios";

export const api = axios.create({
  baseURL: "https://fe-mini-session-code.onrender.com",
});
