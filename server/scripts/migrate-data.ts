import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const localDbUrl = "postgresql://postgres:phuse123@localhost:5432/thetribe_dev?schema=public";
const remoteDbUrl = process.env.DATABASE_URL;

const localPrisma = new PrismaClient({ datasourceUrl: localDbUrl });
const remotePrisma = new PrismaClient({ datasourceUrl: remoteDbUrl });

async function migrateData() {
  console.log("🚀 Starting data migration from localhost to Supabase...");
  try {
    // 1. Users
    const users = await localPrisma.user.findMany();
    if (users.length > 0) {
      console.log(`Migrating ${users.length} Users...`);
      await remotePrisma.user.createMany({ data: users, skipDuplicates: true });
    }

    // 2. System Settings
    const settings = await localPrisma.systemSettings.findMany();
    if (settings.length > 0) {
      console.log(`Migrating System Settings...`);
      await remotePrisma.systemSettings.createMany({ data: settings, skipDuplicates: true });
    }

    // 3. User Settings
    const userSettings = await localPrisma.userSettings.findMany();
    if (userSettings.length > 0) {
      console.log(`Migrating User Settings...`);
      await remotePrisma.userSettings.createMany({ data: userSettings, skipDuplicates: true });
    }

    // 4. Invites
    const invites = await localPrisma.invite.findMany();
    if (invites.length > 0) {
      console.log(`Migrating ${invites.length} Invites...`);
      await remotePrisma.invite.createMany({ data: invites, skipDuplicates: true });
    }

    // 5. Connections
    const connections = await localPrisma.connection.findMany();
    if (connections.length > 0) {
      console.log(`Migrating ${connections.length} Connections...`);
      await remotePrisma.connection.createMany({ data: connections, skipDuplicates: true });
    }

    // 6. Messages
    const messages = await localPrisma.message.findMany();
    if (messages.length > 0) {
      console.log(`Migrating ${messages.length} Messages...`);
      await remotePrisma.message.createMany({ data: messages, skipDuplicates: true });
    }

    // 7. Groups
    const groups = await localPrisma.group.findMany();
    if (groups.length > 0) {
      console.log(`Migrating ${groups.length} Groups...`);
      await remotePrisma.group.createMany({ data: groups, skipDuplicates: true });
    }

    // 8. Group Members
    const groupMembers = await localPrisma.groupMember.findMany();
    if (groupMembers.length > 0) {
      console.log(`Migrating ${groupMembers.length} Group Members...`);
      await remotePrisma.groupMember.createMany({ data: groupMembers, skipDuplicates: true });
    }

    // 9. Training Modules
    const modules = await localPrisma.trainingModule.findMany();
    if (modules.length > 0) {
      console.log(`Migrating ${modules.length} Training Modules...`);
      await remotePrisma.trainingModule.createMany({ data: modules, skipDuplicates: true });
    }

    // 10. Lessons
    const lessons = await localPrisma.lesson.findMany();
    if (lessons.length > 0) {
      console.log(`Migrating ${lessons.length} Lessons...`);
      await remotePrisma.lesson.createMany({ data: lessons, skipDuplicates: true });
    }

    // 11. Live Sessions
    const sessions = await localPrisma.liveSession.findMany();
    if (sessions.length > 0) {
      console.log(`Migrating ${sessions.length} Live Sessions...`);
      await remotePrisma.liveSession.createMany({ data: sessions, skipDuplicates: true });
    }

    console.log("✅ Data migration complete!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await localPrisma.$disconnect();
    await remotePrisma.$disconnect();
  }
}

migrateData();
