// src/MSUserApp.tsx

import React, { useState } from "react";
import { Role } from "./types";
import "./index.css";

/* ---------------------------
   --- MSUSER INTERFACE ---
   Microsoft User Portal
----------------------------*/

interface MSUserAppProps {
  initialRole: Role;
  onRoleChange: (role: Role) => void;
}

const dummyCampaigns = [
  {
    id: "C001",
    name: "Surface Pro Launch",
    status: "Active",
    budget: "₹50,000",
  },
  {
    id: "C002",
    name: "Azure Developer Program",
    status: "Pending Approval",
    budget: "₹30,000",
  },
  {
    id: "C003",
    name: "Modern Work Ads",
    status: "Completed",
    budget: "₹1,20,000",
  },
];

const MSUserApp: React.FC<MSUserAppProps> = ({ initialRole, onRoleChange }) => {
  const [selectedTab, setSelectedTab] = useState("Dashboard");

  const renderContent = () => {
    switch (selectedTab) {
      case "Dashboard":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Microsoft User Dashboard
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded shadow">
                <p className="text-gray-600 text-sm">Active Campaigns</p>
                <p className="text-2xl font-bold text-indigo-700">3</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <p className="text-gray-600 text-sm">Pending Approvals</p>
                <p className="text-2xl font-bold text-indigo-700">2</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <p className="text-gray-600 text-sm">Total Spend</p>
                <p className="text-2xl font-bold text-indigo-700">₹2,00,000</p>
              </div>
            </div>
          </div>
        );

      case "Campaigns":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Campaign Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dummyCampaigns.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl p-4 shadow border"
                >
                  <div className="font-semibold text-lg">{c.name}</div>
                  <div className="text-sm text-gray-500">{c.id}</div>
                  <div className="mt-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        c.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : c.status === "Pending Approval"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Budget: {c.budget}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">
                      View
                    </button>
                    <button className="px-3 py-1 border rounded text-sm">
                      Approve
                    </button>
                    <button className="px-3 py-1 border rounded text-sm text-red-600 border-red-200">
                      Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "Payments":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Payments & Approvals</h2>
            <p className="text-gray-600 text-sm mb-4">
              View campaign-level spend and approve payouts.
            </p>
            <div className="bg-white rounded-xl p-4 shadow border">
              <div className="flex justify-between mb-2">
                <span>Surface Pro Launch</span>
                <span className="text-gray-500">₹50,000</span>
              </div>
              <button className="mt-3 px-4 py-1 bg-indigo-600 text-white rounded">
                Approve Payment
              </button>
            </div>
          </div>
        );

      case "Creators":
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Creator Directory</h2>
            <p className="text-gray-600 text-sm mb-4">
              Search, filter, and assign creators to campaigns.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow border">
                <p className="font-semibold">Priya Sharma</p>
                <p className="text-xs text-gray-500">
                  Instagram • 100K Followers
                </p>
                <button className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded text-sm">
                  Assign to Campaign
                </button>
              </div>
              <div className="bg-white rounded-xl p-4 shadow border">
                <p className="font-semibold">Rohit Verma</p>
                <p className="text-xs text-gray-500">
                  YouTube • 250K Subscribers
                </p>
                <button className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded text-sm">
                  Assign to Campaign
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="p-6 text-gray-600">Coming soon...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <select
            value={initialRole}
            onChange={(e) => onRoleChange(e.target.value as Role)}
            className="w-full p-2 border rounded text-sm"
          >
            <option value="Creator">Creator</option>
            <option value="Microsoft User">Microsoft User</option>
          </select>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {["Dashboard", "Campaigns", "Creators", "Payments"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`w-full text-left px-3 py-2 rounded ${
                selectedTab === tab
                  ? "bg-indigo-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{renderContent()}</main>
    </div>
  );
};

export default MSUserApp;
