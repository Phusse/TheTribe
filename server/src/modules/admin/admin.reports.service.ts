import { prisma } from "../../config/database";

export const getReportsData = async () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const [
    totalMembers,
    newMembersLast30,
    newMembersLast7,
    activeMembers,
    totalMessages,
    messagesLast7,
    totalConnections,
    connectionsLast7,
    totalInvites,
    usedInvites,
    totalModules,
    publishedModules,
    totalProgress,
    completedProgress,
    totalGroups,
    groupMessageCount,
    upcomingSessions,
    totalSessions,
    membersByRole,
    recentMembers,
    inviteConversionAttempts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.message.count(),
    prisma.message.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.connection.count({ where: { status: "ACCEPTED" } }),
    prisma.connection.count({ where: { status: "ACCEPTED", createdAt: { gte: sevenDaysAgo } } }),
    prisma.inviteCode.count(),
    prisma.inviteCode.count({ where: { used: true } }),
    prisma.trainingModule.count(),
    prisma.trainingModule.count({ where: { published: true } }),
    prisma.trainingProgress.count(),
    prisma.trainingProgress.count({ where: { completedAt: { not: null } } }),
    prisma.group.count(),
    prisma.groupMessage.count(),
    prisma.liveSession.count({ where: { date: { gte: now } } }),
    prisma.liveSession.count(),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, role: true },
    }),
    prisma.inviteAttempt.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const inviteConversionRate = totalInvites > 0 ? Math.round((usedInvites / totalInvites) * 100) : 0;
  const trainingCompletionRate = totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0;
  const memberActiveRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

  return {
    overview: {
      totalMembers,
      newMembersLast30,
      newMembersLast7,
      activeMembers,
      memberActiveRate,
    },
    engagement: {
      totalMessages,
      messagesLast7,
      totalConnections,
      connectionsLast7,
      totalGroups,
      groupMessageCount,
    },
    content: {
      totalModules,
      publishedModules,
      totalProgress,
      completedProgress,
      trainingCompletionRate,
    },
    sessions: {
      totalSessions,
      upcomingSessions,
    },
    invites: {
      totalInvites,
      usedInvites,
      inviteConversionRate,
      attempts: inviteConversionAttempts,
    },
    membersByRole: membersByRole.map((r) => ({ role: r.role, count: r._count._all })),
    recentMembers,
  };
};
