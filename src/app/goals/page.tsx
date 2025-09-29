"use client";

import { useEffect, useState } from "react";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [form, setForm] = useState({ goalType: "", location: "", deadline: "" });

  // Load goals
  useEffect(() => {
    fetch("/api/goals").then(async (res) => {
      if (res.ok) setGoals(await res.json());
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const newGoal = await res.json();
      setGoals((prev) => [...prev, newGoal]);
      setForm({ goalType: "", location: "", deadline: "" });
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🎯 My Goals</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
        <select
          value={form.goalType}
          onChange={(e) => setForm({ ...form, goalType: e.target.value })}
          required
          className="border rounded p-2"
        >
          <option value="">Select your goal</option>
          <option value="Find a job in IT">Find a job in IT</option>
          <option value="Get a promotion">Get a promotion</option>
          <option value="Get an internship">Get an internship</option>
        </select>

        <select
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
          className="border rounded p-2"
        >
          <option value="">Where?</option>
          <option value="remote">Remote</option>
          {/* TODO: map all US states */}
          <option value="California">California</option>
          <option value="Texas">Texas</option>
          <option value="New York">New York</option>
        </select>

        <input
          type="date"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          required
          className="border rounded p-2"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
        >
          Save Goal
        </button>
      </form>

      {/* List goals */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal._id} className="p-4 border rounded-lg">
            <p><strong>{goal.goalType}</strong></p>
            <p>📍 {goal.location}</p>
            <p>⏳ {new Date(goal.deadline).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}