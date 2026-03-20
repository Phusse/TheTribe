export type ConnectionStatus = "pending" | "accepted" | "rejected";

export interface Connection {
    id: string;
    requesterId: string;
    receiverId: string;
    status: ConnectionStatus;
    createdAt: string;
    partner?: {
        id: string;
        firstName: string;
        lastName: string;
        profilePhotoUrl?: string | null;
    };
}
