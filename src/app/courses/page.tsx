import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import CoursesClient from "./CoursesClient";
import { getAllCourses, getCourse } from "@/lib/datocms";
import connectDB from "@/lib/mongoose";
import Enrollment from "@/models/CourseEnrollment";
import Course from "@/models/Course";
import UserProgress from "@/models/UserProgress";

// All courses the school offers. Some are also on the platform (matched by `platformSlug`),
// the rest are external-only and always appear in "Other Courses".
const MARKETING_COURSES = [
  {
    name: "QA Automation + AI",
    description:
      "Test smarter, not harder. Master Java, Selenium, REST-Assured, and AI-driven testing tools.",
    url: "https://procoding.com/aqa/",
    platformSlug: "aqa",
  },
  {
    name: "Web Development",
    description:
      "Build modern web applications from scratch — from layouts and APIs to launching real projects.",
    url: "https://procoding.com/web-development/",
    platformSlug: "web-development",
  },
  {
    name: "DevOps",
    description:
      "Become a DevOps engineer who won't be replaced by AI. Infrastructure, automation, cloud, and CI/CD.",
    url: "https://procoding.com/devops/",
    platformSlug: null,
  },
  {
    name: "Software Development Bootcamp",
    description:
      "Learn to build modern web apps end-to-end — layouts, core logic, APIs, and real-world projects.",
    url: "https://procoding.com/software-development-bootcamp/",
    platformSlug: null,
  },
  {
    name: "AI-Assisted Software Development",
    description:
      "Create websites and digital products using AI tools like ChatGPT and Copilot. Build with confidence.",
    url: "https://procoding.com/vibe-coding/",
    platformSlug: null,
  },
];

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await connectDB();

  const [allCourses, enrollments, progressDocs] = await Promise.all([
    getAllCourses(),
    Enrollment.find({ userId: session.user.id })
      .populate({ path: "courseId", model: Course, select: "datoCmsId name" })
      .lean(),
    UserProgress.find({ userId: session.user.id })
      .select("courseId completedLessons")
      .lean(),
  ]);

  const completedByCourseId = new Map<string, number>();
  for (const p of progressDocs as any[]) {
    completedByCourseId.set(
      String(p.courseId),
      Array.isArray(p.completedLessons) ? p.completedLessons.length : 0
    );
  }

  const enrolledDatoIds = enrollments
    .map((e: any) => e.courseId?.datoCmsId)
    .filter(Boolean) as string[];

  const enrolledCourseStubs = allCourses.filter((c) =>
    enrolledDatoIds.includes(c.id)
  );

  // Fetch each enrolled course's tree in parallel to count total lessons
  const courseTrees = await Promise.all(
    enrolledCourseStubs.map((c) => getCourse(c.slug).catch(() => null))
  );

  const totalLessonsBySlug = new Map<string, number>();
  for (const tree of courseTrees) {
    if (!tree) continue;
    let count = 0;
    for (const s of tree.sections ?? []) {
      for (const m of s.modules ?? []) {
        for (const w of m.weeks ?? []) {
          for (const d of w.days ?? []) {
            count += (d.lessons ?? []).length;
          }
        }
      }
    }
    totalLessonsBySlug.set(tree.slug, count);
  }

  const purchased = enrolledCourseStubs.map((c) => {
    const enrollment = enrollments.find(
      (e: any) => e.courseId?.datoCmsId === c.id
    ) as any;
    const mongoCourseId = enrollment?.courseId?._id
      ? String(enrollment.courseId._id)
      : null;
    return {
      ...c,
      completedLessons: mongoCourseId
        ? completedByCourseId.get(mongoCourseId) ?? 0
        : 0,
      totalLessons: totalLessonsBySlug.get(c.slug) ?? 0,
      accessLevel: (enrollment?.accessLevel as "limited" | "full" | undefined) ?? "limited",
    };
  });

  const enrolledSlugs = new Set(enrolledCourseStubs.map((c) => c.slug));
  const nonPurchased = MARKETING_COURSES.filter(
    (m) => !m.platformSlug || !enrolledSlugs.has(m.platformSlug)
  ).map((m) => ({
    name: m.name,
    description: m.description,
    url: m.url,
  }));

  const userName = session.user.name?.split(" ")[0] ?? "";

  return (
    <CoursesClient
      userName={userName}
      courses={{ purchased, nonPurchased }}
    />
  );
}