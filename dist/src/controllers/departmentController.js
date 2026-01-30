"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editDepartmentStatus = exports.getAllDepartments = exports.deleteDepartment = exports.editDepartment = exports.createDepartment = void 0;
const prisma_1 = require("../../lib/prisma");
const createDepartment = async (Request, Response) => {
    try {
        const { name } = Request.body;
        if (!name) {
            return Response.status(400).json({ message: "Name is required" });
        }
        console.log(name);
        const newDepartment = await prisma_1.prisma.department.create({ data: { name } });
        return Response.status(201).json({ message: "Department created successfully", data: newDepartment });
    }
    catch (e) {
        return Response.status(500).json({ message: "Internal server error" });
    }
};
exports.createDepartment = createDepartment;
const editDepartment = async (Request, Response) => {
    try {
        const { name } = Request.body;
        const { id } = Request.params;
        if (!name || !id) {
            return Response.status(400).json({ message: "Name and id are required" });
        }
        const updatedDepartment = await prisma_1.prisma.department.update({ where: { id }, data: { name } });
        return Response.status(200).json({ message: "Department updated successfully", data: updatedDepartment });
    }
    catch (e) {
        return Response.status(500).json({ message: "Internal server error" });
    }
};
exports.editDepartment = editDepartment;
const deleteDepartment = async (Request, Response) => {
    try {
        const { id } = Request.params;
        if (!id) {
            return Response.status(400).json({ message: "Id is required" });
        }
        const deletedDepartment = await prisma_1.prisma.department.delete({ where: { id } });
        return Response.status(200).json({ message: "Department deleted successfully", data: deletedDepartment });
    }
    catch (e) {
        return Response.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteDepartment = deleteDepartment;
const getAllDepartments = async (Request, Response) => {
    try {
        const departments = await prisma_1.prisma.department.findMany();
        console.log(departments);
        return Response.status(200).json({ message: "Departments fetched successfully", data: departments });
    }
    catch (e) {
        return Response.status(500).json({ message: "Internal server error" });
    }
};
exports.getAllDepartments = getAllDepartments;
const editDepartmentStatus = async (Request, Response) => {
    try {
        const { status } = Request.body;
        const { id } = Request.params;
        if (!status || !id) {
            return Response.status(400).json({ message: "Status and id are required" });
        }
        const updatedDepartment = await prisma_1.prisma.department.update({ where: { id }, data: { status } });
        return Response.status(200).json({ message: "Department status updated successfully", data: updatedDepartment });
    }
    catch (e) {
        return Response.status(500).json({ message: "Internal server error" });
    }
};
exports.editDepartmentStatus = editDepartmentStatus;
