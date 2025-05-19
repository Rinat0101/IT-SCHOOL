import React from "react";

interface CourseCardProps {
  title: string;
  description: string;
  buttonText: string;
  imageUrl: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ title, description, buttonText, imageUrl }) => {
  return (
    <div className="flex items-center bg-blue-3 rounded-xl p-6 shadow-light-mode">
      {/* Left Side */}
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-2 mb-4">{description}</p>
        <button className="bg-blue-1 text-white py-2 px-6 rounded-md hover:bg-blue-600 btn-shadow">
          {buttonText}
        </button>
      </div>

      {/* Right Side - Image */}
      <div className="w-40 h-40 ml-6">
        <img src={imageUrl} alt="Course Illustration" className="object-cover w-full h-full rounded-md" />
      </div>
    </div>
  );
};

export default CourseCard;