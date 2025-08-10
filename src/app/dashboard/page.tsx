// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { redirect } from "next/navigation";
// import Link from "next/link";
// import PurchasedCourseCard from "@/app/purchasedCourseCard";
// import NonPurchasedCourseCard from "@/app/nonPurchasedCourseCard";
// import { getGroupedCourses } from "@/lib/datocms";

// export default async function Dashboard() {
//   const session = await getServerSession(authOptions);

//   if (!session) {
//     redirect("/login");
//   }
  
//   const { purchased, nonPurchased } = await getGroupedCourses(session.user.id);

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="container mx-auto">
//         <h1 className="text-xl text-[#000000] font-bold mb-6">Courses</h1>

//         {/* Section 1: Current Courses (Purchased) */}
//         <section className="mb-8">
//           <h2 className="text-2xl text-gray-2 font-semibold mb-6">Current courses</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {purchased.map((course) => (
//               <Link key={course.id} href={`/courses/${course.slug}`} className="block">
//                 <PurchasedCourseCard
//                   title={course.name}
//                   startDate={course.startDate ?? "N/A"}
//                   endDate={course.endDate ?? "N/A"}
//                   completionPercentage={60} 
//                 />
//               </Link>
//             ))}
//           </div>
//         </section>

//         {/* Section 2: Non-Purchased Courses */}
//         {nonPurchased.length > 0 && (
//           <section className="mb-8">
//             <h2 className="text-2xl text-gray-2 font-semibold mb-4">
//               Courses that will help you become a better person
//             </h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               {nonPurchased.map((course) => (
//                 <NonPurchasedCourseCard
//                   key={course.id}
//                   title={course.name}
//                   description="Unlock to learn more"
//                   buttonText="Preview"
//                   imageUrl="/images/nonpurchased.png"
//                 />
//               ))}
//             </div>
//           </section>
//         )}
//       </div>
//     </div>
//   );
// }


import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { getGroupedCourses } from "@/lib/datocms";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const courses = await getGroupedCourses(session.user.id);

  return <DashboardClient courses={courses} />;
}