"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error("Please provide an email address. Usage: npm run make-admin user@example.com");
        process.exit(1);
    }
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        console.error(`User with email ${email} not found.`);
        process.exit(1);
    }
    await prisma.user.update({
        where: { email },
        data: { role: "SUPERADMIN" },
    });
    console.log(`Successfully elevated ${email} to SUPERADMIN.`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=make-admin.js.map