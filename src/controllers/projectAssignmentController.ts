import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const syncProjectEmployees = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const { employeeIds } = req.body;

        if (!employeeIds || !Array.isArray(employeeIds)) {
            return res.status(400).json({ error: "employeeIds must be an array" });
        }

        // ✅ check project exists
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true },
        });

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        // ✅ fetch current assignments
        const current = await prisma.projectEmployee.findMany({
            where: { projectId },
            select: { employeeId: true },
        });

        const currentIds = current.map((c) => c.employeeId);

        // ✅ figure out what to add and remove
        const toAdd = employeeIds.filter((id: string) => !currentIds.includes(id));
        const toRemove = currentIds.filter((id) => !employeeIds.includes(id));

        // ✅ run updates in transaction
        await prisma.$transaction([
            prisma.projectEmployee.createMany({
                data: toAdd.map((employeeId: string) => ({
                    projectId,
                    employeeId,
                })),
                skipDuplicates: true,
            }),

            prisma.projectEmployee.deleteMany({
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
    } catch (error) {
        console.error("Error syncing project employees:", error);
        return res.status(500).json({ error: "Failed to update project employees" });
    }
};
export const getProjectEmployees = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, name: true },
        });

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        const employees = await prisma.projectEmployee.findMany({
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
    } catch (error) {
        console.error("Error fetching project employees:", error);
        return res.status(500).json({ error: "Failed to fetch project employees" });
    }
};
