// Derive API base from NEXT_PUBLIC_API_BASE_URL and ensure it includes '/api'
const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const API_BASE_URL = /\/api\/?$/.test(rawBase) ? rawBase.replace(/\/?$/, "") : `${rawBase.replace(/\/?$/, "")}/api`;
