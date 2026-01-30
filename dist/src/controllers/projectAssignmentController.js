"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectEmployees = exports.syncProjectEmployees = void 0;
const prisma_1 = require("../../lib/prisma");
const syncProjectEmployees = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { employeeIds } = req.body;
        if (!employeeIds || !Array.isArray(employeeIds)) {
            return res.status(400).json({ error: "employeeIds must be an array" });
        }
        // ✅ check project exists
        const project = await prisma_1.prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true },
        });
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        // ✅ fetch current assignments
        const current = await prisma_1.prisma.projectEmployee.findMany({
            where: { projectId },
            select: { employeeId: true },
        });
        const currentIds = current.map((c) => c.employeeId);
        // ✅ figure out what to add and remove
        const toAdd = employeeIds.filter((id) => !currentIds.includes(id));
        const toRemove = currentIds.filter((id) => !employeeIds.includes(id));
        // ✅ run updates in transaction
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.projectEmployee.createMany({
                data: toAdd.map((employeeId) => ({
                    projectId,
                    employeeId,
                })),
                skipDuplicates: true,
            }),
            prisma_1.prisma.projectEmployee.deleteMany({
                where: {
                    projectId,
                    employeeId: { in: toRemove },
                },
            }),
        ]);
        return res.status(200).json({
            message: "Project employees updated successfully",
            added: toAdd.length,
            removed: toRemove.length,
        });
    }
    catch (error) {
        console.error("Error syncing project employees:", error);
        return res.status(500).json({ error: "Failed to update project employees" });
    }
};
exports.syncProjectEmployees = syncProjectEmployees;
const getProjectEmployees = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await prisma_1.prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, name: true },
        });
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        const employees = await prisma_1.prisma.projectEmployee.findMany({
            where: { projectId },
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        status: true,
                    },
                },
            },
        });
        return res.status(200).json({ project, employees });
    }
    catch (error) {
        console.error("Error fetching project employees:", error);
        return res.status(500).json({ error: "Failed to fetch project employees" });
    }
};
exports.getProjectEmployees = getProjectEmployees;
