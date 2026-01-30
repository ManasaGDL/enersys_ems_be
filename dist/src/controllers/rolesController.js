"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editRoleStatus = exports.getAllRoles = exports.deleteRole = exports.editRole = exports.createRole = void 0;
const prisma_1 = require("../../lib/prisma");
const createRole = async (Request, Response) => {
    try {
        const { title } = Request.body;
        if (!title) {
            return Response.status(400).json({ message: "Title is required" });
        }
        console.log(title);
        const newRole = await prisma_1.prisma.role.create({ data: { title } });
        return Response.status(201).json({ message: "Role created successfully", data: newRole });
    }
    catch (e) {
        return Response.status(500).json({ message: "Internal server error" });
    }
};
exports.createRole = createRole;
const editRole = async (Request, Response) => {
    try {
        const { title } = Request.body;
        const { id } = Request.params;
        if (!title || !id) {
            return Response.status(400).json({ message: "Title and id are required" });
        }
        const updatedRole = await prisma_1.prisma.role.update({ where: { id }, data: { title } });
        return Response.status(200).json({ message: "Role updated successfully", data: updatedRole });
    }
    catch (e) {
        return Response.status(500).json({ message: "Internal server error" });
    }
};
exports.editRole = editRole;
const deleteRole = async (Request, Response) => {
    try {
        const { id } = Request.params;
        if (!id) {
            return Response.status(400).json({ message: "Id is required" });
        }
        const deletedRole = await prisma_1.prisma.role.delete({ where: { id } });
        return Response.status(200).json({ message: "Role deleted successfully", data: deletedRole });
    }
    catch (e) {
        return Response.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteRole = deleteRole;
const getAllRoles = async (Request, Response) => {
    try {
        const roles = await prisma_1.prisma.role.findMany();
        return Response.status(200).json({ message: "Roles fetched successfully", data: roles });
    }
    catch (e) {
        return Response.status(500).json({ message: "Internal server error" });
    }
};
exports.getAllRoles = getAllRoles;
const editRoleStatus = async (Request, Response) => {
    try {
        const { status } = Request.body;
        const { id } = Request.params;
        if (!status || !id) {
            return Response.status(400).json({ message: "Status and id are required" });
        }
        const updatedRole = await prisma_1.prisma.role.update({ where: { id }, data: { status } });
        return Response.status(200).json({ message: "Role status updated successfully", data: updatedRole });
    }
    catch (e) {
        return Response.status(500).json({ message: "Internal server error" });
    }
};
exports.editRoleStatus = editRoleStatus;
