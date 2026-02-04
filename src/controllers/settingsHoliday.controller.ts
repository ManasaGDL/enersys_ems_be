import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

// ✅ GET Holidays by month/year
export const getHolidaysByMonthYear = async (req: Request, res: Response) => {
    try {
        const month = req.query.month ? Number(req.query.month) : null;
        const year = req.query.year ? Number(req.query.year) : null;

        // ✅ CASE 1: month + year (filter by month)
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);

            const holidays = await prisma.holiday.findMany({
                where: {
                    isActive: true,
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                orderBy: { date: "asc" },
            });

            return res.status(200).json(holidays);
        }

        // ✅ CASE 2: only year (return full year holidays)
        if (year && !month) {
            const startDate = new Date(year, 0, 1); // Jan 1
            const endDate = new Date(year, 11, 31, 23, 59, 59); // Dec 31 end

            const holidays = await prisma.holiday.findMany({
                where: {
                    isActive: true,
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                orderBy: { date: "asc" },
            });

            return res.status(200).json(holidays);
        }

        // ✅ CASE 3: no filters (return all)
        const holidays = await prisma.holiday.findMany({
            where: { isActive: true },
            orderBy: { date: "asc" },
        });

        return res.status(200).json(holidays);
    } catch (error) {
        console.error("Error fetching holidays:", error);
        return res.status(500).json({ error: "Failed to fetch holidays" });
    }
};


// ✅ ADD Holiday
export const createHoliday = async (req: Request, res: Response) => {
    try {
        const { date, name } = req.body;

        if (!date) {
            return res.status(400).json({ error: "date is required" });
        }

        const holidayDate = new Date(date);

        const created = await prisma.holiday.create({
            data: {
                date: holidayDate,
                name: name || null,
                isActive: true,
            },
        });

        return res.status(201).json({
            message: "Holiday added successfully ✅",
            holiday: created,
        });
    } catch (error: any) {
        console.error("Error creating holiday:", error);

        // ✅ Unique constraint error
        if (error?.code === "P2002") {
            return res.status(409).json({ error: "Holiday already exists for this date" });
        }

        return res.status(500).json({ error: "Failed to create holiday" });
    }
};

// ✅ DELETE Holiday (hard delete)
export const deleteHoliday = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const holiday = await prisma.holiday.findUnique({ where: { id } });
        if (!holiday) {
            return res.status(404).json({ error: "Holiday not found" });
        }

        await prisma.holiday.delete({ where: { id } });

        return res.status(200).json({ message: "Holiday deleted ✅" });
    } catch (error) {
        console.error("Error deleting holiday:", error);
        return res.status(500).json({ error: "Failed to delete holiday" });
    }
};
export const updateHoliday = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { date, name, isActive } = req.body;

        const existing = await prisma.holiday.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "Holiday not found" });
        }

        const updated = await prisma.holiday.update({
            where: { id },
            data: {
                date: date ? new Date(date) : undefined,
                name: name ?? undefined,
                isActive: typeof isActive === "boolean" ? isActive : undefined,
            },
        });

        return res.status(200).json({
            message: "Holiday updated ✅",
            holiday: updated,
        });
    } catch (error: any) {
        console.error("Error updating holiday:", error);

        if (error?.code === "P2002") {
            return res.status(409).json({ error: "Holiday already exists for this date" });
        }

        return res.status(500).json({ error: "Failed to update holiday" });
    }
};
