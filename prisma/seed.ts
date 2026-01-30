
import { prisma } from "../lib/prisma"
import bcrpyt from "bcrypt"

async function main() {
    const email = "superadmin@ems.com"
    const password = "superadmin"
    const hashedPassword = await bcrpyt.hashSync(password, 10);

    const existingAdmin = await prisma.superAdmin.findUnique({
        where: { email }
    })
    if (existingAdmin) {
        console.log("Super Admin already exists");
        return;
    }
    await prisma.superAdmin.create({
        data: {
            email,
            password: hashedPassword,
            status: "ACTIVE"
        }
    })
    console.log("Super Admin created successfully");
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });