"use strict";
// import { prisma } from "../../lib/prisma"
// import { Request, Response } from "express";
// import { Prisma } from "../../generated/prisma/client";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { Decimal } from "decimal.js";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmployeePassword = exports.getEmployeeById = exports.toggleEmployeeStatus = exports.deleteEmployee = exports.updateEmployee = exports.getEmployees = exports.employeeLogin = exports.createEmployee = void 0;
// export const createEmployee = async (request: Request, response: Response) => {
//     try {
//         const {
//             firstName,
//             email,
//             phone,
//             aadhaar,
//             experience,
//             password,
//             departmentId,
//             roleId,
//         } = request.body;
//         console.log("22", request.body)
//         if (!password || password.trim().length < 6) {
//             return response.status(400).json({
//                 message: "Password is required and must be at least 6 characters",
//             });
//         }
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newUser = await prisma.employee.create({
//             data: {
//                 firstName,
//                 email,
//                 phone,
//                 aadhaar: aadhaar ? String(aadhaar) : null, // ✅ simple string
//                 password: hashedPassword,
//                 departmentId: departmentId ?? null,
//                 roleId: roleId ?? null,
//                 experience: experience ? new Decimal(experience) : null,
//             },
//         });
//         return response.status(201).json({
//             message: "Employee created successfully",
//             data: newUser,
//         });
//     } catch (e: any) {
//         console.error("========== PRISMA ERROR START ==========");
//         console.error(e);
//         console.error("message:", e?.message);
//         console.error("code:", e?.code);
//         console.error("meta:", e?.meta);
//         console.error("stack:", e?.stack);
//         console.error("=========== PRISMA ERROR END ===========");
//         return response.status(500).json({
//             message: e?.message || "Internal Server Error",
//             code: e?.code,
//             meta: e?.meta,
//         });
//     }
// };
const prisma_1 = require("../../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const decimal_js_1 = require("decimal.js");
const createEmployee = async (request, response) => {
    try {
        const { firstName, email, phone, aadhaar, experience, password, departmentId, roleId, type, salary, paymentType, } = request.body;
        console.log("22", request.body);
        if (!password || password.trim().length < 6) {
            return response.status(400).json({
                message: "Password is required and must be at least 6 characters",
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = await prisma_1.prisma.employee.create({
            data: {
                firstName,
                email,
                phone,
                salary,
                aadhaar: aadhaar ? aadhaar.toString().replace(/\D/g, '') : null,
                password: hashedPassword,
                departmentId: departmentId ?? null,
                roleId: roleId ?? null,
                experience: experience
                    ? new decimal_js_1.Decimal(experience)
                    : null,
                type: type ?? "CONTRACT",
                paymentType: paymentType ?? "MONTHLY",
            },
        });
        return response.status(201).json({
            message: "Employee created successfully",
            data: newUser,
        });
    }
    catch (e) {
        console.error("========== PRISMA ERROR START ==========");
        console.error(e);
        console.error("message:", e?.message);
        console.error("code:", e?.code);
        console.error("meta:", e?.meta);
        console.error("stack:", e?.stack);
        console.error("=========== PRISMA ERROR END ===========");
        return response.status(500).json({
            message: e?.message || "Internal Server Error",
            code: e?.code,
            meta: e?.meta,
        });
    }
};
exports.createEmployee = createEmployee;
const employeeLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        const userExists = await prisma_1.prisma.employee.findUnique({
            where: { email }
        });
        if (!userExists) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }
        if (userExists.status !== "ACTIVE") {
            return res.status(403).json({
                message: "Employee is inactive",
            });
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, userExists.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }
        const token = jsonwebtoken_1.default.sign({
            employeeId: userExists.id,
            type: "EMPLOYEE",
        }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        return res.status(200).json({
            message: "Login successful",
            token,
        });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Failed to login",
        });
    }
};
exports.employeeLogin = employeeLogin;
const getEmployees = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const employees = await prisma_1.prisma.employee.findMany({
            select: {
                id: true,
                firstName: true,
                email: true,
                phone: true,
                status: true,
                experience: true,
                salary: true,
                address: true,
                department: {
                    select: { name: true },
                },
                role: {
                    select: { title: true },
                },
            },
        });
        return res.json(employees.map((e) => ({
            id: e.id,
            firstName: e.firstName,
            email: e.email,
            phone: e.phone,
            experience: e.experience?.toNumber() ?? null,
            salary: e.salary?.toNumber() ?? null,
            department: e.department?.name ?? null,
            role: e.role?.title ?? null,
            status: e.status,
        })));
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.getEmployees = getEmployees;
const updateEmployee = async (req, res) => {
    try {
        console.log("edit");
        const { id } = req.params;
        console.log("2222", id);
        const { firstName, lastName, email, phone, departmentId, roleId, ...rest } = req.body;
        const updatedEmployee = await prisma_1.prisma.employee.update({
            where: { id },
            data: {
                ...rest,
                firstName, lastName, email, phone, departmentId: departmentId || null,
                roleId: roleId || null,
            },
        });
        return res.json(updatedEmployee);
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Failed to update employee",
        });
    }
};
exports.updateEmployee = updateEmployee;
const deleteEmployee = async (req, res) => {
    try {
        console.log(req.params);
        const { id } = req.params;
        const deletedEmployee = await prisma_1.prisma.employee.delete({
            where: { id },
        });
        return res.json(deletedEmployee);
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Failed to delete employee",
        });
    }
};
exports.deleteEmployee = deleteEmployee;
const toggleEmployeeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const employee = await prisma_1.prisma.employee.update({
            where: { id },
            data: { status },
        });
        return res.json(employee);
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Failed to toggle employee status",
        });
    }
};
exports.toggleEmployeeStatus = toggleEmployeeStatus;
const getEmployeeById = async (req, res) => {
    try {
        console.log(req.params);
        const { id } = req.params;
        const employee = await prisma_1.prisma.employee.findUnique({
            where: { id },
            include: {
                salaryStructure: true,
            },
        });
        return res.json(employee);
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Failed to get employee by id",
        });
    }
};
exports.getEmployeeById = getEmployeeById;
const updateEmployeePassword = async (req, res) => {
    try {
        console.log(req.params);
        const { id } = req.params;
        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        await prisma_1.prisma.employee.update({
            where: { id },
            data: { password: hashedPassword },
        });
        return res.json({ message: "Password updated successfully" });
    }
    catch (e) {
        return res.status(500).json({
            message: "Failed to update password",
        });
    }
};
exports.updateEmployeePassword = updateEmployeePassword;
