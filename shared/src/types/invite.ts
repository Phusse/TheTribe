export interface InviteCode {
    id: string;
    code: string;
    used: boolean;
    usedById?: string | null;
    createdById: string;
    createdAt: string;
    usedAt?: string | null;
    createdBy?: { firstName: string; lastName: string };
    usedBy?: { firstName: string; lastName: string } | null;
}
