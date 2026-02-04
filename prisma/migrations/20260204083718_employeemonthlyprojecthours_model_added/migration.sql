-- CreateTable
CREATE TABLE "employee_monthly_project_hours" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "project_id" TEXT NOT NULL,
    "hours" DECIMAL(7,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_monthly_project_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employee_monthly_project_hours_month_year_idx" ON "employee_monthly_project_hours"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "employee_monthly_project_hours_employee_id_project_id_month_key" ON "employee_monthly_project_hours"("employee_id", "project_id", "month", "year");

-- AddForeignKey
ALTER TABLE "employee_monthly_project_hours" ADD CONSTRAINT "employee_monthly_project_hours_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_monthly_project_hours" ADD CONSTRAINT "employee_monthly_project_hours_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
