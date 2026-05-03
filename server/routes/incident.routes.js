import { Router } from "express";
import { createIncident } from "../controllers/incident/incident.lifecycle.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { createIncidentValidation } from "../config/validation/incident.validation.js";

const incidentRoutes = Router();

incidentRoutes.post("/create", protect, createIncidentValidation, createIncident);

export default incidentRoutes;