"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getAllProjects = exports.createProject = void 0;
const prisma_1 = require("../../lib/prisma");
const createProject = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Project name is required" });
        }
        const project = await prisma_1.prisma.project.create({
            data: {
                name,
                description,
                status,
            },
        });
        res.status(201).json({ message: "Project created successfully", project });
    }
    catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Failed to create project" });
    }
};
exports.createProject = createProject;
const getAllProjects = async (req, res) => {
    try {
        const projects = await prisma_1.prisma.project.findMany();
        res.status(200).json({ message: "Projects fetched successfully", projects });
    }
    catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
};
exports.getAllProjects = getAllProjects;
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma_1.prisma.project.findUnique({
            where: { id },
        });
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        res.status(200).json({ message: "Project fetched successfully", project });
    }
    catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ error: "Failed to fetch project" });
    }
};
exports.getProjectById = getProjectById;
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;
        const project = await prisma_1.prisma.project.update({
            where: { id },
            data: {
                name,
                description,
                status,
            },
        });
        res.status(200).json({ message: "Project updated successfully", project });
    }
    catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ error: "Failed to update project" });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma_1.prisma.project.delete({
            where: { id },
        });
        res.status(200).json({ message: "Project deleted successfully", project });
    }
    catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ error: "Failed to delete project" });
    }
};
exports.deleteProject = deleteProject;
