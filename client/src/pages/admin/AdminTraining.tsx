import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Pencil, Trash2, X, Loader2, GripVertical, Camera, Trash } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { TrainingModule, Lesson } from "@thetribe/shared";

const vaultTransition = { duration: 0.4, ease: [0.2, 0, 0, 1] as const };

// ── Types ──────────────────────────────────────────────────────────────────────

interface AdminModule extends TrainingModule {
  enrolledCount: number;
}

interface ModuleFormState {
  title: string;
  category: string;
  duration: string;
  order: string;
  thumbnailUrl?: string;
}

interface LessonFormState {
  title: string;
  duration: string;
  order: string;
  content: string;
}

const emptyModuleForm: ModuleFormState = { title: "", category: "", duration: "", order: "", thumbnailUrl: "" };
const emptyLessonForm: LessonFormState = { title: "", duration: "", order: "", content: "" };

// ── Subcomponent: Input ────────────────────────────────────────────────────────

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-body text-muted-foreground ml-1">{label}</label>
    <input
      className="auth-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
    />
  </div>
);

const ConfirmButton = ({ onConfirm, children, className }: any) => {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <button
        type="button"
        onMouseLeave={() => setConfirming(false)}
        onClick={(e) => { e.stopPropagation(); onConfirm(); setConfirming(false); }}
        className="px-2 py-1 text-[10px] font-medium bg-destructive text-destructive-foreground rounded flex items-center gap-1 transition-all"
      >
        <span className="whitespace-nowrap">Sure?</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
      className={className}
    >
      {children}
    </button>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const AdminTraining = () => {
  const queryClient = useQueryClient();

  // Modal state
  const [moduleModal, setModuleModal] = useState<"create" | "edit" | null>(null);
  const [editingModule, setEditingModule] = useState<AdminModule | null>(null);
  const [moduleForm, setModuleForm] = useState<ModuleFormState>(emptyModuleForm);

  // Lesson editor (within edit modal)
  const [lessonModal, setLessonModal] = useState<"create" | "edit" | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonFormState>(emptyLessonForm);
  const [lessonModuleId, setLessonModuleId] = useState<string>("");

  // ── Queries ──────────────────────────────────────────────────────────────────

  const { data: modules = [], isLoading } = useQuery<AdminModule[]>({
    queryKey: ["admin-training"],
    queryFn: async () => {
      const res = await api.get("/training/admin/modules");
      return (res as any).data;
    },
  });

  // Sync editing object when root queries refetch (e.g after adding a lesson)
  useEffect(() => {
    if (editingModule && modules.length > 0) {
      const fresh = modules.find(m => m.id === editingModule.id);
      if (fresh && fresh.lessons.length !== editingModule.lessons.length) {
        setEditingModule(fresh);
      }
    }
  }, [modules, editingModule]);

  // ── Module Mutations ─────────────────────────────────────────────────────────

  const createModuleMutation = useMutation({
    mutationFn: (body: object) => api.post("/training/modules", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-training"] });
      toast.success("Module created");
      closeModuleModal();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateModuleMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: object }) =>
      api.patch(`/training/modules/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-training"] });
      toast.success("Module updated");
      closeModuleModal();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/training/modules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-training"] });
      toast.success("Module deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      api.patch(`/training/modules/${id}`, { published }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-training"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Lesson Mutations ─────────────────────────────────────────────────────────

  const createLessonMutation = useMutation({
    mutationFn: (body: object) => api.post("/training/lessons", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-training"] });
      toast.success("Lesson added");
      closeLessonModal();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: object }) =>
      api.patch(`/training/lessons/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-training"] });
      toast.success("Lesson updated");
      closeLessonModal();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/training/lessons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-training"] });
      toast.success("Lesson deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const openCreateModule = () => {
    setEditingModule(null);
    setModuleForm(emptyModuleForm);
    setModuleModal("create");
  };

  const openEditModule = (mod: AdminModule) => {
    setEditingModule(mod);
    setModuleForm({
      title: mod.title,
      category: mod.category,
      duration: mod.duration,
      order: String(mod.order),
      thumbnailUrl: mod.thumbnailUrl || "",
    });
    setLessonModuleId(mod.id);
    setModuleModal("edit");
  };

  const closeModuleModal = () => {
    setModuleModal(null);
    setEditingModule(null);
    setModuleForm(emptyModuleForm);
    closeLessonModal();
  };

  const openCreateLesson = (moduleId: string) => {
    setEditingLesson(null);
    setLessonModuleId(moduleId);
    const currentLessons = editingModule?.lessons ?? [];
    setLessonForm({ ...emptyLessonForm, order: String(currentLessons.length) });
    setLessonModal("create");
  };

  const openEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      duration: lesson.duration,
      order: String(lesson.order),
      content: lesson.content ?? "",
    });
    setLessonModal("edit");
  };

  const closeLessonModal = () => {
    setLessonModal(null);
    setEditingLesson(null);
    setLessonForm(emptyLessonForm);
  };

  // ── Submit Handlers ──────────────────────────────────────────────────────────

  const handleModuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: moduleForm.title,
      category: moduleForm.category,
      duration: moduleForm.duration,
      order: parseInt(moduleForm.order, 10) || 0,
      thumbnailUrl: moduleForm.thumbnailUrl || undefined,
    };
    if (moduleModal === "create") {
      createModuleMutation.mutate(payload);
    } else if (editingModule) {
      updateModuleMutation.mutate({ id: editingModule.id, body: payload });
    }
  };

  const handleLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      moduleId: lessonModuleId,
      title: lessonForm.title,
      duration: lessonForm.duration,
      order: parseInt(lessonForm.order, 10) || 0,
      content: lessonForm.content || undefined,
    };
    if (lessonModal === "create") {
      createLessonMutation.mutate(payload);
    } else if (editingLesson) {
      updateLessonMutation.mutate({ id: editingLesson.id, body: payload });
    }
  };

  const isModuleBusy = createModuleMutation.isPending || updateModuleMutation.isPending;
  const isLessonBusy = createLessonMutation.isPending || updateLessonMutation.isPending;

  const publishedCount = modules.filter((m) => m.published).length;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setModuleForm((prev) => ({ ...prev, thumbnailUrl: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={vaultTransition}>
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <h1 className="font-display text-foreground text-2xl">Training Content</h1>
          </div>
          {isLoading ? (
            <p className="text-muted-foreground text-sm font-body mt-1">Loading…</p>
          ) : (
            <p className="text-muted-foreground text-sm font-body mt-1">
              {modules.length} modules · {publishedCount} published
            </p>
          )}
        </motion.div>

        <button
          onClick={openCreateModule}
          className="self-start px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-body font-medium hover:brightness-110 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Module
        </button>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && modules.length === 0 && (
          <div className="surface-card p-10 text-center text-muted-foreground text-sm font-body">
            No training modules yet. Click "Create Module" to get started.
          </div>
        )}

        {/* Module Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...vaultTransition, delay: i * 0.05 }}
              className="surface-card p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-body font-medium text-foreground flex-1 pr-2">{mod.title}</h3>
                <span
                  className={`text-[10px] font-body font-medium px-2 py-0.5 rounded shrink-0 ${mod.published
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                    }`}
                >
                  {mod.published ? "Published" : "Draft"}
                </span>
              </div>

              <p className="text-[11px] font-body text-muted-foreground/70">{mod.category}</p>

              <div className="flex items-center gap-4 text-xs font-body text-muted-foreground">
                <span>{mod.lessons.length} lessons</span>
                <span>{mod.enrolledCount} enrolled</span>
                <span>{mod.duration}</span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => openEditModule(mod)}
                  className="flex-1 py-1.5 rounded-md bg-surface-hover text-xs font-body text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => togglePublishMutation.mutate({ id: mod.id, published: !mod.published })}
                  disabled={togglePublishMutation.isPending}
                  className="flex-1 py-1.5 rounded-md bg-surface-hover text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
                >
                  {mod.published ? "Unpublish" : "Publish"}
                </button>
                <ConfirmButton
                  onConfirm={() => deleteModuleMutation.mutate(mod.id)}
                  className="p-1.5 rounded-md text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </ConfirmButton>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Module Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {moduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && closeModuleModal()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={vaultTransition}
              className="surface-card w-full max-w-lg flex flex-col gap-0 overflow-hidden max-h-[90vh]"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="font-display text-foreground text-lg">
                  {moduleModal === "create" ? "Create Module" : `Edit: ${editingModule?.title}`}
                </h2>
                <button
                  onClick={closeModuleModal}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1">
                {/* Module form */}
                <form id="module-form" onSubmit={handleModuleSubmit} className="flex flex-col gap-4 px-6 py-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-body text-muted-foreground ml-1">Thumbnail</label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-full sm:w-32 h-20 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden relative group">
                        {moduleForm.thumbnailUrl ? (
                          <img src={moduleForm.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-primary/60">
                            <Camera className="w-5 h-5 mb-1" />
                            <span className="text-[10px] uppercase font-semibold">Upload</span>
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity z-10">
                          <Camera className="w-5 h-5 text-white" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                      </div>
                      <div className="flex flex-col gap-1 items-center sm:items-start text-xs text-muted-foreground">
                        <p>16:9 ratio recommended (max 5MB).</p>
                        {moduleForm.thumbnailUrl && (
                          <button
                            type="button"
                            onClick={() => setModuleForm((prev) => ({ ...prev, thumbnailUrl: "" }))}
                            className="flex items-center gap-1 text-destructive hover:underline mt-1"
                          >
                            <Trash className="w-3 h-3" /> Remove image
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Field
                    label="Title *"
                    value={moduleForm.title}
                    onChange={(v) => setModuleForm((f) => ({ ...f, title: v }))}
                    placeholder="e.g. Leadership Foundations"
                    required
                  />
                  <Field
                    label="Category *"
                    value={moduleForm.category}
                    onChange={(v) => setModuleForm((f) => ({ ...f, category: v }))}
                    placeholder="e.g. Mindset"
                    required
                  />
                  <Field
                    label="Duration *"
                    value={moduleForm.duration}
                    onChange={(v) => setModuleForm((f) => ({ ...f, duration: v }))}
                    placeholder="e.g. 4h 30m"
                    required
                  />
                  <Field
                    label="Order"
                    value={moduleForm.order}
                    onChange={(v) => setModuleForm((f) => ({ ...f, order: v }))}
                    placeholder="e.g. 1"
                  />
                </form>

                {/* Lesson editor — only in edit mode */}
                {moduleModal === "edit" && editingModule && (
                  <div className="px-6 pb-5 flex flex-col gap-3 border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">
                        Lessons ({editingModule.lessons.length})
                      </p>
                      <button
                        type="button"
                        onClick={() => openCreateLesson(editingModule.id)}
                        className="flex items-center gap-1 text-xs font-body text-primary hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Lesson
                      </button>
                    </div>

                    {editingModule.lessons.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">No lessons yet.</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {editingModule.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors group"
                          >
                            <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-body text-foreground truncate">{lesson.title}</p>
                              <p className="text-[11px] font-body text-muted-foreground">{lesson.duration}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => openEditLesson(lesson)}
                                className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <ConfirmButton
                                onConfirm={() => {
                                  deleteLessonMutation.mutate(lesson.id);
                                  // Optimistically remove from local state
                                  setEditingModule((prev) =>
                                    prev
                                      ? {
                                        ...prev,
                                        lessons: prev.lessons.filter((l) => l.id !== lesson.id),
                                      }
                                      : prev
                                  );
                                }}
                                className="p-1 rounded text-destructive/60 hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </ConfirmButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModuleModal}
                  className="px-4 py-2 rounded-lg text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="module-form"
                  disabled={isModuleBusy}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-body font-medium hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isModuleBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {moduleModal === "create" ? "Create" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Lesson Modal ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lessonModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && closeLessonModal()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={vaultTransition}
              className="surface-card w-full max-w-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="font-display text-foreground text-base">
                  {lessonModal === "create" ? "Add Lesson" : "Edit Lesson"}
                </h2>
                <button
                  onClick={closeLessonModal}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleLessonSubmit} className="flex flex-col gap-4 px-6 py-5">
                <Field
                  label="Title *"
                  value={lessonForm.title}
                  onChange={(v) => setLessonForm((f) => ({ ...f, title: v }))}
                  placeholder="e.g. Introduction to Leadership"
                  required
                />
                <Field
                  label="Duration *"
                  value={lessonForm.duration}
                  onChange={(v) => setLessonForm((f) => ({ ...f, duration: v }))}
                  placeholder="e.g. 12 min"
                  required
                />
                <Field
                  label="Order"
                  value={lessonForm.order}
                  onChange={(v) => setLessonForm((f) => ({ ...f, order: v }))}
                  placeholder="e.g. 0"
                />
                <Field
                  label="Content URL (optional)"
                  value={lessonForm.content}
                  onChange={(v) => setLessonForm((f) => ({ ...f, content: v }))}
                  placeholder="https://…"
                />

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeLessonModal}
                    className="px-4 py-2 rounded-lg text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLessonBusy}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-body font-medium hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLessonBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {lessonModal === "create" ? "Add Lesson" : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminTraining;
