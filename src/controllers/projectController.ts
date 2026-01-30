import { Request, Response } from "express";
import { prisma } from "../../lib/prisma"

export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, description, status } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Project name is required" });
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                status,
            },
        });
        res.status(201).json({ message: "Project created successfully", project });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Failed to create project" });
    }
};

export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const projects = await prisma.project.findMany();
        res.status(200).json({ message: "Projects fetched successfully", projects });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({
            where: { id },
        });
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        res.status(200).json({ message: "Project fetched successfully", project });
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ error: "Failed to fetch project" });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;
        const project = await prisma.project.update({
            where: { id },
            data: {
                name,
                description,
                status,
            },
        });
        res.status(200).json({ message: "Project updated successfully", project });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ error: "Failed to update project" });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.delete({
            where: { id },
        });
        res.status(200).json({ message: "Project deleted successfully", project });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ error: "Failed to delete project" });
    }
};
