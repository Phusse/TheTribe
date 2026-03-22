import { prisma } from "../../config/database";

export const globalSearch = async (query: string, requesterId: string) => {
  const q = query.trim();
  if (!q || q.length < 2) return { members: [], training: [], sessions: [] };

  const [members, training, sessions] = await Promise.all([
    // Search members by name / email (exclude self)
    prisma.user.findMany({
      where: {
        id: { not: requesterId },
        isActive: true,
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { occupation: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        occupation: true,
        profilePhotoUrl: true,
        role: true,
      },
      take: 8,
    }),

    // Search published training modules
    prisma.trainingModule.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        category: true,
        duration: true,
        thumbnailUrl: true,
      },
      take: 6,
    }),

    // Search upcoming live sessions
    prisma.liveSession.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        time: true,
        thumbnailUrl: true,
      },
      orderBy: { date: "asc" },
      take: 5,
    }),
  ]);

  return { members, training, sessions };
};
