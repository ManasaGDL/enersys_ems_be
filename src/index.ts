import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import employeeRoutes from "./routes/employee.routes";
import superAdminAuthRoutes from "./routes/superAdminAuth.routes";
import departmentRoutes from "./routes/department.routes";
import roleRoutes from "./routes/role.route";
import projectRoutes from "./routes/project.routes";
import salaryStructureRoutes from "./routes/salaryStructure.routes";
import settingsRoutes from "./routes/settings.route";
import attendanceRoutes from "./routes/attendance.routes";
import payrollRoutes from "./routes/payroll.routes";
import payrollAdjustmentRoutes from "./routes/payrollAdjustment.routes";
import payslipRoutes from "./routes/payslip.routes";

// ✅ Only use dotenv locally
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const app = express();

app.use(express.json());

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:5173",
].filter(Boolean);

app.use(
    cors({
        origin: (origin, cb) => {
            if (!origin) return cb(null, true);
            if (allowedOrigins.includes(origin)) return cb(null, true);
            return cb(new Error(`CORS blocked: ${origin}`));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// ✅ Preflight
app.options(/.*/, cors());

// ✅ Routes
app.use("/auth/super-admin", superAdminAuthRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/salary-structure", salaryStructureRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/payroll-adjustments", payrollAdjustmentRoutes);
app.use("/api/payslip", payslipRoutes);

app.get("/health", (_, res) => {
    res.json({ status: "OK" });
});

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Backend running on port ${PORT}`);
});
