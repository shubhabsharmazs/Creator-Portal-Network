import React, { useEffect, useState } from "react";
import "./index.css";

/* ---------------------------
   Types & Mock Data
---------------------------- */

type Role = "Creator" | "Microsoft User" | "Admin";

type CampaignStatusStage =
  | "Accepted"
  | "NDA Signed"
  | "Content Submitted"
  | "Content Approval"
  | "Content Posted";

type Campaign = {
  id: string;
  name: string;
  poc: string;
  timelineAgo: string;
  stage?: CampaignStatusStage;
  createdAt: number;
  brief: string;
  isBroadcast?: boolean;
  interested?: boolean;
  updateRequest?: { id: string; status: "In Process" | "Resolved"; note?: string } | null;
  paymentStatus?: "Under Process" | "Completed" | "Awaiting Approval" | "Paid";
};

type Ticket = {
  id: string;
  campaignId?: string;
  subject: string;
  status: "Initiated" | "Under Process" | "Resolved";
  messages: { from: "Creator" | "Support"; text: string; time: number }[];
  createdAt: number;
};

const now = Date.now();

const initialProfile = {
  name: "Rohit Sharma",
  phone: "+91 98765 43210",
  email: "rohit.creator@example.com",
  creatorType: "Lifestyle / Tech",
  bio: "Creator focused on tech reviews and lifestyle content.",
};

const seedCampaigns: Campaign[] = [
  {
    id: "CID-1001",
    name: "Autumn Fashion Drop",
    poc: "Priya Sharma",
    timelineAgo: "2 hours ago",
    stage: "Content Submitted",
    createdAt: now - 1000 * 60 * 60 * 2,
    brief: "Campaign to promote autumn capsule collection. Deliverables: 2 static posts + 1 reel. Use hashtag #AutumnDrop.",
    isBroadcast: false,
    paymentStatus: "Under Process",
  },
  {
    id: "CID-1002",
    name: "Eco Gadget Review",
    poc: "Aman Verma",
    timelineAgo: "1 day ago",
    stage: "Accepted",
    createdAt: now - 1000 * 60 * 60 * 24,
    brief: "Review a sustainable gadget. Deliverables: 1 unboxing + 1 tutorial video. Focus on eco benefits.",
    isBroadcast: false,
    paymentStatus: "Awaiting Approval",
    updateRequest: { id: "UR-101", status: "In Process", note: "Change thumbnail frame" },
  },
  {
    id: "CID-1004",
    name: "Smart Home Launch",
    poc: "Sonal Gupta",
    timelineAgo: "10 days ago",
    stage: "Content Posted",
    createdAt: now - 1000 * 60 * 60 * 24 * 10,
    brief: "Smart home device launch. Deliverable posted. Link to performance dashboard included.",
    isBroadcast: false,
    paymentStatus: "Paid",
  },
];

/* ---------------------------
   Helpers
---------------------------- */

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ---------------------------
   Campaign Card
---------------------------- */

const CampaignCard: React.FC<{ c: Campaign; onOpenBrief: (c: Campaign) => void; onViewProgress: (c: Campaign) => void }> = ({ c, onOpenBrief, onViewProgress }) => (
  <div className="min-w-[300px] bg-white rounded-2xl p-4 shadow-lg border hover:shadow-2xl transition">
    <div className="flex justify-between items-start">
      <div>
        <div className="font-semibold">{c.name}</div>
        <div className="text-xs text-gray-500">{c.id} • {c.poc}</div>
      </div>
      <div className="text-sm text-gray-500">{c.timelineAgo}</div>
    </div>
    <div className="mt-2 text-sm text-gray-600">{c.brief.slice(0, 100)}{c.brief.length > 100 ? "..." : ""}</div>
    <div className="mt-2 flex gap-2">
      <div className={`text-xs px-2 py-1 rounded ${c.stage ? "bg-indigo-50 text-indigo-700" : "bg-gray-100 text-gray-700"}`}>
        {c.stage ?? "Invite"}
      </div>
      {c.updateRequest && (
        <div className={`text-xs px-2 py-1 rounded ${c.updateRequest.status === "In Process" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
          {c.updateRequest.status}
        </div>
      )}
    </div>
    <div className="mt-3 flex gap-2">
      <button onClick={() => onOpenBrief(c)} className="px-3 py-1 bg-indigo-600 text-white rounded">Open Brief</button>
      <button onClick={() => onViewProgress(c)} className="px-3 py-1 border rounded">View Progress</button>
    </div>
  </div>
);

/* ---------------------------
   Payment Card
---------------------------- */

const PaymentCard: React.FC<{ c: Campaign; onRaiseTicket: (campaignId?: string) => void }> = ({ c, onRaiseTicket }) => (
  <div className="min-w-[300px] bg-white rounded-2xl p-4 shadow-lg border hover:shadow-2xl transition">
    <div className="flex justify-between items-start">
      <div>
        <div className="font-semibold">{c.name}</div>
        <div className="text-xs text-gray-500">{c.id} • {c.poc}</div>
      </div>
      <div className="text-sm text-gray-500">{c.timelineAgo}</div>
    </div>
    <div className="mt-2 text-sm text-gray-600">Payment Status: <span className="font-medium">{c.paymentStatus ?? "N/A"}</span></div>
    <div className="mt-3 flex gap-2">
      <button onClick={() => onRaiseTicket(c.id)} className="px-3 py-1 bg-red-50 text-red-700 rounded">Raise Ticket</button>
      <button onClick={() => alert(`View payment details for ${c.id}`)} className="px-3 py-1 border rounded">View Details</button>
    </div>
  </div>
);

/* ---------------------------
   Main App
---------------------------- */

export default function App() {
  const [role, setRole] = useState<Role>("Creator");
  const [selectedModule, setSelectedModule] = useState<string>("Campaigns & Contracts");
  const [campaigns, setCampaigns] = useState<Campaign[]>(seedCampaigns);
  const [chatSearch, setChatSearch] = useState("");
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("All");

  const openBrief = (c: Campaign) => alert(`Brief for ${c.id}:\n\n${c.brief}`);
  const viewProgress = (c: Campaign) => alert(`Progress for ${c.id}: ${c.stage ?? "Not started"}`);
  const raiseTicket = (id?: string) => alert(`Raised ticket for ${id ?? "general"}`);

  const filteredCampaigns = campaigns.filter(c =>
    c.name.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const filteredPayments = campaigns.filter(c => {
    let matchesSearch = c.name.toLowerCase().includes(paymentSearch.toLowerCase());
    let matchesFilter = paymentFilter === "All" || c.paymentStatus === paymentFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="h-16 bg-indigo-600 text-white flex items-center justify-between px-6">
        <div className="text-lg font-semibold">Creator Portal</div>
        <div>{role}</div>
      </header>

      <div className="flex flex-1">
        <aside className="w-80 bg-white border-r p-4">
          <div className="font-semibold mb-2">Module</div>
          <button className="w-full text-left px-3 py-2 mb-2 bg-indigo-50 rounded">Campaigns & Contracts</button>
        </aside>

        <main className="flex-1
