export interface Group {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    memberCount?: number;
    lastActivity?: string;
}

export interface GroupMessage {
    id: string;
    text: string;
    userId: string;
    groupId: string;
    createdAt: string;
    sender?: { firstName: string; lastName: string };
}
