import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

// ✅ GET attendance by month/year (returns employees + attendance)
export const getMonthlyAttendance = async (req: Request, res: Response) => {
    try {
        const month = Number(req.query.month);
        const year = Number(req.query.year);
        const monthEndDate = new Date(year, month, 0);

        if (!month || !year) {
            return res.status(400).json({
                error: "month and year are required as query params",
            });
        }

        const employees = await prisma.employee.findMany({
            where: {
                hireDate: {
                    lte: monthEndDate,
                },
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                hireDate: true,
                salary: true,
                department: { select: { id: true, name: true } },
                role: { select: { id: true, title: true } },
                monthlyAttendance: {
                    where: { month, year },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // ✅ Transform response to easy frontend format
        const result = employees.map((emp: any) => {
            const attendance = emp.monthlyAttendance?.[0];

            return {
                employeeId: emp.id,
                name: `${emp.firstName} ${emp.lastName || ""}`.trim(),
                email: emp.email,
                hireDate: emp.hireDate,
                department: emp.department?.name || null,
                salary: emp.salary || 0,

                presentDays: attendance?.presentDays ?? 0,
                otHours: attendance?.otHours ?? 0,

                month,
                year,
            };
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return res.status(500).json({ error: "Failed to fetch attendance" });
    }
};

// ✅ BULK UPSERT attendance for month/year
export const bulkUpsertMonthlyAttendance = async (req: Request, res: Response) => {
    try {
        const { month, year, attendance } = req.body;

        if (!month || !year) {
            return res.status(400).json({ error: "month and year are required" });
        }

        if (!attendance || !Array.isArray(attendance)) {
            return res.status(400).json({ error: "attendance must be an array" });
        }

        if (attendance.length === 0) {
            return res.status(400).json({ error: "attendance array cannot be empty" });
        }

        const employeeIds = attendance.map((a: any) => a.employeeId);

        const existingEmployees = await prisma.employee.findMany({
            where: { id: { in: employeeIds } },
            select: { id: true },
        });

        const existingEmployeeIds = existingEmployees.map((e) => e.id);

        const invalidEmployeeIds = employeeIds.filter(
            (id: string) => !existingEmployeeIds.includes(id)
        );

        if (invalidEmployeeIds.length > 0) {
            return res.status(400).json({
                error: "Some employeeIds are invalid",
                invalidEmployeeIds,
            });
        }

        const results = await prisma.$transaction(
            attendance.map((a: any) =>
                prisma.employeeMonthlyAttendance.upsert({
                    where: {
                        employeeId_month_year: {
                            employeeId: a.employeeId,
                            month,
                            year,
                        },
                    },
                    update: {
                        presentDays: a.presentDays ?? 0,
                        otHours: a.otHours ?? 0,
                    },
                    create: {
                        employeeId: a.employeeId,
                        month,
                        year,
                        presentDays: a.presentDays ?? 0,
                        otHours: a.otHours ?? 0,
                    },
                })
            )
        );

        return res.status(200).json({
            message: "Monthly attendance saved successfully ✅",
            savedCount: results.length,
        });
    } catch (error) {
        console.error("Error saving attendance:", error);
        return res.status(500).json({ error: "Failed to save monthly attendance" });
    }
};
