import { prisma } from "../src/config/database";
import { hashPassword } from "../src/utils/password";

async function main() {
  console.log("🌱 Seeding database...");

  // Seed training modules
  const m1 = await prisma.trainingModule.upsert({
    where: { id: "module-leadership-001" },
    update: {},
    create: {
      id: "module-leadership-001",
      title: "Mastering Leadership",
      category: "Leadership",
      duration: "4h 20m",
      order: 1,
      lessons: {
        create: [
          { title: "What is Leadership?", duration: "18 min", order: 1 },
          { title: "Emotional Intelligence", duration: "22 min", order: 2 },
          { title: "Communicating with Impact", duration: "30 min", order: 3 },
          { title: "Building Trust", duration: "25 min", order: 4 },
        ],
      },
    },
  });

  const m2 = await prisma.trainingModule.upsert({
    where: { id: "module-finance-001" },
    update: {},
    create: {
      id: "module-finance-001",
      title: "Financial Freedom",
      category: "Finance",
      duration: "3h 10m",
      order: 2,
      lessons: {
        create: [
          { title: "The Wealth Mindset", duration: "20 min", order: 1 },
          { title: "Budgeting & Cash Flow", duration: "28 min", order: 2 },
          { title: "Investing Fundamentals", duration: "35 min", order: 3 },
        ],
      },
    },
  });

  // Seed live sessions
  await prisma.liveSession.createMany({
    data: [
      {
        id: "session-001",
        title: "Mastering Emotional Intelligence",
        description: "Deep dive into self-awareness and empathy as tools for leadership.",
        date: new Date("2026-03-21T19:00:00Z"),
        time: "7:00 PM EST",
        meetingUrl: "https://zoom.us/j/example",
      },
      {
        id: "session-002",
        title: "The Discipline of Daily Habits",
        description: "Building systems that compound over time.",
        date: new Date("2026-03-28T19:00:00Z"),
        time: "7:00 PM EST",
      },
    ],
  });

  // Seed groups
  const groups = [
    { id: "group-001", name: "General", description: "Open discussion for all tribe members" },
    { id: "group-002", name: "Leadership Circle", description: "Advanced leadership discussions" },
    { id: "group-003", name: "Finance & Wealth", description: "Building financial freedom together" },
    { id: "group-004", name: "Accountability Partners", description: "Weekly check-ins and goal tracking" },
  ];

  for (const g of groups) {
    await prisma.group.upsert({
      where: { id: g.id },
      update: {},
      create: g,
    });
  }

  // Seed superadmin user
  const adminPassword = await hashPassword("Admin@123456");
  const admin = await prisma.user.upsert({
    where: { email: "admin@thetribe.com" },
    update: {},
    create: {
      firstName: "Marcus",
      lastName: "Johnson",
      email: "admin@thetribe.com",
      passwordHash: adminPassword,
      role: "SUPERADMIN",
      isActive: true,
      pledgeAccepted: true,
      settings: {
        create: {},
      },
    },
  });

  // Seed a test member
  const memberPassword = await hashPassword("Member@123456");
  const member = await prisma.user.upsert({
    where: { email: "member@thetribe.com" },
    update: {},
    create: {
      firstName: "David",
      lastName: "Chen",
      email: "member@thetribe.com",
      passwordHash: memberPassword,
      role: "MEMBER",
      isActive: true,
      pledgeAccepted: true,
      settings: {
        create: {},
      },
    },
  });

  // Add member to General group
  await prisma.groupMember.upsert({
    where: { userId_groupId: { userId: member.id, groupId: "group-001" } },
    update: {},
    create: { userId: member.id, groupId: "group-001" },
  });

  // Seed an invite code
  await prisma.inviteCode.upsert({
    where: { code: "TRIBE-WELCOME" },
    update: {},
    create: {
      code: "TRIBE-WELCOME",
      createdById: admin.id,
    },
  });

  console.log("✅ Seed complete.");
  console.log("  👤 Superadmin: admin@thetribe.com / Admin@123456");
  console.log("  👤 Member:     member@thetribe.com / Member@123456");
  console.log("  🎟  Invite code: TRIBE-WELCOME");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
