// src/MSUserApp.tsx (Your MSUser.tsx, with types moved)

import React, { useMemo, useState } from "react";
import {
  Role,
  CampaignStage,
  Campaign,
  CreatorProfile,
} from "./types"; // <-- Imported Types

/* ---------------------------
   Helpers & Mock Data (Adapted)
----------------------------*/
const now = Date.now();
const makeId = (n: number) => `CID-${1000 + n}`;
const makeCreatorId = (n: number) => `CR-${2000 + n}`;

// ... (timeAgo function is still here) ...

const timeAgo = (ts: number) => {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// Mock Data for MS User view (Still uses your original mock data structure)
const mockCreators: CreatorProfile[] = [
  // ... (Your mockCreators data is here) ...
  {
    id: makeCreatorId(1),
    name: "Rohit Sharma",
    platform: "YouTube",
    followers: 520000,
    engagement: 0.08,
    notes: "Excellent tech reviews. Needs a higher budget.",
    isVerified: true,
    assignedCampaigns: [makeId(101)],
  },
  {
    id: makeCreatorId(2),
    name: "Priya Singh",
    platform: "Instagram",
    followers: 150000,
    engagement: 0.12,
    notes: "Fashion/Lifestyle. Responds quickly to content review.",
    isVerified: true,
    assignedCampaigns: [makeId(102)],
  },
  {
    id: makeCreatorId(3),
    name: "Tech Guru",
    platform: "TikTok",
    followers: 98000,
    engagement: 0.05,
    notes: "Requires close monitoring on deliverable dates.",
    isVerified: false,
    assignedCampaigns: [],
  },
  {
    id: makeCreatorId(4),
    name: "Aman Verma",
    platform: "YouTube",
    followers: 1200000,
    engagement: 0.07,
    notes: "High reach, premium cost.",
    isVerified: true,
    assignedCampaigns: [makeId(103)],
  },
  {
    id: makeCreatorId(5),
    name: "Lifestyle Queen",
    platform: "Instagram",
    followers: 32000,
    engagement: 0.15,
    notes: "Good micro-influencer.",
    isVerified: false,
    assignedCampaigns: [],
  },
];

const mockMSCampaigns: Campaign[] = [
  // ... (Your mockMSCampaigns data is here) ...
  {
    id: makeId(101),
    name: "Smart Home Launch",
    poc: "Sonal Gupta",
    createdAt: now - 1000 * 60 * 60 * 24 * 10,
    brief: "Smart home device launch deliverables.",
    stage: "Content Sent",
    budgetUtilization: 0.65,
    creatorIds: [makeCreatorId(1), makeCreatorId(4)],
  },
  {
    id: makeId(102),
    name: "Fitness App Collab",
    poc: "Vikram Singh",
    createdAt: now - 1000 * 60 * 60 * 24 * 5,
    brief: "In-app demo + 1 reel",
    stage: "Approval",
    budgetUtilization: 0.8,
    creatorIds: [makeCreatorId(2)],
  },
  {
    id: makeId(103),
    name: "Green Energy Campaign",
    poc: "Anita Joshi",
    createdAt: now - 1000 * 60 * 60 * 24 * 20,
    brief: "Series about renewable energy.",
    stage: "Post Approval",
    budgetUtilization: 0.95,
    creatorIds: [makeCreatorId(4)],
  },
  {
    id: makeId(104),
    name: "New Creator Onboard",
    poc: "Priya Sharma",
    createdAt: now - 1000 * 60 * 60 * 24 * 1,
    brief: "Draft campaign for new micro-influencers.",
    stage: "Draft",
    budgetUtilization: 0.0,
    creatorIds: [],
  },
];

/* ---------------------------
   Components (Specific to MS User - Same as your code)
----------------------------*/

// ... (MSHeader, MSSidebar, Modal, MSCreatorDirectory, MSCampaignsModule, MSPaymentsModule components remain unchanged) ...

const MSHeader: React.FC<{ role: Role; onRoleChange: (r: Role) => void }> = ({
  role,
  onRoleChange,
}) => (
  // ... (Your MSHeader component implementation) ...
  <header className="h-16 bg-blue-900 text-white flex items-center justify-between px-6 shadow-md">
    <div className="flex items-center gap-4">
      <div className="bg-white/30 rounded-full h-10 w-10 flex items-center justify-center font-bold">
        MS
      </div>
      <div>
        <div className="text-lg font-semibold">Campaign Management</div>
        <div className="text-xs opacity-90">Microsoft User / Admin View</div>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <select
        className="bg-white/10 px-3 py-1 rounded text-white border border-white/30"
        value={role}
        onChange={(e) => onRoleChange(e.target.value as Role)}
      >
        <option value="Creator" className="text-gray-800">
          Creator
        </option>
        <option value="Microsoft User" className="text-gray-800">
          Microsoft User
        </option>
        <option value="Admin" className="text-gray-800">
          Admin
        </option>
      </select>
      <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
        MS
      </div>
    </div>
  </header>
);

const MSSidebar: React.FC<{
  modules: string[];
  selected: string;
  onSelect: (m: string) => void;
  subitems: Record<string, string[]>;
  selectedSub: string;
  onSelectSub: (s: string) => void;
}> = ({ modules, selected, onSelect, subitems, selectedSub, onSelectSub }) => (
  // ... (Your MSSidebar component implementation) ...
  <aside className="w-80 bg-white border-r min-h-screen">
    <nav className="p-4 space-y-3">
      {modules.map((m) => (
        <div key={m}>
          <button
            onClick={() => onSelect(m)}
            className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
              selected === m
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                : "text-gray-800 hover:bg-gray-100"
            }`}
          >
            {m}
          </button>
          {selected === m && (
            <div className="mt-2 pl-4">
              {subitems[m]?.map((s) => (
                <button
                  key={s}
                  onClick={() => onSelectSub(s)}
                  className={`block w-full text-left px-3 py-1 rounded mb-1 text-sm ${
                    selectedSub === s
                      ? "bg-blue-100 text-blue-800 font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  </aside>
);

const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}> = ({ open, onClose, children, title, size = "md" }) => {
  if (!open) return null;
  const maxW =
    size === "sm" ? "max-w-md" : size === "lg" ? "max-w-4xl" : "max-w-2xl";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`bg-white rounded-lg shadow-lg w-full ${maxW} overflow-auto max-h-[90vh]`}
      >
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded border hover:bg-gray-50"
          >
            Close
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const MSCreatorDirectory: React.FC<{ creators: CreatorProfile[] }> = ({
  creators,
}) => {
  const [search, setSearch] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("All");

  const filteredCreators = useMemo(() => {
    return creators.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) &&
        (filterPlatform === "All" || c.platform === filterPlatform)
    );
  }, [creators, search, filterPlatform]);

  const CreatorCard: React.FC<{ c: CreatorProfile }> = ({ c }) => (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between border hover:border-blue-500 transition h-full min-w-[300px]">
      <div>
        <div className="font-bold text-lg">{c.name}</div>
        <div className="text-sm text-gray-600 flex items-center gap-2">
          {c.platform} • {c.followers.toLocaleString()} Followers
          {c.isVerified && (
            <span className="text-green-500 text-xs">(Verified)</span>
          )}
        </div>
        <div className="mt-2 text-xs">
          Engagement Rate:{" "}
          <span className="font-medium text-blue-600">
            {(c.engagement * 100).toFixed(2)}%
          </span>
        </div>
        <div className="mt-2 text-sm text-gray-700 line-clamp-3">
          Notes: {c.notes}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
          View Profile
        </button>
        <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
          Add to Shortlist
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
        <div className="font-semibold text-lg">
          Search & Filter Creators ({filteredCreators.length} Found)
        </div>
        <div className="flex gap-3">
          <input
            placeholder="Search by name or performance"
            className="p-2 border rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="p-2 border rounded"
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
          >
            <option>All</option>
            <option>Instagram</option>
            <option>YouTube</option>
            <option>TikTok</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 overflow-x-auto pb-4">
        {filteredCreators.map((c) => (
          <CreatorCard key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
};

const MSCampaignsModule: React.FC<{ campaigns: Campaign[] }> = ({
  campaigns,
}) => {
  const [filterStage, setFilterStage] = useState("Under Process");

  const stages = {
    "Under Process": ["Draft", "Invite", "Accepted"],
    Active: ["Content Sent", "Approval", "Content Posted Confirmation Sent"],
    Completed: ["Post Approval"],
  };

  const filteredCampaigns = useMemo(() => {
    const stageKeys = stages[filterStage as keyof typeof stages];
    return campaigns.filter((c) => stageKeys.includes(c.stage));
  }, [campaigns, filterStage]);

  const CampaignCardMS: React.FC<{ c: Campaign }> = ({ c }) => (
    <div className="min-w-[360px] h-56 bg-white rounded-2xl p-4 shadow-lg border flex flex-col justify-between">
      <div>
        <div className="font-semibold text-lg">{c.name}</div>
        <div className="text-xs text-gray-500">
          {c.id} • POC: {c.poc}
        </div>
        <div className="mt-2 text-sm text-gray-600 line-clamp-3">{c.brief}</div>
      </div>
      <div className="mt-3">
        <div className="text-sm font-medium mb-1">
          Budget Util:{" "}
          <span className="text-blue-600">
            {(c.budgetUtilization! * 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${c.budgetUtilization! * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2">
          <div
            className={`text-xs px-2 py-1 rounded ${
              c.stage === "Approval"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {c.stage}
          </div>
          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
            Review/Edit
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 border-b pb-3">
        {Object.keys(stages).map((stage) => (
          <button
            key={stage}
            onClick={() => setFilterStage(stage)}
            className={`px-4 py-2 font-medium rounded-t-lg transition ${
              filterStage === stage
                ? "bg-white text-blue-700 border-b-2 border-blue-700"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            {stage} (
            {
              campaigns.filter((c) =>
                stages[stage as keyof typeof stages].includes(c.stage)
              ).length
            }
            )
          </button>
        ))}
        <button className="ml-auto px-4 py-2 bg-green-500 text-white rounded-lg">
          Create New Campaign
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3">
        {filteredCampaigns.length === 0 && (
          <div className="p-4 text-gray-500">No campaigns in this stage.</div>
        )}
        {filteredCampaigns.map((c) => (
          <CampaignCardMS key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
};

const MSPaymentsModule: React.FC<{ campaigns: Campaign[] }> = ({
  campaigns,
}) => {
  const [activeTab, setActiveTab] = useState("Approvals"); // Approvals, Campaign Payments, Dashboard

  const approvalCampaigns = campaigns.filter(
    (c) => c.paymentStatus === "Awaiting Approval"
  );

  const ApprovalItem: React.FC<{ c: Campaign }> = ({ c }) => (
    <div className="p-4 border rounded-lg bg-yellow-50 flex justify-between items-center">
      <div>
        <div className="font-semibold text-gray-800">{c.name}</div>
        <div className="text-sm text-gray-600">
          Payment Due:{" "}
          <span className="font-medium text-red-600">₹{c.amount ?? "N/A"}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-green-500 text-white rounded">
          Approve Payment
        </button>
        <button className="px-4 py-2 border rounded hover:bg-gray-100">
          Hold
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "Approvals":
        return (
          <div className="space-y-3">
            {approvalCampaigns.length === 0 && (
              <div className="p-4 text-gray-500">
                No payments awaiting approval.
              </div>
            )}
            {approvalCampaigns.map((c) => (
              <ApprovalItem key={c.id} c={c} />
            ))}
          </div>
        );
      case "Campaign Payments":
        return (
          <div className="p-4 border rounded-lg">
            Detailed campaign-level spend and payout schedule.
          </div>
        );
      case "Dashboard":
        return (
          <div className="p-4 border rounded-lg">
            Summary reports for finance tracking. (Download Summary Report
            button)
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center border-b">
        {["Approvals", "Campaign Payments", "Dashboard"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === tab
                ? "text-blue-700 border-b-2 border-blue-700"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">{renderContent()}</div>
    </div>
  );
};

/* ---------------------------
   Main Microsoft User App
----------------------------*/

const MSUserApp: React.FC<{
  initialRole: Role;
  onRoleChange: (r: Role) => void;
}> = ({ initialRole, onRoleChange }) => {
  const [role, setRole] = useState<Role>(initialRole);
  const handleRoleChange = (r: Role) => {
    setRole(r);
    onRoleChange(r);
  };

  const modules = [
    "Creator Directory",
    "Communications",
    "Campaigns",
    "Payments",
    "Onboarding",
    "Campaign Briefs",
    "Performance",
  ];
  const subitems: Record<string, string[]> = {
    "Creator Directory": [
      "Search & Filter",
      "View Profile",
      "Assign to Campaign",
    ],
    Communications: ["Chat", "Notifications", "Broadcast"],
    Campaigns: ["Under Process", "Active", "Completed"],
    Payments: ["Approvals", "Campaign Payments", "Dashboard"],
    Onboarding: ["Invites", "Verification", "Resources"],
    "Campaign Briefs": ["My Campaigns", "Brief Creation", "Deliverable Review"],
    Performance: ["Campaign Metrics", "Reports", "Insights"],
  };

  const [selectedModule, setSelectedModule] =
    useState<string>("Creator Directory");
  const [selectedSub, setSelectedSub] = useState<string>("Search & Filter");

  // Mock data states
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockMSCampaigns);
  const [creators, setCreators] = useState<CreatorProfile[]>(mockCreators);

  // RENDER SELECTED MODULE
  const renderSelected = () => {
    switch (selectedModule) {
      case "Creator Directory":
        return <MSCreatorDirectory creators={creators} />;
      case "Communications":
        return (
          <div className="p-8 bg-white shadow rounded-lg">
            Chat, Notifications, and Broadcast tool for bulk updates.
          </div>
        );
      case "Campaigns":
        return <MSCampaignsModule campaigns={campaigns} />;
      case "Payments":
        return <MSPaymentsModule campaigns={campaigns} />;
      case "Onboarding":
        return (
          <div className="p-8 bg-white shadow rounded-lg">
            Invite new creators, review verification submissions, and share
            guidelines.
          </div>
        );
      case "Campaign Briefs":
        return (
          <div className="p-8 bg-white shadow rounded-lg">
            Tools for brief creation, asset attachment, and reviewing submitted
            content (Deliverable Review).
          </div>
        );
      case "Performance":
        return (
          <div className="p-8 bg-white shadow rounded-lg">
            View performance analytics (impressions, CTR, engagement rate) and
            export reports.
          </div>
        );
      default:
        return <div>Select a module</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MSHeader role={role} onRoleChange={handleRoleChange} />

      <div className="flex flex-1">
        <MSSidebar
          modules={modules}
          selected={selectedModule}
          onSelect={(m) => {
            setSelectedModule(m);
            setSelectedSub(subitems[m]?.[0] ?? "");
          }}
          subitems={subitems}
          selectedSub={selectedSub}
          onSelectSub={(s) => setSelectedSub(s)}
        />

        <main className="flex-1 p-6 bg-gray-100 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                {selectedModule} —{" "}
                <span className="text-blue-600">{selectedSub}</span>
              </h1>
              <div className="text-sm text-gray-600">
                Microsoft Management Dashboard
              </div>
            </div>

            {renderSelected()}

            <div className="mt-8 text-xs text-gray-400">
              This is a mock UI for the Microsoft User role.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MSUserApp;