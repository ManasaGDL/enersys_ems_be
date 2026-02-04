import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

// ✅ Helper: get total days in a month
const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate(); // month is 1-based
};

// ✅ Helper: count Sundays in a month
const countSundaysInMonth = (month: number, year: number) => {
    const totalDays = getDaysInMonth(month, year);
    let sundays = 0;

    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month - 1, day); // month-1 because JS Date is 0-based
        if (date.getDay() === 0) sundays++; // Sunday = 0
    }

    return sundays;
};

// ✅ Helper: workingDays calculation
const calculateWorkingDays = (month: number, year: number, holidays: number) => {
    const totalDays = getDaysInMonth(month, year);
    const sundays = countSundaysInMonth(month, year);

    return totalDays - sundays - holidays;
};

// ✅ GET attendance by month/year (returns employees + attendance)
export const getMonthlyAttendance = async (req: Request, res: Response) => {
    try {
        const month = Number(req.query.month);
        const year = Number(req.query.year);

        if (!month || !year) {
            return res.status(400).json({
                error: "month and year are required as query params",
            });
        }

        const monthEndDate = new Date(year, month, 0);

        // ✅ For now backend sends holidays=0
        const holidays = 0;
        const workingDays = calculateWorkingDays(month, year, holidays);

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

                workingDays: attendance?.workingDays ?? workingDays,
                holidays: attendance?.holidays ?? holidays,
                absentDays: attendance?.absentDays ?? 0,
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

        // ✅ Fetch holidays from DB for selected month/year
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);

        const holidaysList = await prisma.holiday.findMany({
            where: {
                isActive: true,
                date: {
                    gte: monthStart,
                    lte: monthEnd,
                },
            },
            select: { date: true },
        });

        // ✅ Exclude holidays which fall on Sunday (Sunday already removed separately)
        const holidays = holidaysList.filter((h) => {
            const d = new Date(h.date);
            return d.getDay() !== 0; // Sunday = 0
        }).length;

        const workingDays = calculateWorkingDays(month, year, holidays);

        // ✅ collect projectIds from payload
        const projectIds: string[] = [];
        attendance.forEach((a: any) => {
            if (Array.isArray(a.projectHours)) {
                a.projectHours.forEach((ph: any) => {
                    if (ph?.projectId) projectIds.push(ph.projectId);
                });
            }
        });

        // ✅ validate projectIds (if provided)
        if (projectIds.length > 0) {
            const existingProjects = await prisma.project.findMany({
                where: { id: { in: projectIds } },
                select: { id: true },
            });

            const existingProjectIds = existingProjects.map((p) => p.id);

            const invalidProjectIds = projectIds.filter(
                (id) => !existingProjectIds.includes(id)
            );

            if (invalidProjectIds.length > 0) {
                return res.status(400).json({
                    error: "Some projectIds are invalid",
                    invalidProjectIds,
                });
            }
        }

        await prisma.$transaction(async (tx) => {
            for (const a of attendance) {
                // ✅ Save attendance summary
                await tx.employeeMonthlyAttendance.upsert({
                    where: {
                        employeeId_month_year: {
                            employeeId: a.employeeId,
                            month,
                            year,
                        },
                    },
                    update: {
                        workingDays,
                        holidays,
                        absentDays: a.absentDays ?? 0,
                        otHours: a.otHours ?? 0,
                    },
                    create: {
                        employeeId: a.employeeId,
                        month,
                        year,
                        workingDays,
                        holidays,
                        absentDays: a.absentDays ?? 0,
                        otHours: a.otHours ?? 0,
                    },
                });

                // ✅ Project hours (kept for future use)
                const projectHours = Array.isArray(a.projectHours) ? a.projectHours : [];

                await tx.employeeMonthlyProjectHours.deleteMany({
                    where: {
                        employeeId: a.employeeId,
                        month,
                        year,
                    },
                });

                if (projectHours.length > 0) {
                    await tx.employeeMonthlyProjectHours.createMany({
                        data: projectHours
                            .filter((ph: any) => ph?.projectId)
                            .map((ph: any) => ({
                                employeeId: a.employeeId,
                                projectId: ph.projectId,
                                month,
                                year,
                                hours: ph.hours ?? 0,
                            })),
                    });
                }
            }
        });

        return res.status(200).json({
            message: "Monthly attendance saved successfully ✅",
            savedCount: attendance.length,
            workingDays,
            holidays,
        });
    } catch (error) {
        console.error("Error saving attendance:", error);
        return res.status(500).json({ error: "Failed to save monthly attendance" });
    }
};



export const getWorkingDays = async (req: Request, res: Response) => {
    try {
        const month = Number(req.query.month);
        const year = Number(req.query.year);

        if (!month || !year) {
            return res.status(400).json({
                error: "month and year are required as query params",
            });
        }

        const totalDays = new Date(year, month, 0).getDate();

        let sundays = 0;
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month - 1, day);
            if (date.getDay() === 0) sundays++;
        }

        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);

        let holidaysCount = 0;

        try {
            const holidays = await prisma.holiday.findMany({
                where: {
                    isActive: true,
                    date: {
                        gte: monthStart,
                        lte: monthEnd,
                    },
                },
                select: { date: true },
            });

            // ✅ exclude Sunday holidays
            holidaysCount = holidays.filter((h) => {
                const d = new Date(h.date);
                return d.getDay() !== 0;
            }).length;
        } catch (err) {
            holidaysCount = 0;
        }

        const workingDays = totalDays - sundays - holidaysCount;

        return res.status(200).json({
            workingDays,
            holidaysCount, // ✅ this is non-sunday holiday count now
            sundays,
            totalDays,
        });
    } catch (error) {
        console.error("Error fetching working days:", error);
        return res.status(500).json({ error: "Failed to fetch working days" });
    }
};
