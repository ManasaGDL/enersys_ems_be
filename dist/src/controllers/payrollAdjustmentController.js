"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePayrollAdjustment = exports.addPayrollAdjustment = void 0;
const prisma_1 = require("../../lib/prisma");
const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};
const round2 = (n) => Math.round(n * 100) / 100;
// ✅ recompute PayrollItem totals based on adjustments
const recalcPayrollItemTotals = async (payrollItemId) => {
    const item = await prisma_1.prisma.payrollItem.findUnique({
        where: { id: payrollItemId },
        include: { adjustments: true },
    });
    if (!item)
        return null;
    const grossPay = toNum(item.grossPay);
    const adjustmentTotal = item.adjustments.reduce((acc, a) => {
        const amount = toNum(a.amount);
        return acc + (a.type === "ADDITION" ? amount : -amount);
    }, 0);
    const netPay = round2(grossPay + adjustmentTotal);
    const updated = await prisma_1.prisma.payrollItem.update({
        where: { id: payrollItemId },
        data: {
            adjustmentTotal,
            netPay,
        },
    });
    return updated;
};
const addPayrollAdjustment = async (req, res) => {
    try {
        const { payrollItemId, date, type, amount, reason, notes } = req.body;
        if (!payrollItemId || !date || !type || amount === undefined || !reason) {
            return res.status(400).json({
                error: "payrollItemId, date, type, amount, reason are required",
            });
        }
        const item = await prisma_1.prisma.payrollItem.findUnique({
            where: { id: payrollItemId },
            include: { payrollRun: true }, // ✅ to check status
        });
        if (!item) {
            return res.status(404).json({ error: "Payroll item not found" });
        }
        // ✅ If payroll is PAID, don't allow modifications
        if (item.payrollRun.status === "PAID") {
            return res.status(400).json({
                error: "Payroll is already marked PAID. Adjustments cannot be modified.",
            });
        }
        const adj = await prisma_1.prisma.payrollAdjustment.create({
            data: {
                payrollItemId,
                date: new Date(date),
                type,
                amount,
                reason,
                notes: notes || null,
            },
        });
        const updatedItem = await recalcPayrollItemTotals(payrollItemId);
        return res.status(201).json({
            message: "Adjustment added ✅",
            adjustment: adj,
            payrollItem: updatedItem,
        });
    }
    catch (error) {
        console.error("Error adding payroll adjustment:", error);
        return res.status(500).json({ error: "Failed to add payroll adjustment" });
    }
};
exports.addPayrollAdjustment = addPayrollAdjustment;
const deletePayrollAdjustment = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma_1.prisma.payrollAdjustment.findUnique({
            where: { id },
            include: {
                payrollItem: {
                    include: { payrollRun: true },
                },
            },
        });
        if (!existing) {
            return res.status(404).json({ error: "Adjustment not found" });
        }
        // ✅ If payroll is PAID, don't allow modifications
        if (existing.payrollItem.payrollRun.status === "PAID") {
            return res.status(400).json({
                error: "Payroll is already marked PAID. Adjustments cannot be modified.",
            });
        }
        const payrollItemId = existing.payrollItemId;
        await prisma_1.prisma.payrollAdjustment.delete({
            where: { id },
        });
        const updatedItem = await recalcPayrollItemTotals(payrollItemId);
        return res.status(200).json({
            message: "Adjustment deleted ✅",
            payrollItem: updatedItem,
        });
    }
    catch (error) {
        console.error("Error deleting payroll adjustment:", error);
        return res.status(500).json({ error: "Failed to delete payroll adjustment" });
    }
};
exports.deletePayrollAdjustment = deletePayrollAdjustment;
