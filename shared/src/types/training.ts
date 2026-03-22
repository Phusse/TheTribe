export interface Lesson {
    id: string;
    title: string;
    duration: string;
    order: number;
    moduleId: string;
    content?: string;
    locked?: boolean;
}

export interface TrainingModule {
    id: string;
    title: string;
    category: string;
    duration: string;
    order: number;
    published: boolean;
    lessons: Lesson[];
    enrolledCount?: number;
}

export interface TrainingProgress {
    id: string;
    userId: string;
    moduleId: string;
    progress: number;
    completedAt?: string | null;
}

export interface TrainingModuleWithProgress extends TrainingModule {
    progress: number;
    completed: boolean;
}
