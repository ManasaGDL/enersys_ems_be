
import { prisma } from "./lib/prisma";
import bcrypt from "bcrypt";

async function main() {
    try {
        const hashedPassword = await bcrypt.hash("password123", 10);
        const uniqueSuffix = Date.now();
        const email = `test.aadhaar.${uniqueSuffix}@example.com`;

        console.log("Attempting to create employee with Aadhaar as NUMBER...");

        // @ts-ignore
        const aadhaarValue = 123456789012; // Example Aadhaar as NUMBER

        const newEmployee = await prisma.employee.create({
            data: {
                firstName: "Test",
                lastName: "User",
                email: email,
                phone: "1234567890",
                password: hashedPassword,
                // @ts-ignore
                aadhaar: aadhaarValue,
                status: "ACTIVE"
            },
        });

        console.log("Employee created successfully:", newEmployee);
    } catch (e: any) {
        console.error("========== ERROR CAUGHT ==========");
        console.error("Message:", e.message);
        console.error("Code:", e.code);
        // console.error("Meta:", e.meta);
        // console.error("Stack:", e.stack);
        console.error("==================================");
    } finally {
        await prisma.$disconnect();
    }
}

main();
