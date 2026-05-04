import { apiClient } from "../lib/apiClient";

export const getIncidentsForOrganization = async (organizationId) => {
  const { data } = await apiClient.get("/api/incidents/all", {
    params: {
      organizationId,
      limit: 100,
    },
  });

  return data.incidents || [];
};

export const createIncident = async (payload) => {
  const { data } = await apiClient.post("/api/incidents/create", payload);
  return data.incident;
};

export const getIncidentById = async (incidentId) => {
  const { data } = await apiClient.get(`/api/incidents/${incidentId}`);
  return data.incident;
};

export const getIncidentUpdates = async (incidentId) => {
  const { data } = await apiClient.get(`/api/incidents/${incidentId}/updates`, {
    params: {
      limit: 100,
    },
  });
  return data.updates || [];
};

export const addIncidentUpdate = async (incidentId, payload) => {
  const { data } = await apiClient.post(`/api/incidents/${incidentId}/update`, payload);
  return data.update;
};

export const getIncidentResponders = async (incidentId) => {
  const { data } = await apiClient.get(`/api/incidents/${incidentId}/responders`);
  return data.responders || [];
};

export const assignIncidentResponders = async (incidentId, userIds) => {
  const { data } = await apiClient.post(`/api/incidents/${incidentId}/assign`, {
    userIds,
  });
  return data;
};

export const unassignIncidentResponders = async (incidentId, userIds) => {
  const { data } = await apiClient.post(`/api/incidents/${incidentId}/unassign`, {
    userIds,
  });
  return data;
};
