import axios from "axios";
import { API_BASE_URL } from "../auth/authApi";

export const organizationApi = axios.create({
  baseURL: `${API_BASE_URL}/api/users/organization`,
  withCredentials: true,
});

export const createOrganization = async (payload) => {
  const { data } = await organizationApi.post("", payload);
  return data.organization;
};
