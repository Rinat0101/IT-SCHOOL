import { create } from "zustand";
import { Course, Section, Module, Lesson } from "@/types";
import { getAllCourses, getModuleStructure } from "@/lib/datocms";

type CourseStore = {
  // Data
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

  // Fetch functions
  fetchGroupedCourses: (userEnrollments?: any[]) => Promise<void>;
  fetchModuleStructure: (module: Partial<Module>) => Promise<void>;

  // Setters
  setPurchasedCourses: (courses: Course[]) => void;
  setNonPurchasedCourses: (courses: Course[]) => void;
  setSelectedCourse: (course: Course | null) => void;
  setSelectedSection: (section: Partial<Section> | null) => void;
  setSelectedModule: (module: Module | null) => void;
  setSelectedWeekId: (id: string | null) => void;
  setSelectedLesson: (lesson: Lesson | null) => void;

  // Reset
  reset: () => void;
};

export const useCourseStore = create<CourseStore>((set) => ({
  // Initial state
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

  // 🔹 Fetch purchased + non-purchased courses
  fetchGroupedCourses: async (userEnrollments = []) => {
    set({ isLoading: true });
    try {
      const allCourses = await getAllCourses();

      // If user has enrollments → split purchased / non-purchased
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

  // 🔹 Fetch module structure (weeks → days → lessons)
  fetchModuleStructure: async (module) => {
    console.log("🟣 fetchModuleStructure called with:", module);
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

  // 🔧 Setters
  setPurchasedCourses: (courses) => set({ purchasedCourses: courses }),
  setNonPurchasedCourses: (courses) => set({ nonPurchasedCourses: courses }),
  setSelectedCourse: (course) => set({ selectedCourse: course }),
  setSelectedSection: (section) => set({ selectedSection: section }),
  setSelectedModule: (module) => set({ selectedModule: module }),
  setSelectedWeekId: (id) => set({ selectedWeekId: id }),
  setSelectedLesson: (lesson) => set({ selectedLesson: lesson }),

  // 🔄 Reset all store state
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
    }),
}));