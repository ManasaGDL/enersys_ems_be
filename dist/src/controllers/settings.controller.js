"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppSettings = exports.getAppSettings = void 0;
const prisma_1 = require("../../lib/prisma");
// ✅ Get App Settings (always returns one row)
const getAppSettings = async (req, res) => {
    try {
        let settings = await prisma_1.prisma.appSettings.findFirst();
        // ✅ If settings not created yet, create default settings automatically
        if (!settings) {
            settings = await prisma_1.prisma.appSettings.create({
                data: {
                    otType: "FIXED",
                    fixedOtRate: 150,
                    otMultiplier: null,
                    sundayMultiplier: 2,
                    workingDays: 26,
                    workingHours: 8,
                },
            });
        }
        return res.status(200).json(settings);
    }
    catch (error) {
        console.error("Error fetching app settings:", error);
        return res.status(500).json({ error: "Failed to fetch app settings" });
    }
};
exports.getAppSettings = getAppSettings;
// ✅ Update App Settings
const updateAppSettings = async (req, res) => {
    try {
        const { otType, fixedOtRate, otMultiplier, sundayMultiplier, workingDays, workingHours, } = req.body;
        // ✅ Find settings row (single row system)
        let settings = await prisma_1.prisma.appSettings.findFirst();
        // ✅ If not exists -> create it first
        if (!settings) {
            settings = await prisma_1.prisma.appSettings.create({
                data: {
                    otType: otType || "FIXED",
                    fixedOtRate: fixedOtRate ?? null,
                    otMultiplier: otMultiplier ?? null,
                    sundayMultiplier: sundayMultiplier ?? null,
                    workingDays: workingDays ?? 26,
                    workingHours: workingHours ?? 8,
                },
            });
            return res.status(201).json({
                message: "Settings created successfully",
                settings,
            });
        }
        // ✅ Validate basic rules
        if (workingDays !== undefined && workingDays < 1) {
            return res.status(400).json({ error: "workingDays must be >= 1" });
        }
        if (workingHours !== undefined && workingHours < 1) {
            return res.status(400).json({ error: "workingHours must be >= 1" });
        }
        // ✅ Ensure FIXED/MULTIPLIER values are correct
        const finalOtType = otType || settings.otType;
        const finalFixedOtRate = finalOtType === "FIXED" ? fixedOtRate ?? settings.fixedOtRate : null;
        const finalOtMultiplier = finalOtType === "MULTIPLIER" ? otMultiplier ?? settings.otMultiplier : null;
        const updated = await prisma_1.prisma.appSettings.update({
            where: { id: settings.id },
            data: {
                otType: finalOtType,
                fixedOtRate: finalFixedOtRate,
                otMultiplier: finalOtMultiplier,
                sundayMultiplier: sundayMultiplier ?? settings.sundayMultiplier,
                workingDays: workingDays ?? settings.workingDays,
                workingHours: workingHours ?? settings.workingHours,
            },
        });
        return res.status(200).json({
            message: "Settings updated successfully",
            settings: updated,
        });
    }
    catch (error) {
        console.error("Error updating app settings:", error);
        return res.status(500).json({ error: "Failed to update app settings" });
    }
};
exports.updateAppSettings = updateAppSettings;
