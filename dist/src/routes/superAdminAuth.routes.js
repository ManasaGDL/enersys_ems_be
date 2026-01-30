"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const superAdminAuthController_1 = require("../controllers/superAdminAuthController");
const router = (0, express_1.Router)();
router.post("/login", superAdminAuthController_1.superAdminLogin);
exports.default = router;
