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

const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(
    cors({
        origin: FRONTEND_URL || true, // ✅ if env missing, allow all temporarily
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.options("*", cors());

app.options("*", cors());


app.options("*", cors());

app.options("*", cors());
app.use(express.json());

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

// ✅ Railway port support
const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Backend running on port ${PORT}`);
});
