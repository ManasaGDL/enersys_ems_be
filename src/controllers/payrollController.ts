import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

// ✅ helper
const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * GET payroll run for a month/year
 * - If run exists -> return with items + adjustments
 * - If not exists -> return null
 */
export const
    getPayrollRun = async (req: Request, res: Response) => {
        try {
            const month = Number(req.query.month);
            const year = Number(req.query.year);

            if (!month || !year) {
                return res.status(400).json({ error: "month and year are required" });
            }

            const run = await prisma.payrollRun.findUnique({
                where: {
                    month_year: { month, year },
                },
                include: {
                    items: {
                        include: {
                            employee: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    department: { select: { id: true, name: true } },
                                    role: { select: { id: true, title: true } },
                                },
                            },
                            adjustments: true,
                        },
                        orderBy: { createdAt: "desc" },
                    },
                },
            });

            return res.status(200).json(run);
        } catch (error) {
            console.error("Error fetching payroll run:", error);
            return res.status(500).json({ error: "Failed to fetch payroll run" });
        }
    };

/**
 * POST generate payroll for month/year
 * Creates payroll run if not exists.
 * Generates snapshot payroll items for ALL employees.
 */
export const generatePayrollRun = async (req: Request, res: Response) => {
    try {
        const { month, year } = req.body;

        if (!month || !year) {
            return res.status(400).json({ error: "month and year are required" });
        }

        // ✅ Get global settings (OT config + working days/hours)
        const settings = await prisma.appSettings.findFirst();
        if (!settings) {
            return res.status(400).json({
                error: "App settings not found. Please configure OT Settings first.",
            });
        }

        const workingDays = settings.workingDays || 26;
        const workingHours = settings.workingHours || 8;
        const payrollEndDate = new Date(year, month, 0);
        // ✅ Fetch all employees (ACTIVE only is optional)
        const employees = await prisma.employee.findMany({
            where: {
                hireDate: {
                    lte: payrollEndDate,
                },
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                salary: true,
                salaryStructure: true,
            },
            orderBy: { createdAt: "desc" },
        });
        console.log(employees);
        // ✅ Fetch attendance for month/year
        const attendanceList = await prisma.employeeMonthlyAttendance.findMany({
            where: { month, year },
            select: { employeeId: true, presentDays: true, otHours: true },
        });

        const attendanceMap = new Map(
            attendanceList.map((a) => [
                a.employeeId,
                {
                    presentDays: Number(a.presentDays || 0),
                    otHours: Number(a.otHours || 0),
                },
            ])
        );

        // ✅ Find or create PayrollRun for month/year
        const run = await prisma.payrollRun.upsert({
            where: {
                month_year: { month, year },
            },
            update: {},
            create: {
                month,
                year,
                status: "DRAFT",
            },
        });

        // ✅ Delete existing items (optional depending on your design)
        // For now: regenerate completely each time (DRAFT only)
        await prisma.payrollItem.deleteMany({
            where: { payrollRunId: run.id },
        });

        // ✅ Create fresh payroll items (snapshot)
        const itemsToCreate = employees.map((emp) => {
            const monthlySalary = Number(emp.salary || 0);

            const attendance: { presentDays: number; otHours: number } =
                attendanceMap.get(emp.id) || { presentDays: 0, otHours: 0 };

            const presentDays = attendance.presentDays;
            const otHours = attendance.otHours;


            // ✅ Salary structure breakup fallback
            const basicPay = Number(emp.salaryStructure?.basicPay || 0);
            const hra = Number(emp.salaryStructure?.hra || 0);
            const allowance = Number(emp.salaryStructure?.allowance || 0);

            // ✅ regular pay calculation
            const perDaySalary = workingDays > 0 ? monthlySalary / workingDays : 0;
            const regularPay = round2(perDaySalary * presentDays);

            // ✅ OT pay calculation
            let otPay = 0;

            if (settings.otType === "FIXED") {
                const rate = Number(settings.fixedOtRate || 0);
                otPay = round2(otHours * rate);
            } else {
                // MULTIPLIER type
                const hourlyPay =
                    workingDays > 0 && workingHours > 0
                        ? monthlySalary / workingDays / workingHours
                        : 0;

                const multiplier = Number(settings.otMultiplier || 1);
                otPay = round2(otHours * hourlyPay * multiplier);
            }

            const grossPay = round2(regularPay + otPay);

            // ✅ adjustments will be stored separately, but we keep snapshot as 0 initially
            const adjustmentTotal = 0;
            const netPay = round2(grossPay + adjustmentTotal);

            return {
                payrollRunId: run.id,
                employeeId: emp.id,

                monthlySalary,

                presentDays,
                otHours,

                basicPay,
                hra,
                allowance,

                regularPay,
                otPay,
                grossPay,

                adjustmentTotal,
                netPay,
            };
        });

        // ✅ bulk create payroll items
        await prisma.payrollItem.createMany({
            data: itemsToCreate,
        });

        const finalRun = await prisma.payrollRun.findUnique({
            where: { id: run.id },
            include: {
                items: {
                    include: {
                        employee: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                        adjustments: true,
                    },
                },
            },
        });

        return res.status(200).json({
            message: "Payroll generated successfully ✅",
            payrollRun: finalRun,
        });
    } catch (error) {
        console.error("Error generating payroll:", error);
        return res.status(500).json({ error: "Failed to generate payroll" });
    }
};
export const updatePayrollRunStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "status is required" });
        }

        const run = await prisma.payrollRun.findUnique({ where: { id } });

        if (!run) {
            return res.status(404).json({ error: "Payroll run not found" });
        }

        const allowed = ["DRAFT", "GENERATED", "PAID"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        // ✅ optional: restrict backward status change
        if (run.status === "PAID" && status !== "PAID") {
            return res.status(400).json({
                error: "Payroll is already PAID. Status cannot be changed back.",
            });
        }

        const updated = await prisma.payrollRun.update({
            where: { id },
            data: { status },
        });

        return res.status(200).json({
            message: "Payroll status updated ✅",
            payrollRun: updated,
        });
    } catch (error) {
        console.error("Error updating payroll status:", error);
        return res.status(500).json({ error: "Failed to update payroll status" });
    }
};
