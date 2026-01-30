"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpsertSalaryStructures = exports.getAllSalaryStructures = void 0;
const prisma_1 = require("../../lib/prisma");
const generateDefaultStructure = (salary) => {
    const monthlySalary = salary || 0;
    let basicPay = 0;
    let allowance = 0;
    if (monthlySalary <= 15000) {
        basicPay = monthlySalary;
        allowance = 0;
    }
    else {
        basicPay = 15000;
        // ✅ allowance rule (safe)
        if (monthlySalary >= 20000) {
            allowance = 5000;
        }
    }
    let hra = monthlySalary - basicPay - allowance;
    if (hra < 0)
        hra = 0;
    return {
        monthlySalary,
        basicPay,
        hra,
        allowance,
    };
};
const needsDefaultStructure = (ss) => {
    if (!ss)
        return true;
    const monthlySalary = Number(ss.monthlySalary ?? 0);
    const basicPay = Number(ss.basicPay ?? 0);
    const hra = Number(ss.hra ?? 0);
    const allowance = Number(ss.allowance ?? 0);
    // if any important field is 0 or missing → treat as not configured
    if (monthlySalary <= 0)
        return true;
    if (basicPay <= 0)
        return true;
    // ✅ optional: if all are 0 then definitely bad
    if (basicPay === 0 && hra === 0 && allowance === 0)
        return true;
    // ✅ optional: invalid breakup (negative values)
    if (basicPay < 0 || hra < 0 || allowance < 0)
        return true;
    return false;
};
const getAllSalaryStructures = async (req, res) => {
    try {
        const employees = await prisma_1.prisma.employee.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                status: true,
                salary: true,
                department: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                role: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                salaryStructure: true
            },
            orderBy: { createdAt: "desc" },
        });
        const result = employees.map((emp) => {
            const defaultStructure = generateDefaultStructure(Number(emp.salary || 0));
            const salaryChanged = emp.salaryStructure &&
                Number(emp.salaryStructure.monthlySalary || 0) !== Number(emp.salary || 0);
            const shouldUseDefault = needsDefaultStructure(emp.salaryStructure) || salaryChanged;
            return {
                ...emp,
                salaryStructure: shouldUseDefault
                    ? {
                        employeeId: emp.id,
                        monthlySalary: defaultStructure.monthlySalary,
                        basicPay: defaultStructure.basicPay,
                        hra: defaultStructure.hra,
                        allowance: defaultStructure.allowance,
                    }
                    : emp.salaryStructure,
            };
        });
        return res.status(200).json(result);
    }
    catch (e) {
        console.error("Error fetching salary structures:", e);
        return res.status(500).json({ error: "Failed to fetch salary structures" });
    }
};
exports.getAllSalaryStructures = getAllSalaryStructures;
const bulkUpsertSalaryStructures = async (req, res) => {
    try {
        const { salaryStructures } = req.body;
        if (!salaryStructures || !Array.isArray(salaryStructures)) {
            return res.status(400).json({
                error: "salaryStructures must be an array",
            });
        }
        if (salaryStructures.length === 0) {
            return res.status(400).json({
                error: "salaryStructures array cannot be empty",
            });
        }
        const employeeIds = salaryStructures.map((s) => s.employeeId);
        const existingEmployees = await prisma_1.prisma.employee.findMany({
            where: { id: { in: employeeIds } },
            select: { id: true, salary: true }
        });
        const employeeSalaryMap = new Map(existingEmployees.map((e) => [e.id, e.salary]));
        const existingEmployeeIds = existingEmployees.map((e) => e.id);
        const invalidEmployeeIds = employeeIds.filter((id) => !existingEmployeeIds.includes(id));
        if (invalidEmployeeIds.length > 0) {
            return res.status(400).json({
                error: "Some employeeIds are invalid",
                invalidEmployeeIds,
            });
        }
        const results = await prisma_1.prisma.$transaction(salaryStructures.map((s) => {
            const defaultSalary = employeeSalaryMap.get(s.employeeId) || 0;
            const finalMonthlySalary = s.monthlySalary !== undefined && s.monthlySalary !== null
                ? s.monthlySalary
                : defaultSalary;
            const fallback = generateDefaultStructure(Number(finalMonthlySalary));
            const finalBasicPay = s.basicPay ?? fallback.basicPay;
            const finalHra = s.hra ?? fallback.hra;
            const finalAllowance = s.allowance ?? fallback.allowance;
            return prisma_1.prisma.employeeSalaryStructure.upsert({
                where: { employeeId: s.employeeId },
                update: {
                    monthlySalary: finalMonthlySalary,
                    basicPay: finalBasicPay,
                    hra: finalHra,
                    allowance: finalAllowance,
                    otType: s.otType,
                    otRatePerHour: s.otRatePerHour ?? null,
                    otMultiplier: s.otMultiplier ?? null,
                },
                create: {
                    employeeId: s.employeeId,
                    monthlySalary: finalMonthlySalary,
                    basicPay: finalBasicPay,
                    hra: finalHra,
                    allowance: finalAllowance,
                    otType: s.otType,
                    otRatePerHour: s.otRatePerHour ?? null,
                    otMultiplier: s.otMultiplier ?? null,
                },
            });
        }));
        return res.status(200).json({
            message: "Salary structures updated successfully",
            savedCount: results.length,
        });
    }
    catch (e) {
        console.error("Error bulk saving salary structures:", e);
        return res.status(500).json({ error: "Failed to save salary structures" });
    }
};
exports.bulkUpsertSalaryStructures = bulkUpsertSalaryStructures;
