export interface LiveSession {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    meetingUrl?: string | null;
    thumbnailUrl?: string | null;
    createdAt: string;
}
