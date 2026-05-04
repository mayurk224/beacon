import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  getIncidentsForOrganization,
  createIncident as apiCreateIncident,
  getIncidentById as apiGetIncidentById,
  addIncidentUpdate as apiAddIncidentUpdate,
  getIncidentUpdates as apiGetIncidentUpdates,
  getIncidentResponders as apiGetIncidentResponders,
  assignIncidentResponders as apiAssignIncidentResponders,
  unassignIncidentResponders as apiUnassignIncidentResponders
} from "./incidentApi";

export function useIncident() {
  const [incidents, setIncidents] = useState([]);
  const [activeIncident, setActiveIncident] = useState(null);
  const [incidentUpdates, setIncidentUpdates] = useState([]);
  const [incidentResponders, setIncidentResponders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIncidents = useCallback(async (organizationId) => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const data = await getIncidentsForOrganization(organizationId);
      setIncidents(data);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch incidents");
      toast.error(err?.response?.data?.message || "Failed to fetch incidents");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchIncidentDetails = useCallback(async (incidentId) => {
    if (!incidentId) return;
    setLoading(true);
    try {
      const [incidentData, updatesData, respondersData] = await Promise.all([
        apiGetIncidentById(incidentId),
        apiGetIncidentUpdates(incidentId),
        apiGetIncidentResponders(incidentId)
      ]);
      setActiveIncident(incidentData);
      setIncidentUpdates(updatesData);
      setIncidentResponders(respondersData);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch incident details");
      toast.error(err?.response?.data?.message || "Failed to fetch incident details");
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewIncident = async (payload) => {
    setLoading(true);
    try {
      const newIncident = await apiCreateIncident(payload);
      setIncidents((prev) => [newIncident, ...prev]);
      setError(null);
      return newIncident;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create incident");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const postIncidentUpdate = async (incidentId, payload) => {
    setLoading(true);
    try {
      const newUpdate = await apiAddIncidentUpdate(incidentId, payload);
      setIncidentUpdates((prev) => [newUpdate, ...prev]);
      
      // Update the active incident status if it changed
      if (payload.status && activeIncident) {
        setActiveIncident((prev) => ({ ...prev, status: payload.status }));
      }
      
      setError(null);
      return newUpdate;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to post update");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentResponders = async (incidentId, { assignIds = [], unassignIds = [] }) => {
    setLoading(true);
    try {
      if (assignIds.length > 0) {
        await apiAssignIncidentResponders(incidentId, assignIds);
      }
      if (unassignIds.length > 0) {
        await apiUnassignIncidentResponders(incidentId, unassignIds);
      }
      // Refresh responders list
      const updatedResponders = await apiGetIncidentResponders(incidentId);
      setIncidentResponders(updatedResponders);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update responders");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    incidents,
    activeIncident,
    incidentUpdates,
    incidentResponders,
    loading,
    error,
    fetchIncidents,
    fetchIncidentDetails,
    createNewIncident,
    postIncidentUpdate,
    updateIncidentResponders,
  };
}
