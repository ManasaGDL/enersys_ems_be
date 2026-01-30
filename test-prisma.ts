import { prisma } from "./lib/prisma";

async function main() {
    console.log('Prisma object keys:', Object.keys(prisma));
    // Inspect the prototype if keys are empty (Prisma Client V5+ often puts methods on prototype or uses proxy)
    console.log('Is employee defined?', typeof prisma.employee);
    if (prisma.employee) {
        console.log('Employee create defined?', typeof prisma.employee.create);
    } else {
        console.log('prisma.employee is UNDEFINED');
    }
}

main().catch(console.error);
