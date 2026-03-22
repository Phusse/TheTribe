import { prisma } from "../../config/database";
import { uploadImageToCloudinary } from "../../utils/cloudinary";

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
    thumbnailUrl: s.thumbnailUrl,
    upcoming: s.date > now,
  }));
};

export const createSession = async (input: {
  title: string;
  description: string;
  date: string;
  time: string;
  meetingUrl?: string;
  thumbnailUrl?: string;
}) => {
  let thumbUrl = input.thumbnailUrl;
  if (thumbUrl && thumbUrl.startsWith("data:image/")) {
    thumbUrl = await uploadImageToCloudinary(thumbUrl, "thetribe/sessions");
  }

  return prisma.liveSession.create({
    data: {
      title: input.title,
      description: input.description,
      date: new Date(input.date),
      time: input.time,
      meetingUrl: input.meetingUrl,
      thumbnailUrl: thumbUrl,
    },
  });
};
