import { useState, useEffect, useCallback } from "react";
import { getOrganizations } from "./organizationApi";

export function useOrganization() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOrganizations();
      setOrganizations(data);
      setError(null);
      
      const storedOrgId = localStorage.getItem("selectedOrganizationId");
      if (storedOrgId) {
        const org = data.find((o) => o._id === storedOrgId);
        if (org) setSelectedOrganization(org);
        else if (data.length > 0) setSelectedOrganization(data[0]);
      } else if (data.length > 0) {
        setSelectedOrganization(data[0]);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const switchOrganization = (orgId) => {
    const org = organizations.find((o) => o._id === orgId);
    if (org) {
      setSelectedOrganization(org);
      localStorage.setItem("selectedOrganizationId", orgId);
    }
  };

  return {
    organizations,
    selectedOrganization,
    switchOrganization,
    loading,
    error,
    refetch: fetchOrganizations,
  };
}
