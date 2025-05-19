"use client";
import React from "react";
import Navbar from "@/app/navbar";
import CourseSectionCard from "@/components/purchasedCourseCard";
import Breadcrumbs from "@/app/path"
import CourseProgress from "@/app/courseProgress"


const CoursePage = () => {
    const courseName = "Web Development Path";
    const currentPage = "Overview";
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto">
        <h1 className="text-xl text-[#000000] font-bold mb-6">Web Development</h1>
        <Breadcrumbs courseName={courseName} currentPage={currentPage} />
     <CourseProgress/>
      </div>
    </div>
  );
};

export default CoursePage;