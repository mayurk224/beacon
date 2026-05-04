import axios from "axios";
import { API_BASE_URL } from "../auth/authApi";

export const incidentApi = axios.create({
  baseURL: `${API_BASE_URL}/api/incidents`,
  withCredentials: true,
});

export const getIncidentsForOrganization = async (organizationId) => {
  const { data } = await incidentApi.get("/all", {
    params: {
      organizationId,
      limit: 100,
    },
  });

  return data.incidents || [];
};
