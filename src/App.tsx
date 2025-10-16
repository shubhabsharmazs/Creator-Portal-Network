import React, { useState } from "react";

const modules = {
  "Creator Directory": ["View / Update Profile", "Add Social Media Links"],
  Communication: ["Campaign Chat", "Notifications", "Broadcast"],
  "Campaigns & Contracts": ["Under Process", "Available", "Completed"],
  Payments: ["Payment Info & Tax Documents", "Payment Status", "Tickets"],
  Performance: ["Post Engagement", "Contracts", "Payments"],
};

export default function App() {
  const [selectedModule, setSelectedModule] = useState("Creator Directory");
  const [selectedSub, setSelectedSub] = useState("View / Update Profile");
  const [role, setRole] = useState("Creator");

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-xl flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold text-gray-800">Portal Module</h1>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-2 w-full border rounded-lg px-2 py-1 text-gray-700"
          >
            <option>Admin</option>
            <option>Microsoft User</option>
            <option>Creator</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {Object.entries(modules).map(([module, subs]) => (
            <div key={module} className="border-b">
              <button
                onClick={() => setSelectedModule(module)}
                className={`w-full text-left px-4 py-3 font-medium ${
                  selectedModule === module
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                {module}
              </button>
              {selectedModule === module && (
                <div className="pl-6 bg-gray-50">
                  {subs.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSub(sub)}
                      className={`block w-full text-left px-2 py-1 text-sm rounded ${
                        selectedSub === sub
                          ? "bg-blue-200 text-blue-900"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {selectedModule} — {selectedSub}
        </h2>

        {/* Placeholder area for each section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {selectedSub} Details
            </h3>
            <p className="text-gray-500">
              Placeholder area — add forms, tables, or analytics here.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Related Insights / Actions
            </h3>
            <p className="text-gray-500">
              Placeholder for related data, metrics, or quick actions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
