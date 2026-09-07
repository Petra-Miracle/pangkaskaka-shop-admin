const RAW_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API_BASE = `${RAW_URL.replace(/\/+$/, "")}/api`;
