import { apiClient } from "../lib/apiClient";

export const createOrganization = async (payload) => {
  const { data } = await apiClient.post("/api/users/organization", payload);
  return data.organization;
};

export const requestToJoinOrganization = async (orgId) => {
  const { data } = await apiClient.post(`/api/users/organization/${orgId}/join`);
  return data.joinRequest;
};

export const getOrganizationById = async (organizationId) => {
  const { data } = await apiClient.get(`/api/users/organization/${organizationId}`);
  return data;
};

export const sendOrganizationInvite = async (payload) => {
  const { data } = await apiClient.post("/api/users/organization/user/invite", payload);
  return data;
};

export const updateOrganizationMemberRole = async (organizationId, userId, role) => {
  const { data } = await apiClient.post(
    `/api/users/organization/${organizationId}/members/${userId}/role`,
    { role },
  );
  return data;
};

export const removeOrganizationMember = async (organizationId, userId) => {
  const { data } = await apiClient.delete(
    `/api/users/organization/${organizationId}/members/${userId}/remove`,
  );
  return data;
};

export const getOrganizationJoinRequests = async (organizationId) => {
  const { data } = await apiClient.get(
    `/api/users/organization/${organizationId}/requests`,
  );
  return data.requests || [];
};

export const handleOrganizationJoinRequest = async (requestId, status) => {
  const { data } = await apiClient.post(
    `/api/users/organization/requests/${requestId}/handle`,
    { status },
  );
  return data;
};

export const getOrganizations = async () => {
  const { data } = await apiClient.get("/api/users/organization");
  return data.organizations || [];
};

export const updateOrganization = async (id, payload) => {
  const { data } = await apiClient.patch(`/api/users/organization/${id}`, payload);
  return data.organization;
};

export const acceptInvite = async (token) => {
  const { data } = await apiClient.post("/api/users/organization/user/invite/accept", { token });
  return data;
};
