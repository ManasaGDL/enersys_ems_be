import { Request, Response } from "express";
import { prisma } from "../../lib/prisma"
const createDepartment = async (Request: Request, Response: Response) => {
    try {
        const { name } = Request.body;
        if (!name) {
            return Response.status(400).json({ message: "Name is required" })
        }
        console.log(name);
        const newDepartment = await prisma.department.create({ data: { name } })
        return Response.status(201).json({ message: "Department created successfully", data: newDepartment })
    } catch (e) {
        return Response.status(500).json({ message: "Internal server error" })
    }
}

const editDepartment = async (Request: Request, Response: Response) => {
    try {
        const { name } = Request.body;
        const { id } = Request.params;
        if (!name || !id) {
            return Response.status(400).json({ message: "Name and id are required" })
        }
        const updatedDepartment = await prisma.department.update({ where: { id }, data: { name } })
        return Response.status(200).json({ message: "Department updated successfully", data: updatedDepartment })
    } catch (e) {
        return Response.status(500).json({ message: "Internal server error" })
    }
}
const deleteDepartment = async (Request: Request, Response: Response) => {
    try {
        const { id } = Request.params;
        if (!id) {
            return Response.status(400).json({ message: "Id is required" })
        }
        const deletedDepartment = await prisma.department.delete({ where: { id } })
        return Response.status(200).json({ message: "Department deleted successfully", data: deletedDepartment })
    } catch (e) {
        return Response.status(500).json({ message: "Internal server error" })
    }
}

const getAllDepartments = async (Request: Request, Response: Response) => {
    try {
        const departments = await prisma.department.findMany()
        console.log(departments);
        return Response.status(200).json({ message: "Departments fetched successfully", data: departments })
    } catch (e) {
        return Response.status(500).json({ message: "Internal server error" })
    }
}


const editDepartmentStatus = async (Request: Request, Response: Response) => {
    try {
        const { status } = Request.body;
        const { id } = Request.params;
        if (!status || !id) {
            return Response.status(400).json({ message: "Status and id are required" })
        }
        const updatedDepartment = await prisma.department.update({ where: { id }, data: { status } })
        return Response.status(200).json({ message: "Department status updated successfully", data: updatedDepartment })
    } catch (e) {
        return Response.status(500).json({ message: "Internal server error" })
    }
}
export {
    createDepartment,
    editDepartment,
    deleteDepartment,
    getAllDepartments,
    editDepartmentStatus
}