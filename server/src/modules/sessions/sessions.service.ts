import { prisma } from "../../config/database";

export const getSessions = async () => {
  const sessions = await prisma.liveSession.findMany({
    orderBy: { date: "asc" },
  });

  const now = new Date();

  return sessions.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    date: s.date.toISOString(),
    time: s.time,
    meetingUrl: s.meetingUrl,
    upcoming: s.date > now,
  }));
};

export const createSession = async (input: {
  title: string;
  description: string;
  date: string;
  time: string;
  meetingUrl?: string;
}) => {
  return prisma.liveSession.create({
    data: {
      title: input.title,
      description: input.description,
      date: new Date(input.date),
      time: input.time,
      meetingUrl: input.meetingUrl,
    },
  });
};
