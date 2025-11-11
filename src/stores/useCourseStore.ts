import { create } from "zustand";
import { Course, Section, Module, Lesson } from "@/types";
import { getAllCourses, getModuleStructure } from "@/lib/datocms";

type CourseStore = {
  // ====== Core Data ======
  purchasedCourses: Course[];
  nonPurchasedCourses: Course[];
  selectedCourse: Course | null;
  selectedSection: Partial<Section> | null;
  selectedModule: Partial<Module> | null;
  moduleStructure: Module | null;
  selectedWeekId: string | null;
  selectedLesson: Lesson | null;
  sectionProgress: Record<string, number>;
  isLoading: boolean;

  // ====== Completion Sync ======
  completedLessons: string[];
  setCompletedLessons: (lessonsOrUpdater: string[] | ((prev: string[]) => string[])) => void;
  toggleLessonCompletion: (lessonId: string, completed: boolean) => void;

  // ====== Fetchers ======
  fetchGroupedCourses: (userEnrollments?: any[]) => Promise<void>;
  fetchModuleStructure: (module: Partial<Module>) => Promise<void>;

  // ====== Setters ======
  setPurchasedCourses: (courses: Course[]) => void;
  setNonPurchasedCourses: (courses: Course[]) => void;
  setSelectedCourse: (course: Course | null) => void;
  setSelectedSection: (section: Partial<Section> | null) => void;
  setSelectedModule: (module: Module | null) => void;
  setSelectedWeekId: (id: string | null) => void;
  setSelectedLesson: (lesson: Lesson | null) => void;

  // ====== Reset ======
  reset: () => void;
};

export const useCourseStore = create<CourseStore>((set) => ({
  // ─── Initial State ───
  purchasedCourses: [],
  nonPurchasedCourses: [],
  selectedCourse: null,
  selectedSection: null,
  selectedModule: null,
  moduleStructure: null,
  selectedWeekId: null,
  selectedLesson: null,
  sectionProgress: {},
  isLoading: false,

  // ─── New: Global Lesson Completion ───
  completedLessons: [],
  setCompletedLessons: (lessonsOrUpdater) =>
    set((state) => ({
      completedLessons:
        typeof lessonsOrUpdater === "function"
          ? lessonsOrUpdater(state.completedLessons)
          : lessonsOrUpdater,
    })),
  toggleLessonCompletion: (lessonId, completed) =>
    set((state) => {
      const updated = completed
        ? [...state.completedLessons, lessonId]
        : state.completedLessons.filter((id) => id !== lessonId);
      return { completedLessons: updated };
    }),

  // ─── Fetch Purchased / Non‑Purchased ───
  fetchGroupedCourses: async (userEnrollments = []) => {
    set({ isLoading: true });
    try {
      const allCourses = await getAllCourses();

      const purchasedIds = userEnrollments.map((e: any) => e.courseId?.datoCmsId);
      const purchased = allCourses.filter((c) => purchasedIds.includes(c.id));
      const nonPurchased = allCourses.filter((c) => !purchasedIds.includes(c.id));

      set({ purchasedCourses: purchased, nonPurchasedCourses: nonPurchased });
    } catch (err) {
      console.error("❌ Error fetching courses:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  // ─── Fetch Module Structure (weeks → days → lessons) ───
  fetchModuleStructure: async (module) => {
    if (!module?.id) {
      console.warn("⚠️ No module ID provided. Skipping fetch.");
      return;
    }

    set({ isLoading: true });
    try {
      console.log("📥 Fetching module structure for module ID:", module.id);
      const structure = await getModuleStructure(module.id);

      console.log("✅ Module structure fetched:", structure);

      set({
        selectedModule: module,
        moduleStructure: structure,
        selectedWeekId: structure?.weeks?.[0]?.id || null,
      });
    } catch (err) {
      console.error("❌ Error fetching module structure:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  // ─── Setters ───
  setPurchasedCourses: (courses) => set({ purchasedCourses: courses }),
  setNonPurchasedCourses: (courses) => set({ nonPurchasedCourses: courses }),
  setSelectedCourse: (course) => set({ selectedCourse: course }),
  setSelectedSection: (section) => set({ selectedSection: section }),
  setSelectedModule: (module) => set({ selectedModule: module }),
  setSelectedWeekId: (id) => set({ selectedWeekId: id }),
  setSelectedLesson: (lesson) => set({ selectedLesson: lesson }),

  // ─── Reset Store ───
  reset: () =>
    set({
      purchasedCourses: [],
      nonPurchasedCourses: [],
      selectedCourse: null,
      selectedSection: null,
      selectedModule: null,
      moduleStructure: null,
      selectedWeekId: null,
      selectedLesson: null,
      sectionProgress: {},
      isLoading: false,
      completedLessons: [],
    }),
}));
