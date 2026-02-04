
// import { prisma } from "../../lib/prisma"
// import { Request, Response } from "express";
// import { Prisma } from "../../generated/prisma/client";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { Decimal } from "decimal.js";


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

import { prisma } from "../../lib/prisma"
import { Request, Response } from "express";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Decimal } from "decimal.js";

export const createEmployee = async (request: Request, response: Response) => {
    try {
        const {
            firstName,
            email,
            phone,
            hireDate,
            aadhaar,
            experience,
            password,
            departmentId,
            roleId,
            type,
            salary,
            paymentType,
        } = request.body;
        console.log("22", request.body)
        if (!password || password.trim().length < 6) {
            return response.status(400).json({
                message: "Password is required and must be at least 6 characters",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.employee.create({
            data: {
                firstName,
                email,
                phone,
                salary,
                hireDate,
                aadhaar: aadhaar ? aadhaar.toString().replace(/\D/g, '') : null,
                password: hashedPassword,
                departmentId: departmentId ?? null,
                roleId: roleId ?? null,
                experience: experience
                    ? new Decimal(experience)
                    : null,
                type: type ?? "CONTRACT",
                paymentType: paymentType ?? "MONTHLY",
            },
        });

        return response.status(201).json({
            message: "Employee created successfully",
            data: newUser,
        });
    } catch (e: any) {
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
export const employeeLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }
        const userExists = await prisma.employee.findUnique({
            where: { email }
        })
        if (!userExists) {
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }
        if (userExists.status !== "ACTIVE") {
            return res.status(403).json({
                message: "Employee is inactive",
            });
        }
        const isPasswordValid = await bcrypt.compare(password, userExists.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }
        const token = jwt.sign(
            {
                employeeId: userExists.id,
                type: "EMPLOYEE",
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "1d",
            }
        );
        return res.status(200).json({
            message: "Login successful",
            token,
        })
    } catch (e: any) {
        console.log(e)
        return res.status(500).json({
            message: "Failed to login",
        })
    }

}
export const getEmployees = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        jwt.verify(token, process.env.JWT_SECRET!);

        const employees = await prisma.employee.findMany({
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

        return res.json(
            employees.map((e) => ({
                id: e.id,
                firstName: e.firstName,
                email: e.email,
                phone: e.phone,
                experience: e.experience?.toNumber() ?? null,
                salary: e.salary?.toNumber() ?? null,
                department: e.department?.name ?? null,
                role: e.role?.title ?? null,
                status: e.status,
            }))
        );
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export const updateEmployee = async (req: Request, res: Response) => {
    try {
        console.log("edit")
        const { id } = req.params;
        console.log("2222", id)
        const { firstName, lastName, email, phone, departmentId, roleId, ...rest } = req.body;
        const updatedEmployee = await prisma.employee.update({
            where: { id },
            data: {
                ...rest,
                firstName, lastName, email, phone, departmentId: departmentId || null,
                roleId: roleId || null,
            },
        });
        return res.json(updatedEmployee);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Failed to update employee",
        });
    }
};
export const deleteEmployee = async (req: Request, res: Response) => {
    try {
        console.log(req.params)
        const { id } = req.params;
        const deletedEmployee = await prisma.employee.delete({
            where: { id },
        });
        return res.json(deletedEmployee);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Failed to delete employee",
        });
    }
};
export const toggleEmployeeStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const employee = await prisma.employee.update({
            where: { id },
            data: { status },
        });
        return res.json(employee);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Failed to toggle employee status",
        });
    }
};
export const getEmployeeById = async (req: Request, res: Response) => {
    try {
        console.log(req.params)
        const { id } = req.params;

        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                salaryStructure: true,
            },
        });
        return res.json(employee);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Failed to get employee by id",
        });
    }
};
export const updateEmployeePassword = async (req: Request, res: Response) => {
    try {
        console.log(req.params)
        const { id } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.employee.update({
            where: { id },
            data: { password: hashedPassword },
        });

        return res.json({ message: "Password updated successfully" });
    } catch (e) {
        return res.status(500).json({
            message: "Failed to update password",
        });
    }
};
