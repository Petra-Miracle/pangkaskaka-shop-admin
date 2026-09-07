export type UserRole = "customer" | "owner" | "admin" | "superadmin" | string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  managed_shop_ids?: string[];
}

export type ApplicantStatus =
  | "pending"
  | "menunggu_tes"
  | "seleksi_berkas_lolos"
  | "active"
  | "rejected";

export interface KaryawanApplication {
  id: string;
  profile_id: string;
  name: string;
  email: string;
  phone: string;
  shop_id: string;
  ktp_photo: string;
  diploma_photo: string;
  work_experience: string;
  criteria_agreed: boolean;
  portfolio_url: string;
  tools_photo: string;
  bnsp_cert: string;
  certificates: string;
  total_score: number;
  status: ApplicantStatus;
  created_at: string;
  berkas_reviewed_at?: string;
  berkas_reason?: string;
  evaluated_at?: string;
  portfolio_weight?: number;
  experience_weight?: number;
  tools_weight?: number;
  bnsp_weight?: number;
  cert_weight?: number;
  diploma_weight?: number;
}

export interface Shop {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  services?: unknown[];
  barbers?: unknown[];
  [key: string]: unknown;
}

export interface RecruitmentMessage {
  id: string;
  karyawan_id: string;
  sender_id: string;
  sender_role: string;
  text?: string;
  attachment?: string;
  is_read: boolean;
  created_at: string;
}

export const EVALUATION_WEIGHT_FIELDS = [
  "portfolio_weight",
  "experience_weight",
  "tools_weight",
  "bnsp_weight",
  "cert_weight",
  "diploma_weight",
] as const;

export type EvaluationWeights = Record<
  (typeof EVALUATION_WEIGHT_FIELDS)[number],
  number
>;

export const EVALUATION_LABELS: Record<
  (typeof EVALUATION_WEIGHT_FIELDS)[number],
  string
> = {
  portfolio_weight: "Portofolio",
  experience_weight: "Pengalaman Kerja",
  tools_weight: "Kelengkapan Alat",
  bnsp_weight: "Sertifikat BNSP",
  cert_weight: "Sertifikat Lainnya",
  diploma_weight: "Ijazah",
};

export const CHAT_ALLOWED_STATUSES: ApplicantStatus[] = [
  "menunggu_tes",
  "seleksi_berkas_lolos",
  "active",
];
