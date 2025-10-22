// src/MSUserApp.tsx
import React, { useMemo, useState } from "react";
import { Role } from "./types";
import "./index.css";

/* ---------------------------------------------------------
   --- MSUSER INTERFACE ---
   Microsoft User Portal (drop-in replacement / standalone)
   - Uses same layout and Tailwind classes as Creator Portal
   - Tabs: Dashboard, Creator Directory, Communications,
           Campaigns, Payments, Onboarding, Campaign Briefs,
           Performance
   - Mock data for examples and interactive demo buttons
   - Includes a "Back to Home" button that calls `onRoleChange(null)`
--------------------------------------------------------- */

type NullableRole = Role | null;

interface MSUserAppProps {
  initialRole?: Role;
  onRoleChange?: (r: NullableRole) => void;
}

const modules = [
  "Dashboard",
  "Creator Directory",
  "Communications",
  "Campaigns",
  "Payments",
  "Onboarding",
  "Campaign Briefs",
  "Performance",
] as const;

type Module = (typeof modules)[number];

/* ---------- Mock Data ---------- */

const creators = [
  {
    id: "CR-001",
    name: "Priya Sharma",
    platform: "Instagram",
    followers: "120k",
    engagement: "4.5%",
    notes: "Strong feed, great for lifestyle campaigns",
    verified: true,
  },
  {
    id: "CR-002",
    name: "Rohit Verma",
    platform: "YouTube",
    followers: "250k",
    engagement: "5.8%",
    notes: "Long-form reviews, good retention",
    verified: true,
  },
  {
    id: "CR-003",
    name: "Nisha Patel",
    platform: "TikTok",
    followers: "90k",
    engagement: "12.2%",
    notes: "Short-form viral potential",
    verified: false,
  },
  {
    id: "CR-004",
    name: "Aman Gupta",
    platform: "Threads",
    followers: "45k",
    engagement: "3.1%",
    notes: "Micro influencers, strong niche reach",
    verified: false,
  },
];

const msCampaigns = [
  {
    id: "MS-C-101",
    name: "Surface Pro Launch",
    status: "Active",
    budget: "₹5,00,000",
    poc: "Product Marketing",
    deliverables: "3 posts, 2 stories, 1 demo video",
    progress: 65,
  },
  {
    id: "MS-C-102",
    name: "Azure Dev Week",
    status: "Pending Approval",
    budget: "₹3,00,000",
    poc: "Developer Outreach",
    deliverables: "5 shorts, 2 long videos",
    progress: 30,
  },
  {
    id: "MS-C-103",
    name: "Modern Work Series",
    status: "Completed",
    budget: "₹2,50,000",
    poc: "Modern Work Team",
    deliverables: "4 posts, 1 webinar",
    progress: 100,
  },
];

const paymentsExample = [
  {
    id: "MS-C-101",
    name: "Surface Pro Launch",
    amount: "₹2,00,000",
    status: "Awaiting Approval",
  },
  {
    id: "MS-C-103",
    name: "Modern Work Series",
    amount: "₹1,20,000",
    status: "Paid",
  },
  {
    id: "MS-C-102",
    name: "Azure Dev Week",
    amount: "₹80,000",
    status: "Under Process",
  },
];

const notificationsExample = [
  { id: "N-1", text: "Contract MS-C-102 awaiting e-signature", time: "2h ago" },
  {
    id: "N-2",
    text: "Creator Priya uploaded draft for Surface Pro",
    time: "6h ago",
  },
  {
    id: "N-3",
    text: "Payment for Modern Work Series marked Paid",
    time: "1d ago",
  },
];

/* ---------- Reusable UI pieces ---------- */

