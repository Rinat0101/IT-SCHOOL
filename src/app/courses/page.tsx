"use client";
import Navbar from "@/app/navbar";
import PurchasedCourseCard from "@/app/purchasedCourseCard";
import NonPurchasedCourseCard from "@/app/nonPurchasedCourseCard";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto">
        <h1 className="text-xl text-[#000000] font-bold mb-6">Courses</h1>
        
        <section className="mb-8">
        <h2 className="text-2xl text-gray-2 font-semibold mb-6">Current courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <PurchasedCourseCard
              title="Web Development"
              startDate="12.12.2024"
              endDate="10.06.2025"
              completionPercentage={60}
            />
            <PurchasedCourseCard
              title="UX/UI Design"
              startDate="06.01.2025"
              endDate="14.05.2025"
              completionPercentage={60}
            />
            <PurchasedCourseCard
              title="Interview Preparation"
              startDate="23.03.2025"
              endDate="19.08.2025"
              completionPercentage={60}
            />
          </div>
        </section>

        <section className="mb-8">
  <h2 className="text-2xl text-gray-2 font-semibold mb-4">
    Courses that will help you become a better person
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <NonPurchasedCourseCard
      title="Programming course"
      description="Master your profession in 3 months and get new orders"
      buttonText="Go Now"
      imageUrl="/images/plain-logo.png"
    />
    <NonPurchasedCourseCard
      title="Programming course"
      description="Master your profession in 3 months and get new orders"
      buttonText="Go Now"
      imageUrl="/images/plain-logo.png"
    />
  </div>
</section>
<section className="mb-8">
        <h2 className="text-2xl text-gray-2 font-semibold mb-6">Purchased courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <PurchasedCourseCard
              title="Web Development"
              startDate="12.12.2024"
              endDate="10.06.2025"
              completionPercentage={60}
            />
            <PurchasedCourseCard
              title="UX/UI Design"
              startDate="06.01.2025"
              endDate="14.05.2025"
              completionPercentage={60}
            />
            <PurchasedCourseCard
              title="Interview Preparation"
              startDate="23.03.2025"
              endDate="19.08.2025"
              completionPercentage={60}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;