import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessagesSquare, Plus, Edit2, Trash2, X, Loader2, Users, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

interface Group {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    memberCount: number;
}

const AdminGroups = () => {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "" });

    const { data: groups, isLoading } = useQuery({
        queryKey: ["admin-groups"],
        queryFn: async () => {
            const res = await api.get("/groups");
            return res.data as Group[];
        },
    });

    const { mutate: createGroup, isPending: creating } = useMutation({
        mutationFn: async (data: typeof formData) => {
            await api.post("/groups", data);
        },
        onSuccess: () => {
            toast.success("Group created");
            setIsCreating(false);
            setFormData({ name: "", description: "" });
            queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
            queryClient.invalidateQueries({ queryKey: ["groups"] });
        },
        onError: (e: any) => toast.error(e.message),
    });

    const { mutate: updateGroup, isPending: updating } = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
            await api.patch(`/groups/${id}`, data);
        },
        onSuccess: () => {
            toast.success("Group updated");
            setEditingGroup(null);
            setFormData({ name: "", description: "" });
            queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
            queryClient.invalidateQueries({ queryKey: ["groups"] });
        },
        onError: (e: any) => toast.error(e.message),
    });

    const { mutate: deleteGroup, isPending: deleting } = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/groups/${id}`);
        },
        onSuccess: () => {
            toast.success("Group deleted");
            setDeletingGroup(null);
            queryClient.invalidateQueries({ queryKey: ["admin-groups"] });
            queryClient.invalidateQueries({ queryKey: ["groups"] });
        },
        onError: (e: any) => toast.error(e.message),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.description) return;
        if (editingGroup) {
            updateGroup({ id: editingGroup.id, data: formData });
        } else {
            createGroup(formData);
        }
    };

    const openEdit = (g: Group) => {
        setEditingGroup(g);
        setFormData({ name: g.name, description: g.description });
        setIsCreating(true);
    };

    const closeForm = () => {
        setIsCreating(false);
        setEditingGroup(null);
        setFormData({ name: "", description: "" });
    };

    return (
        <div className="flex flex-col gap-6">

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deletingGroup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => !deleting && setDeletingGroup(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="surface-card p-6 w-full max-w-sm rounded-xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-destructive" />
                                </div>
                                <div>
                                    <h2 className="font-display text-foreground text-base">Delete Group?</h2>
                                    <p className="text-xs font-body text-muted-foreground mt-0.5">This will permanently delete all messages.</p>
                                </div>
                            </div>
                            <p className="text-sm font-body text-foreground mb-6">
                                Are you sure you want to delete <span className="font-semibold">"{deletingGroup.name}"</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeletingGroup(null)}
                                    disabled={deleting}
                                    className="flex-1 py-2 rounded-lg bg-muted text-foreground text-sm font-body font-medium hover:bg-muted/70 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteGroup(deletingGroup.id)}
                                    disabled={deleting}
                                    className="flex-1 py-2 rounded-lg bg-destructive text-white text-sm font-body font-medium hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MessagesSquare className="w-5 h-5 text-primary" />
                        <h1 className="font-display text-foreground text-2xl">Group Management</h1>
                    </div>
                    {!isCreating && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-body font-medium hover:brightness-110 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create Group
                        </button>
                    )}
                </div>
                <p className="text-muted-foreground text-sm font-body mt-1">
                    Create and manage dedicated chat rooms for The Tribe.
                </p>
            </motion.div>

            <AnimatePresence mode="wait">
                {isCreating && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSubmit}
                        className="surface-card p-6 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-display text-foreground">{editingGroup ? "Edit Group" : "New Group"}</h2>
                            <button type="button" onClick={closeForm} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-body text-muted-foreground mb-1 block">Group Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="auth-input"
                                    placeholder="e.g. Real Estate Investors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-body text-muted-foreground mb-1 block">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="auth-textarea"
                                    placeholder="What is this group about?"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={creating || updating}
                                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-body font-medium hover:brightness-110 flex justify-center items-center"
                            >
                                {creating || updating ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingGroup ? "Save Changes" : "Create Group")}
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="surface-card overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : !groups || groups.length === 0 ? (
                    <p className="p-8 text-center text-muted-foreground text-sm font-body">No groups have been created yet.</p>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left px-6 py-3 section-label font-normal">Name</th>
                                <th className="text-left px-6 py-3 section-label font-normal">Members</th>
                                <th className="text-left px-6 py-3 section-label font-normal">Created On</th>
                                <th className="text-left px-6 py-3 section-label font-normal">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map((group) => (
                                <tr key={group.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-body text-foreground font-medium">{group.name}</p>
                                        <p className="text-xs font-body text-muted-foreground truncate max-w-[200px] mt-0.5">{group.description}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Users className="w-4 h-4" />
                                            <span className="text-sm font-body tabular-nums">{group.memberCount}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-body text-muted-foreground tabular-nums">
                                        {format(new Date(group.createdAt), "MMM d, yyyy")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => openEdit(group)} className="text-muted-foreground hover:text-foreground transition-colors" title="Edit Group">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingGroup(group)}
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                                title="Delete Group"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminGroups;