const Header: React.FC<{ roleLabel?: string; onBack?: () => void }> = ({
  roleLabel = "Microsoft User",
  onBack,
}) => (
  <header className="h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-between px-6 sticky top-0 z-20">
    <div className="flex items-center gap-4">
      <div className="bg-white/30 rounded-full h-10 w-10 flex items-center justify-center font-bold">
        MU
      </div>
      <div>
        <div className="text-lg font-semibold">MS User Portal</div>
        <div className="text-xs opacity-90">Microsoft User view</div>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div className="text-sm opacity-90">Signed in as</div>
      <div className="bg-white/10 px-3 py-1 rounded">{roleLabel}</div>
      <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
        MS
      </div>
    </div>

    {/* Back button absolute so it's easy to reach */}
    {onBack && (
      <button
        onClick={onBack}
        className="absolute left-4 top-4 z-50 bg-white/10 text-white px-3 py-1 rounded border border-white/20 hover:bg-white/20 transition"
        title="Back to role selection"
      >
        ← Home
      </button>
    )}
  </header>
);

const Sidebar: React.FC<{
  selected: Module;
  setSelected: (m: Module) => void;
}> = ({ selected, setSelected }) => {
  return (
    <aside className="w-72 bg-white border-r min-h-screen pt-4">
      <div className="px-4 pb-3">
        <div className="text-lg font-semibold text-gray-700">MS Modules</div>
        <div className="text-xs text-gray-500">Select a workspace</div>
      </div>

      <nav className="px-2 space-y-2">
        {modules.map((m) => (
          <button
            key={m}
            onClick={() => setSelected(m)}
            className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
              selected === m
                ? "bg-indigo-600 text-white"
                : "text-gray-800 hover:bg-gray-50"
            }`}
          >
            {m}
          </button>
        ))}
      </nav>

      <div className="mt-auto p-4">
        <div className="text-xs text-gray-500">Quick actions</div>
        <div className="mt-2 flex flex-col gap-2">
          <button className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded">
            Create New Campaign
          </button>
          <button className="px-3 py-2 bg-yellow-50 text-yellow-800 rounded">
            Pending Contracts
          </button>
          <button className="px-3 py-2 bg-white border rounded">
            Upcoming Payments
          </button>
        </div>
      </div>
    </aside>
  );
};

/* ---------- Module Components ---------- */

const DashboardView: React.FC = () => {
  const active = msCampaigns.filter((c) => c.status === "Active").length;
  const pending = msCampaigns.filter(
    (c) => c.status === "Pending Approval"
  ).length;
  const spend = "₹10,50,000";

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Active Campaigns</div>
          <div className="text-2xl font-bold mt-2">{active}</div>
          <div className="text-xs text-gray-400 mt-2">
            Quick access to active campaigns
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Pending Approvals</div>
          <div className="text-2xl font-bold mt-2">{pending}</div>
          <div className="text-xs text-gray-400 mt-2">
            Items requiring your review
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Spend Summary</div>
          <div className="text-2xl font-bold mt-2">{spend}</div>
          <div className="text-xs text-gray-400 mt-2">
            Campaign budget overview
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="font-semibold">Create New Campaign</div>
          <div className="text-xs text-gray-500 mt-1">Quick brief template</div>
          <textarea
            placeholder="Short campaign description..."
            className="w-full mt-3 p-2 border rounded"
            rows={4}
          />
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-1 bg-indigo-600 text-white rounded">
              Generate Brief
            </button>
            <button className="px-3 py-1 border rounded">
              Preview Template
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <div className="font-semibold">Pending Contracts</div>
          <div className="text-xs text-gray-500 mt-1">
            Contracts awaiting signatures
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              MS-C-102 • Azure Dev Week •{" "}
              <button className="text-indigo-600">Send Reminder</button>
            </li>
            <li>
              MS-C-101 • Surface Pro •{" "}
              <button className="text-indigo-600">View</button>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <div className="font-semibold">Upcoming Payments</div>
          <div className="text-xs text-gray-500 mt-1">
            Payments scheduled for release
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              MS-C-101 • ₹2,00,000 •{" "}
              <button className="text-indigo-600">Approve</button>
            </li>
            <li>
              MS-C-102 • ₹80,000 •{" "}
              <button className="text-indigo-600">Review</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const CreatorDirectoryView: React.FC = () => {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return creators;
    return creators.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.platform.toLowerCase().includes(s) ||
        c.id.toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Creator Directory</h2>

      <div className="bg-white rounded-lg p-4 shadow mb-4 flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search creators by name or platform"
          className="flex-1 p-2 border rounded"
        />
        <select className="p-2 border rounded">
          <option>All Platforms</option>
          <option>Instagram</option>
          <option>YouTube</option>
          <option>TikTok</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-gray-500">
                  {c.id} • {c.platform}
                </div>
                <div className="text-sm mt-2">{c.notes}</div>
              </div>
              <div className="text-right">
                <div
                  className={`text-sm font-semibold ${
                    c.verified ? "text-green-700" : "text-gray-500"
                  }`}
                >
                  {c.verified ? "Verified" : "Unverified"}
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  {c.followers} • {c.engagement}
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">
                Shortlist
              </button>
              <button className="px-3 py-1 border rounded text-sm">
                Assign to Campaign
              </button>
              <button className="px-3 py-1 border rounded text-sm">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CommunicationsView: React.FC = () => {
  const [tab, setTab] = useState<"Chat" | "Notifications" | "Broadcast">(
    "Chat"
  );
  const [message, setMessage] = useState("");
  const [selectedConv, setSelectedConv] = useState(creators[0].id);

  const conversations = [
    {
      id: creators[0].id,
      name: creators[0].name,
      preview: "Shared draft — needs a sticker",
    },
    {
      id: creators[1].id,
      name: creators[1].name,
      preview: "Scheduling for next week",
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Communications</h2>
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="flex gap-2 mb-4">
          {["Chat", "Notifications", "Broadcast"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`px-3 py-2 rounded ${
                tab === t ? "bg-indigo-600 text-white" : "bg-gray-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Chat" && (
          <div className="flex gap-4">
            <div className="w-1/3 border-r pr-3">
              <div className="font-semibold mb-2">Conversations</div>
              <div className="space-y-2">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConv(c.id)}
                    className={`w-full text-left p-2 rounded ${
                      selectedConv === c.id
                        ? "bg-indigo-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.preview}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <div className="bg-gray-50 p-4 h-64 rounded overflow-y-auto">
                <div className="text-sm text-gray-500">
                  Chat with {creators.find((c) => c.id === selectedConv)?.name}
                </div>
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-white rounded shadow-sm">
                    Hi — please share the final assets.
                  </div>
                  <div className="p-3 bg-indigo-50 rounded self-end">
                    Uploading tonight — will notify.
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 p-2 border rounded"
                  placeholder="Write a message..."
                />
                <button
                  onClick={() => {
                    if (!message.trim()) return;
                    alert("Sent (demo): " + message);
                    setMessage("");
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "Notifications" && (
          <div>
            <div className="font-semibold mb-2">Notifications</div>
            <ul className="space-y-2">
              {notificationsExample.map((n) => (
                <li
                  key={n.id}
                  className="p-3 bg-white rounded shadow-sm flex justify-between items-center"
                >
                  <div>
                    <div className="text-sm">{n.text}</div>
                    <div className="text-xs text-gray-400">{n.time}</div>
                  </div>
                  <div>
                    <button className="px-3 py-1 border rounded text-sm">
                      Mark read
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "Broadcast" && (
          <div>
            <div className="font-semibold mb-2">Broadcast Message</div>
            <textarea
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Write an announcement to creators..."
            />
            <div className="mt-3">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded">
                Send Broadcast
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CampaignsView: React.FC = () => {
  const [tab, setTab] = useState<"Under Process" | "Active" | "Completed">(
    "Under Process"
  );
  const filtered = useMemo(() => {
    if (tab === "Under Process")
      return msCampaigns.filter((c) => c.status === "Pending Approval");
    if (tab === "Active")
      return msCampaigns.filter((c) => c.status === "Active");
    return msCampaigns.filter((c) => c.status === "Completed");
  }, [tab]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Campaigns</h2>
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="flex gap-2 mb-4">
          {["Under Process", "Active", "Completed"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`px-3 py-2 rounded ${
                tab === t ? "bg-indigo-600 text-white" : "bg-gray-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-gray-500">
                    {c.id} • {c.poc}
                  </div>
                </div>
                <div className="text-sm text-gray-500">{c.budget}</div>
              </div>

              <div className="mt-3 text-sm text-gray-600">{c.deliverables}</div>

              <div className="mt-3 flex items-center justify-between">
                <div className="w-2/3 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    style={{ width: `${c.progress}%` }}
                    className="h-2 bg-indigo-600"
                  />
                </div>
                <div className="text-xs text-gray-500 ml-3">{c.progress}%</div>
              </div>

              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1 bg-indigo-600 text-white rounded">
                  Open Brief
                </button>
                <button className="px-3 py-1 border rounded">
                  View Contracts
                </button>
                <button className="px-3 py-1 border rounded">Budget</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PaymentsView: React.FC = () => {
  const [tab, setTab] = useState<
    "Campaign Payments" | "Approvals" | "Dashboard"
  >("Campaign Payments");

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Payments</h2>

      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex gap-2">
          {["Campaign Payments", "Approvals", "Dashboard"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`px-3 py-2 rounded ${
                tab === t ? "bg-indigo-600 text-white" : "bg-gray-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "Campaign Payments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentsExample.map((p) => (
            <div
              key={p.id}
              className="bg-white p-4 rounded-lg shadow border flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-gray-500">{p.id}</div>
                <div className="text-sm text-gray-700 mt-1">
                  Amount: {p.amount}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-sm text-gray-500">{p.status}</div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-600 text-white rounded">
                    Approve
                  </button>
                  <button className="px-3 py-1 border rounded">Hold</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Approvals" && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">
            Payments awaiting approval
          </div>
          <div className="mt-3 space-y-2">
            {paymentsExample
              .filter((p) => p.status !== "Paid")
              .map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded border flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.amount}</div>
                  </div>
                  <div>
                    <button className="px-3 py-1 bg-green-600 text-white rounded">
                      Approve
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {tab === "Dashboard" && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded">
              Total Spend{" "}
              <div className="text-lg font-bold mt-1">₹10,50,000</div>
            </div>
            <div className="p-4 border rounded">
              Pending Payouts{" "}
              <div className="text-lg font-bold mt-1">₹2,80,000</div>
            </div>
            <div className="p-4 border rounded">
              Last Month <div className="text-lg font-bold mt-1">₹4,20,000</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OnboardingView: React.FC = () => {
  const [tab, setTab] = useState<"Invites" | "Verification" | "Resources">(
    "Invites"
  );
  const [inviteName, setInviteName] = useState("");
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Onboarding</h2>

      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex gap-2">
          {["Invites", "Verification", "Resources"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`px-3 py-2 rounded ${
                tab === t ? "bg-indigo-600 text-white" : "bg-gray-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "Invites" && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex gap-2 mb-3">
            <input
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Creator email or handle"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={() => {
                if (!inviteName.trim()) return alert("Enter name");
                alert(`Invite sent to ${inviteName} (demo)`);
                setInviteName("");
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Send Invite
            </button>
          </div>
          <div className="text-sm text-gray-500">Recent invites</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>invite@creator.co • Pending</li>
            <li>nisha@example.com • Accepted</li>
          </ul>
        </div>
      )}

      {tab === "Verification" && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Verification queue</div>
          <div className="mt-3 space-y-2">
            <div className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-medium">Ria Kapoor</div>
                <div className="text-xs text-gray-500">
                  Instagram • Submitted ID
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-green-600 text-white rounded">
                  Approve
                </button>
                <button className="px-3 py-1 border rounded">Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "Resources" && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">
            Onboarding resources & NDAs
          </div>
          <ul className="mt-3 space-y-2">
            <li>
              Creator Guidelines.pdf{" "}
              <button className="ml-3 text-indigo-600">View</button>
            </li>
            <li>
              NDA_Template.docx{" "}
              <button className="ml-3 text-indigo-600">Download</button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

const CampaignBriefsView: React.FC = () => {
  const [tab, setTab] = useState<
    "My Campaigns" | "Brief Creation" | "Deliverable Review"
  >("My Campaigns");

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Campaign Briefs</h2>

      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex gap-2">
          {["My Campaigns", "Brief Creation", "Deliverable Review"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`px-3 py-2 rounded ${
                tab === t ? "bg-indigo-600 text-white" : "bg-gray-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "My Campaigns" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {msCampaigns.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded-lg shadow border">
              <div className="font-semibold">{c.name}</div>
              <div className="text-xs text-gray-500">
                {c.id} • {c.poc}
              </div>
              <div className="mt-2 text-sm">{c.deliverables}</div>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1 bg-indigo-600 text-white rounded">
                  Edit Brief
                </button>
                <button className="px-3 py-1 border rounded">
                  Assign Creators
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Brief Creation" && (
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="text-sm text-gray-500">Campaign title</label>
          <input
            className="w-full p-2 border rounded mt-2"
            placeholder="e.g., Surface Pro - Launch"
          />
          <label className="text-sm text-gray-500 mt-3 block">
            Deliverables
          </label>
          <textarea
            className="w-full p-2 border rounded mt-2"
            rows={4}
            placeholder="List deliverables..."
          />
          <div className="mt-3">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded">
              Create Brief
            </button>
          </div>
        </div>
      )}

      {tab === "Deliverable Review" && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">
            Review submissions from creators
          </div>
          <div className="mt-3 space-y-2">
            <div className="p-3 border rounded">
              <div className="font-medium">Priya Sharma - Surface Draft</div>
              <div className="text-xs text-gray-500">Submitted 6h ago</div>
              <div className="mt-2 flex gap-2">
                <button className="px-3 py-1 bg-green-600 text-white rounded">
                  Approve
                </button>
                <button className="px-3 py-1 border rounded">
                  Request Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PerformanceView: React.FC = () => {
  // Simple mock metrics
  const metrics = {
    impressions: "1.2M",
    ctr: "3.2%",
    engagement: "6.1%",
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Performance</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500">Impressions</div>
          <div className="text-2xl font-bold mt-2">{metrics.impressions}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500">CTR</div>
          <div className="text-2xl font-bold mt-2">{metrics.ctr}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-sm text-gray-500">Engagement Rate</div>
          <div className="text-2xl font-bold mt-2">{metrics.engagement}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="font-semibold mb-2">Top campaigns (example)</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {msCampaigns.map((c) => (
            <div key={c.id} className="p-3 border rounded">
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-gray-500">{c.budget}</div>
              <div className="mt-2 text-sm">
                Impr: 200k • CTR: 3.4% • Eng: 5.8%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- Main MSUserApp Component ---------- */

const MSUserApp: React.FC<MSUserAppProps> = ({ initialRole, onRoleChange }) => {
  const [selectedModule, setSelectedModule] = useState<Module>("Dashboard");

  const renderSelected = () => {
    switch (selectedModule) {
      case "Dashboard":
        return <DashboardView />;
      case "Creator Directory":
        return <CreatorDirectoryView />;
      case "Communications":
        return <CommunicationsView />;
      case "Campaigns":
        return <CampaignsView />;
      case "Payments":
        return <PaymentsView />;
      case "Onboarding":
        return <OnboardingView />;
      case "Campaign Briefs":
        return <CampaignBriefsView />;
      case "Performance":
        return <PerformanceView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar selected={selectedModule} setSelected={setSelectedModule} />

      <div className="flex-1 flex flex-col">
        <Header
          roleLabel="Microsoft User"
          onBack={() => onRoleChange?.(null)}
        />

        <main className="flex-1 overflow-y-auto">{renderSelected()}</main>
      </div>
    </div>
  );
};

export default MSUserApp;
