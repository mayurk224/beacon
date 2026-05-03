import { Router } from "express";
import { createIncident, getAllIncidents } from "../controllers/incident/incident.lifecycle.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { createIncidentValidation, getAllIncidentsValidation } from "../config/validation/incident.validation.js";

const incidentRoutes = Router();

incidentRoutes.post("/create", protect, createIncidentValidation, createIncident);
incidentRoutes.get("/all", protect, getAllIncidentsValidation, getAllIncidents);

export default incidentRoutes;