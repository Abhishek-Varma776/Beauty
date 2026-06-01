import API from "../api/axios";
import type { Profile } from "../types/domain";

export interface AuthPayload {
  phone: string;
  password: string;
}

export interface RegisterPayload extends AuthPayload {
  name: string;
}

export interface AuthResponse {
  token: string;
  user: Profile;
}

export const registerUser = async (data: RegisterPayload) => {
  const response = await API.post("/auth/register", data);
  return response.data as AuthResponse;
};

export const loginUser = async (data: AuthPayload) => {
  const response = await API.post("/auth/login", data);
  return response.data as AuthResponse;
};

export const getCurrentUser = async () => {
  const response = await API.get("/auth/me");
  return response.data.user as Profile;
};

export const updateProfile = async (data: { name: string; phone: string; dob?: string; gender?: string; beautyUse?: string }) => {
  const response = await API.patch("/auth/profile", data);
  return response.data.user as Profile;
};
