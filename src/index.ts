import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import employeeRoutes from './routes/employee.routes';
import superAdminAuthRoutes from './routes/superAdminAuth.routes';
import departmentRoutes from './routes/department.routes';
import roleRoutes from './routes/role.route';
import projectRoutes from './routes/project.routes';
import salaryStructureRoutes from './routes/salaryStructure.routes';
import settingsRoutes from './routes/settings.route';
import attendanceRoutes from './routes/attendance.routes';
import payrollRoutes from "./routes/payroll.routes";
import payrollAdjustmentRoutes from "./routes/payrollAdjustment.routes";
import payslipRoutes from "./routes/payslip.routes";
dotenv.config();

const app = express();
app.use((req, res, next) => {
    console.log(`\n🌐 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    console.log("📦 Request Body:", req.body);
    console.log("🔑 Headers - Authorization:", req.headers.authorization);
    next();
});

app.use(cors());
app.use(express.json());
app.use("/auth/super-admin", superAdminAuthRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/salary-structure', salaryStructureRoutes);
app.use('/api/settings', settingsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/payroll-adjustments", payrollAdjustmentRoutes);
app.use("/api/payslip", payslipRoutes);
app.get('/health', (_, res) => {
    res.json({ status: 'OK' });
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
