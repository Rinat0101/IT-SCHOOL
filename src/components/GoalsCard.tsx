import React from "react";

const GoalCard = () => {
    return (
      <div className="rounded-2xl dialog-shadow bg-white p-6 space-y-4 text-gray-800">
    
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold">Your goal</h2>
          <a href="#" className="text-sm text-purple-600 font-medium hover:underline">
            Support
          </a>
        </div>
  
        <div>
          <p className="font-medium">
            Get a job in IT within <strong>11.11.2025</strong> in <strong>UK, London</strong>
          </p>
          <p className="text-sm text-gray-500 mt-1">Additional description of the objectives</p>
        </div>
  
        <hr className="border-gray-200" />
  
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-sm text-gray-700">Tasks</h3>
            <a href="#" className="text-sm text-purple-600 font-medium hover:underline">
              All Tasks
            </a>
          </div>
  
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
            <span>Join the students' chat</span>
            <span className="text-xs text-gray-300">•</span>
            <span>Introduce yourself in the students' chat</span>
          </div>
        </div>
      </div>
    );
  };
  
  export default GoalCard;