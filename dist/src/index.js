"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const employee_routes_1 = __importDefault(require("./routes/employee.routes"));
const superAdminAuth_routes_1 = __importDefault(require("./routes/superAdminAuth.routes"));
const department_routes_1 = __importDefault(require("./routes/department.routes"));
const role_route_1 = __importDefault(require("./routes/role.route"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const salaryStructure_routes_1 = __importDefault(require("./routes/salaryStructure.routes"));
const settings_route_1 = __importDefault(require("./routes/settings.route"));
const attendance_routes_1 = __importDefault(require("./routes/attendance.routes"));
const payroll_routes_1 = __importDefault(require("./routes/payroll.routes"));
const payrollAdjustment_routes_1 = __importDefault(require("./routes/payrollAdjustment.routes"));
const payslip_routes_1 = __importDefault(require("./routes/payslip.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((req, res, next) => {
    console.log(`\n🌐 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    console.log("📦 Request Body:", req.body);
    console.log("🔑 Headers - Authorization:", req.headers.authorization);
    next();
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/auth/super-admin", superAdminAuth_routes_1.default);
app.use('/api/employees', employee_routes_1.default);
app.use('/api/departments', department_routes_1.default);
app.use('/api/roles', role_route_1.default);
app.use('/api/projects', project_routes_1.default);
app.use('/api/salary-structure', salaryStructure_routes_1.default);
app.use('/api/settings', settings_route_1.default);
app.use("/api/attendance", attendance_routes_1.default);
app.use("/api/payroll", payroll_routes_1.default);
app.use("/api/payroll-adjustments", payrollAdjustment_routes_1.default);
app.use("/api/payslip", payslip_routes_1.default);
app.get('/health', (_, res) => {
    res.json({ status: 'OK' });
});
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
