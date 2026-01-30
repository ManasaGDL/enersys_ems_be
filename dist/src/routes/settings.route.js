"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = require("../controllers/settings.controller");
const router = (0, express_1.Router)();
// ✅ Get settings
router.get("/", settings_controller_1.getAppSettings);
// ✅ Update settings
router.put("/", settings_controller_1.updateAppSettings);
exports.default = router;
