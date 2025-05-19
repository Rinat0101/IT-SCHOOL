import CourseSectionCard from "@/components/courseSectionCard";
import GoalsCard from "@/components/GoalsCard";
import React from "react";

const CourseSectionCardsContainer = () => {
  return (
    <><div className="flex space-x-4 justify-between w-full dialog-shadow rounded-lg overflow-x-auto p-5 mt-10">
      <div className="flex-1">
        <CourseSectionCard
          title="Prework"
          completionPercentage={100}
          iconUrl="/images/plain-logo.png" />
      </div>
      <div className="flex-1">
        <CourseSectionCard
          title="Main Course"
          completionPercentage={75}
          iconUrl="/images/plain-logo.png" />
      </div>
      <div className="flex-1">
        <CourseSectionCard
          title="Career-growth Course"
          completionPercentage={75}
          iconUrl="/images/plain-logo.png" />
      </div>
    </div><div className="max-w-xl mx-auto my-10">
        <GoalsCard />
      </div></>
  );
};

export default CourseSectionCardsContainer;