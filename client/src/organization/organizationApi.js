import { apiClient } from "../lib/apiClient";

export const createOrganization = async (payload) => {
  const { data } = await apiClient.post("/users/organization", payload);
  return data.organization;
};

export const requestToJoinOrganization = async (orgId) => {
  const { data } = await apiClient.post(`/users/organization/${orgId}/join`);
  return data.joinRequest;
};

export const getOrganizationById = async (organizationId) => {
  const { data } = await apiClient.get(`/users/organization/${organizationId}`);
  return data;
};

export const sendOrganizationInvite = async (payload) => {
  const { data } = await apiClient.post("/users/organization/user/invite", payload);
  return data;
};

export const updateOrganizationMemberRole = async (organizationId, userId, role) => {
  const { data } = await apiClient.post(
    `/users/organization/${organizationId}/members/${userId}/role`,
    { role },
  );
  return data;
};

export const removeOrganizationMember = async (organizationId, userId) => {
  const { data } = await apiClient.delete(
    `/users/organization/${organizationId}/members/${userId}/remove`,
  );
  return data;
};

export const getOrganizationJoinRequests = async (organizationId) => {
  const { data } = await apiClient.get(
    `/users/organization/${organizationId}/requests`,
  );
  return data.requests || [];
};

export const handleOrganizationJoinRequest = async (requestId, status) => {
  const { data } = await apiClient.post(
    `/users/organization/requests/${requestId}/handle`,
    { status },
  );
  return data;
};
