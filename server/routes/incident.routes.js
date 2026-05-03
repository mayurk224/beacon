import { Router } from "express";
import { addIncidentUpdate, createIncident, getAllIncidents, getIncidentById } from "../controllers/incident/incident.lifecycle.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { createIncidentValidation, getAllIncidentsValidation, getIncidentByIdValidation, addIncidentUpdateValidation } from "../config/validation/incident.validation.js";

const incidentRoutes = Router();

incidentRoutes.post("/create", protect, createIncidentValidation, createIncident);
incidentRoutes.get("/all", protect, getAllIncidentsValidation, getAllIncidents);
incidentRoutes.get("/:id", protect, getIncidentByIdValidation, getIncidentById);
incidentRoutes.post("/:id/update", protect, addIncidentUpdateValidation, addIncidentUpdate);

export default incidentRoutes;