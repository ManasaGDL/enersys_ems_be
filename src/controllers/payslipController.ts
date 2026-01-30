import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const getPayslipByPayrollItemId = async (req: Request, res: Response) => {
    try {
        const { payrollItemId } = req.params;

        if (!payrollItemId) {
            return res.status(400).json({ error: "payrollItemId is required" });
        }

        const item = await prisma.payrollItem.findUnique({
            where: { id: payrollItemId },
            include: {
                payrollRun: true,
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        hireDate: true,
                        salary: true,
                        salaryStructure: true,
                        department: { select: { id: true, name: true } },
                        role: { select: { id: true, title: true } },
                    },
                },
                adjustments: {
                    orderBy: { date: "asc" },
                },
            },
        });

        if (!item) {
            return res.status(404).json({ error: "Payslip not found" });
        }

        return res.status(200).json(item);
    } catch (error) {
        console.error("Error fetching payslip:", error);
        return res.status(500).json({ error: "Failed to fetch payslip" });
    }
};
