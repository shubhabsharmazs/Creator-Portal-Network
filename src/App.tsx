import React, { useEffect, useMemo, useState } from "react";
// Since this is a single file, we'll use inline CSS or Tailwind classes.
// Assuming Tailwind is available in the environment.

/**
Updated Creator Portal - App.jsx
- MODIFIED: Campaigns & Contracts sidebar options consolidated to "Overview".
- MODIFIED: Campaigns & Contracts page now shows four individual, horizontally-scrolling card strips.
- NEW: Each card strip now has its own local Search bar and a Filter by Status dropdown.
*/

/* --------------------------- Types & Mock Data --------------------------- */
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
  updateRequest?: {
    id: string;
    status: "In Process" | "Resolved";
    note?: string;
  } | null;
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

type PaymentInfo = {
    account: string;
    ifsc: string;
    taxDocument: string;
};

const now = Date.now();

const initialProfile = {
  name: "Rohit Sharma",
  phone: "+91 98765 43210",
  email: "rohit.creator@example.com",
  creatorType: "Lifestyle / Tech",
  bio: "Creator focused on tech reviews and lifestyle content.",
};

const initialSocials = {
  instagram: { handle: "@rohit_ig", verified: false },
  facebook: { handle: "Rohit FB", verified: false },
  threads: { handle: "@rohit_threads" },
  tiktok: { handle: "@rohit_tt" },
};

const seedCampaigns: Campaign[] = [
  {
    id: "CID-1001",
    name: "Autumn Fashion Drop",
    poc: "Priya Sharma",
    timelineAgo: "2 hours ago",
    stage: "Content Submitted", // Under Review
    createdAt: now - 1000 * 60 * 60 * 2,
    brief:
      "Campaign to promote autumn capsule collection. Deliverables: 2 static posts + 1 reel. Use hashtag #AutumnDrop.",
    isBroadcast: false,
    paymentStatus: "Under Process",
  },
  {
    id: "CID-1002",
    name: "Eco Gadget Review",
    poc: "Aman Verma",
    timelineAgo: "1 day ago",
    stage: "Accepted", // Under Review
    createdAt: now - 1000 * 60 * 60 * 24,
    brief:
      "Review a sustainable gadget. Deliverables: 1 unboxing + 1 tutorial video. Focus on eco benefits.",
    isBroadcast: false,
    paymentStatus: "Awaiting Approval",
    updateRequest: { id: "UR-101", status: "In Process", note: "Change thumbnail frame" }, // Update Request (Relevant to Update Requests strip)
  },
  {
    id: "CID-1003",
    name: "Winter Skincare Invite",
    poc: "Campaign Team",
    timelineAgo: "3 hours ago",
    stage: undefined, // Available (New Invite)
    createdAt: now - 1000 * 60 * 60 * 3,
    brief: "Open invitation: Winter skincare line. Creators can accept the invite.",
    isBroadcast: false,
  },
  {
    id: "CID-1004",
    name: "Smart Home Launch",
    poc: "Sonal Gupta",
    timelineAgo: "10 days ago",
    stage: "Content Posted", // Completed
    createdAt: now - 1000 * 60 * 60 * 24 * 10,
    brief:
      "Smart home device launch. Deliverable posted. Link to performance dashboard included.",
    isBroadcast: false,
    paymentStatus: "Paid",
  },
  {
    id: "CID-1005",
    name: "New Phone Promo",
    poc: "Zoe Krishnan",
    timelineAgo: "3 days ago",
    stage: "NDA Signed", // Under Review
    createdAt: now - 1000 * 60 * 60 * 24 * 3,
    brief:
      "Exclusive phone review. Contract signed, waiting for product delivery.",
    isBroadcast: false,
    paymentStatus: "Under Process",
  },
  {
    id: "CID-1006",
    name: "Travel Vlog Series",
    poc: "Campaign Team",
    timelineAgo: "5 hours ago",
    stage: undefined, // Available (Broadcast example)
    createdAt: now - 1000 * 60 * 60 * 5,
    brief: "New Broadcast: Submit your travel ideas for a potential series!",
    isBroadcast: true,
  },
  {
    id: "CID-1007",
    name: "Summer Drink Ad",
    poc: "Raj Patel",
    timelineAgo: "1 day ago",
    stage: "Content Approval", // Under Review
    createdAt: now - 1000 * 60 * 60 * 24,
    brief: "Ad video submitted. Waiting for final client approval.",
    isBroadcast: false,
    paymentStatus: "Awaiting Approval",
    updateRequest: { id: "UR-102", status: "Resolved", note: "Need to change music." }, // Update Request (Relevant to Update Requests strip)
  },
];

const seedTickets: Ticket[] = [
  {
    id: "T-001",
    campaignId: "CID-1004",
    subject: "Payment delayed — Smart Home Launch",
    status: "Under Process",
    messages: [
      { from: "Creator", text: "Payment not received yet for CID-1004", time: now - 1000 * 60 * 60 * 24 },
      { from: "Support", text: "Escalated to finance. Checking.", time: now - 1000 * 60 * 60 * 20 },
    ],
    createdAt: now - 1000 * 60 * 60 * 24,
  },
  {
    id: "T-002",
    campaignId: "CID-1001",
    subject: "Request for asset change",
    status: "Resolved",
    messages: [
      { from: "Creator", text: "Need clarification on logo placement.", time: now - 1000 * 60 * 60 * 10 },
      { from: "Support", text: "Updated brief and shared assets.", time: now - 1000 * 60 * 60 * 9 },
    ],
    createdAt: now - 1000 * 60 * 60 * 10,
  },
];

/* --------------------------- Helpers --------------------------- */
function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Helper function to check if a campaign matches the search term
const matchesSearch = (c: Campaign, search: string) => {
    if (!search) return true;
    const lowerSearch = search.toLowerCase();
    return (
        c.name.toLowerCase().includes(lowerSearch) ||
        c.id.toLowerCase().includes(lowerSearch) ||
        c.brief.toLowerCase().includes(lowerSearch)
    );
}

/* --------------------------- UI: Header & Sidebar --------------------------- */
const Header: React.FC<{ role: Role }> = ({ role }) => {
  return (
    <header className="h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="bg-white/30 rounded-full h-10 w-10 flex items-center justify-center font-bold">CP</div>
        <div>
          <div className="text-lg font-semibold">Creator Portal</div>
          <div className="text-xs opacity-90">Creator view</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm opacity-90">Signed in as</div>
        <div className="bg-white/10 px-3 py-1 rounded">{role}</div>
        <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">RS</div>
      </div>
    </header>
  );
};

const Sidebar: React.FC<{
  modules: string[];
  selected: string;
  onSelect: (m: string) => void;
  subitems: Record<string, string[]>;
  selectedSub: string;
  onSelectSub: (s: string) => void;
  role: Role;
  setRole: (r: Role) => void;
}> = ({ modules, selected, onSelect, subitems, selectedSub, onSelectSub, role, setRole }) => {
  return (
    <aside className="w-80 bg-white border-r min-h-screen">
      <div className="p-4 border-b">
        <div className="text-lg font-semibold text-gray-700">Portal Module</div>
        <div className="mt-3">
          <select
            className="w-full border rounded px-2 py-1"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option>Creator</option>
            <option>Microsoft User</option>
            <option>Admin</option>
          </select>
        </div>
      </div>

      <nav className="p-4">
        {modules.map((m) => (
          <div key={m} className="mb-3">
            <button
              onClick={() => onSelect(m)}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
                selected === m ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700" : "text-gray-800 hover:bg-gray-100"
              }`}
            >
              {m}
            </button>
            {selected === m && subitems[m]?.length > 0 && (
              <div className="mt-2 pl-4">
                {subitems[m].map((s) => (
                  <button
                    key={s}
                    onClick={() => onSelectSub(s)}
                    className={`block w-full text-left px-3 py-1 rounded mb-1 text-sm ${
                      selectedSub === s ? "bg-indigo-100 text-indigo-800 font-semibold" : "hover:bg-gray-100 text-gray-700"
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
};

/* --------------------------- Creator Directory components --------------------------- */
const ProfileSection: React.FC<{
  profile: typeof initialProfile;
  onSaveSection: (section: string, newData: Partial<typeof initialProfile>) => void;
}> = ({ profile, onSaveSection }) => {
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [local, setLocal] = useState(profile);

  useEffect(() => setLocal(profile), [profile]);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Contact & Basic Info</h3>
          <div>
            <button
              onClick={() => setEditing((s) => ({ ...s, contact: !s.contact }))}
              className="text-sm px-3 py-1 rounded bg-indigo-50 text-indigo-700"
            >
              {editing.contact ? "Cancel" : "Edit"}
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Name</label>
            <div className="mt-1 p-2 border rounded bg-gray-50">{profile.name}</div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Email</label>
            <div className="mt-1 p-2 border rounded bg-gray-50">{profile.email}</div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Phone</label>
            {editing.contact ? (
              <input
                value={local.phone}
                onChange={(e) => setLocal((l) => ({ ...l, phone: e.target.value }))}
                className="mt-1 p-2 border rounded w-full"
              />
            ) : (
              <div className="mt-1 p-2 border rounded bg-gray-50">{profile.phone}</div>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Creator Type</label>
            {editing.contact ? (
              <input
                value={local.creatorType}
                onChange={(e) => setLocal((l) => ({ ...l, creatorType: e.target.value }))}
                className="mt-1 p-2 border rounded w-full"
              />
            ) : (
              <div className="mt-1 p-2 border rounded bg-gray-50">{profile.creatorType}</div>
            )}
          </div>
        </div>
        {editing.contact && (
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => {
                setLocal(profile);
                setEditing((s) => ({ ...s, contact: false }));
              }}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSaveSection("contact", { phone: local.phone, creatorType: local.creatorType });
                setEditing((s) => ({ ...s, contact: false }));
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Save
            </button>
          </div>
        )}
      </div>
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Bio / About</h3>
          <div>
            <button
              onClick={() => setEditing((s) => ({ ...s, bio: !s.bio }))}
              className="text-sm px-3 py-1 rounded bg-indigo-50 text-indigo-700"
            >
              {editing.bio ? "Cancel" : "Edit"}
            </button>
          </div>
        </div>
        {editing.bio ? (
          <>
            <textarea
              value={local.bio}
              onChange={(e) => setLocal((l) => ({ ...l, bio: e.target.value }))}
              className="mt-3 p-3 border rounded w-full"
              rows={4}
            />
            <div className="mt-3 flex justify-end gap-3">
              <button
                onClick={() => {
                  setLocal(profile);
                  setEditing((s) => ({ ...s, bio: false }));
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSaveSection("bio", { bio: local.bio });
                  setEditing((s) => ({ ...s, bio: false }));
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </>
        ) : (
          <p className="mt-3 text-gray-700">{profile.bio}</p>
        )}
      </div>
    </div>
  );
};

const SocialLinks: React.FC<{ socials: typeof initialSocials; onUpdate: (s: typeof initialSocials) => void }> = ({
  socials,
  onUpdate,
}) => {
  const [local, setLocal] = useState(socials);
  useEffect(() => setLocal(socials), [socials]);

  const verifyInstagram = () => {
    // Replaced window.confirm with a mock alert
    alert("Simulating Instagram verification: connecting @instagram...");
    setLocal((l) => ({ ...l, instagram: { ...l.instagram, verified: true } }));
    onUpdate({ ...local, instagram: { ...local.instagram, verified: true } });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Social Media Links</h3>
          <div className="text-sm text-gray-500">Add / verify handles</div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Instagram</label>
            <div className="flex items-center gap-2 mt-2">
              <input
                className="p-2 border rounded w-full"
                value={local.instagram.handle}
                onChange={(e) => setLocal((l) => ({ ...l, instagram: { ...l.instagram, handle: e.target.value } }))}
              />
              <button onClick={verifyInstagram} className="px-3 py-2 bg-amber-400 rounded text-white text-sm">
                {local.instagram.verified ? "Verified" : "Verify"}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Facebook</label>
            <input
              className="mt-2 p-2 border rounded w-full"
              value={local.facebook.handle}
              onChange={(e) => setLocal((l) => ({ ...l, facebook: { ...l.facebook, handle: e.target.value } }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Threads</label>
            <input
              className="mt-2 p-2 border rounded w-full"
              value={local.threads.handle}
              onChange={(e) => setLocal((l) => ({ ...l, threads: { ...l.threads, handle: e.target.value } }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">TikTok</label>
            <input
              className="mt-2 p-2 border rounded w-full"
              value={local.tiktok.handle}
              onChange={(e) => setLocal((l) => ({ ...l, tiktok: { ...l.tiktok, handle: e.target.value } }))}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => {
              setLocal(socials);
            }}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onUpdate(local);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Save Links
          </button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------- Campaign & Payments Card Components --------------------------- */
const CampaignCard: React.FC<{
  c: Campaign;
  onOpenBrief: (c: Campaign) => void;
  onViewProgress: (c: Campaign) => void;
}> = ({ c, onOpenBrief, onViewProgress }) => {
  const getStageColor = (stage?: CampaignStatusStage) => {
    switch (stage) {
      case "Content Posted":
        return "bg-green-100 text-green-800";
      case "NDA Signed":
      case "Accepted":
      case "Content Submitted":
      case "Content Approval":
        return "bg-purple-100 text-purple-800";
      default:
        return c.isBroadcast ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700";
    }
  };

  const getStageText = (c: Campaign) => {
    if (c.updateRequest && c.updateRequest.status === 'In Process') {
        return "Update Required";
    }
    return c.stage ?? (c.isBroadcast ? "Available - Broadcast" : "Available - New Invite");
  }

  return (
    <div className="min-w-[340px] bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-2xl transition duration-300">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-lg">{c.name}</div>
          <div className="text-xs text-gray-500">{c.id} • {c.poc}</div>
        </div>
        <div className="text-sm text-gray-500">{c.timelineAgo}</div>
      </div>

      <div className="mt-3">
        <div className="text-sm text-gray-600">
          {c.brief.slice(0, 120)}{c.brief.length > 120 ? "..." : ""}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div
          className={`text-xs px-2 py-1 rounded-full font-medium ${getStageColor(c.stage)}`}
        >
          {getStageText(c)}
        </div>
        {c.updateRequest && (
          <div
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              c.updateRequest.status === "In Process" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            }`}
            title={c.updateRequest.note}
          >
            Request Status: {c.updateRequest.status}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={() => onOpenBrief(c)} className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          Open Brief
        </button>
        <button onClick={() => onViewProgress(c)} className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
          View Progress
        </button>
      </div>
    </div>
  );
};

// CampaignStrip Component (Now handles local search and filter)
const CampaignStrip: React.FC<{ 
    title: string; 
    campaigns: Campaign[]; 
    onOpenBrief: (c: Campaign) => void; 
    onViewProgress: (c: Campaign) => void;
    search: string;
    setSearch: (s: string) => void;
    filter: string;
    setFilter: (f: string) => void;
    filterOptions: string[];
    filterKey: "stage" | "updateRequest" | "type"; // Logic key for filtering
}> = ({
    title,
    campaigns,
    onOpenBrief,
    onViewProgress,
    search,
    setSearch,
    filter,
    setFilter,
    filterOptions,
    filterKey,
}) => {
    // Local filtering based on search and filter state
    const filteredCampaigns = useMemo(() => {
        let list = campaigns;
        
        // 1. Search Filter (applies to all)
        if (search) {
            list = list.filter(c => matchesSearch(c, search));
        }

        // 2. Status/Type Filter
        if (filter !== "All" && filterOptions.length > 1) {
            list = list.filter(c => {
                if (filterKey === "stage") {
                    return c.stage === filter;
                }
                if (filterKey === "type") {
                    if (filter === "Broadcast") return !!c.isBroadcast;
                    if (filter === "New Invite") return !c.isBroadcast && !c.stage;
                }
                if (filterKey === "updateRequest") {
                    // Update Request Strip logic: only shows campaigns with an updateRequest
                    if (!c.updateRequest) return false;
                    if (filter === "In Process") return c.updateRequest.status === "In Process";
                    if (filter === "Resolved") return c.updateRequest.status === "Resolved";
                }
                return true;
            });
        }
        return list;
    }, [campaigns, search, filter, filterKey, filterOptions]);

    return (
        <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3 border-b pb-3">
                <h4 className="font-bold text-xl text-indigo-700">{title} ({filteredCampaigns.length})</h4>

                <div className="flex gap-3 items-center">
                    {filterOptions.length > 1 && (
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-indigo-500"
                        >
                            {filterOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    )}
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search strip..."
                        className="p-2 border border-gray-300 rounded-lg w-48 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-50">
                {filteredCampaigns.length > 0 ? (
                    filteredCampaigns.map((c) => (
                        <CampaignCard key={c.id} c={c} onOpenBrief={onOpenBrief} onViewProgress={onViewProgress} />
                    ))
                ) : (
                    <div className="text-gray-500 p-4 text-center w-full min-w-[340px]">No campaigns found in this view based on your filters.</div>
                )}
            </div>
        </div>
    );
};

const PaymentCard: React.FC<{ c: Campaign; onRaiseTicket: (campaignId?: string) => void }> = ({
  c,
  onRaiseTicket,
}) => {
  const getPaymentColor = (status?: Campaign['paymentStatus']) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "Under Process":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Awaiting Approval":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div
      className={`min-w-[320px] bg-white rounded-2xl p-4 shadow-lg border ${getPaymentColor(c.paymentStatus)} hover:shadow-2xl transition duration-300`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold">{c.name}</div>
          <div className="text-xs text-gray-500">{c.id} • {c.poc}</div>
        </div>
        <div className="text-sm text-gray-500">{c.timelineAgo}</div>
      </div>

      <div className="mt-3 text-sm text-gray-600">
        Payment Status: <span className="font-medium text-lg">{c.paymentStatus ?? "N/A"}</span>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onRaiseTicket(c.id)}
          className="px-3 py-1 bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100 transition"
        >
          Raise Ticket
        </button>
        <button
          onClick={() => alert(`View payment details for ${c.id}`)}
          className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

/* --------------------------- Payments: Payment Info Section --------------------------- */

const PaymentInfoSection: React.FC<{ paymentInfo: PaymentInfo; onSave: (p: PaymentInfo) => void }> = ({ paymentInfo, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localInfo, setLocalInfo] = useState(paymentInfo);

    useEffect(() => setLocalInfo(paymentInfo), [paymentInfo]);

    const handleSave = () => {
        onSave(localInfo);
        setIsEditing(false);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-xl border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-indigo-700">Payment Information</h3>
                <button
                    onClick={() => {
                        if (isEditing) setLocalInfo(paymentInfo); // Cancel changes
                        setIsEditing(!isEditing);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition ${isEditing ? "bg-gray-200 text-gray-700" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                >
                    {isEditing ? "Cancel" : "Edit"}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 block">Bank Account Number</label>
                    {isEditing ? (
                        <input
                            value={localInfo.account}
                            onChange={(e) => setLocalInfo({ ...localInfo, account: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:ring-indigo-500"
                        />
                    ) : (
                        <div className="text-lg font-mono p-2 bg-gray-50 rounded-lg border">{paymentInfo.account}</div>
                    )}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 block">IFSC Code</label>
                    {isEditing ? (
                        <input
                            value={localInfo.ifsc}
                            onChange={(e) => setLocalInfo({ ...localInfo, ifsc: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:ring-indigo-500"
                        />
                    ) : (
                        <div className="text-lg font-mono p-2 bg-gray-50 rounded-lg border">{paymentInfo.ifsc}</div>
                    )}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 block">Tax Document</label>
                    {isEditing ? (
                        <input
                            value={localInfo.taxDocument}
                            onChange={(e) => setLocalInfo({ ...localInfo, taxDocument: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:ring-indigo-500"
                        />
                    ) : (
                        <div className="text-lg font-mono p-2 bg-gray-50 rounded-lg border text-indigo-600 cursor-pointer hover:underline" onClick={() => alert("Simulating download for: " + paymentInfo.taxDocument)}>{paymentInfo.taxDocument}</div>
                    )}
                </div>
            </div>

            {isEditing && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};


/* --------------------------- Main App --------------------------- */
export default function App() {
  const [role, setRole] = useState<Role>("Creator");

  // Updated Subitems for Campaigns & Contracts: Now only one main item
  const modules = ["Creator Directory", "Communication", "Campaigns & Contracts", "Payments", "Performance"];
  const subitems: Record<string, string[]> = {
    "Creator Directory": ["View / Update Profile", "Add Social Media Links"],
    Communication: ["Campaign Chat", "Notifications", "Broadcast"],
    "Campaigns & Contracts": ["Overview"], // MODIFIED: Simplified to one sub-item
    Payments: ["All Payments & Tickets"],
    Performance: ["Post Engagement", "Contracts", "Payments"],
  };

  const [selectedModule, setSelectedModule] = useState<string>("Creator Directory");
  const [selectedSub, setSelectedSub] = useState<string>("View / Update Profile"); 

  const [profile, setProfile] = useState(initialProfile);
  const [socials, setSocials] = useState(initialSocials);
  const [campaigns, setCampaigns] = useState<Campaign[]>(seedCampaigns);
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets);
  
  // NEW STATES FOR PER-STRIP SEARCH AND FILTER
  const [underReviewSearch, setUnderReviewSearch] = useState("");
  const [underReviewFilter, setUnderReviewFilter] = useState("All");

  const [availableSearch, setAvailableSearch] = useState("");
  const [availableFilter, setAvailableFilter] = useState("All");

  const [updateRequestSearch, setUpdateRequestSearch] = useState("");
  const [updateRequestFilter, setUpdateRequestFilter] = useState("In Process"); 

  const [completedSearch, setCompletedSearch] = useState("");
  const [completedFilter, setCompletedFilter] = useState("All");
  
  // States for filtering and searching (Payments only)
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("All"); // All, Under Process, Completed, Awaiting Approval, Paid

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    account: "XXXXXXXXXXXX1234",
    ifsc: "HDFC0001234",
    taxDocument: "PAN.pdf",
  });

  // Chat state
  const [openChatCampaign, setOpenChatCampaign] = useState<Campaign | null>(null);
  const [chatMessages, setChatMessages] = useState<
    { from: "Creator" | "User"; text: string; time: number }[]
  >([
    { from: "User", text: "Welcome! Please upload your draft.", time: now - 1000 * 60 * 60 * 5 },
  ]);
  const [chatSearch, setChatSearch] = useState("");

  useEffect(() => {
      // Ensure a valid subitem is selected when module changes
      if (!subitems[selectedModule].includes(selectedSub)) {
          setSelectedSub(subitems[selectedModule][0]);
      }
  }, [selectedModule, selectedSub, subitems]);

  const saveProfileSection = (section: string, data: Partial<typeof initialProfile>) => {
    setProfile((p) => ({ ...p, ...data }));
  };

  const updateSocials = (s: typeof initialSocials) => {
    setSocials(s);
  };

  const openChat = (c: Campaign) => {
    setOpenChatCampaign(c);
    setChatMessages([
      { from: "User", text: `Chat opened for ${c.id}`, time: Date.now() },
    ]);
  };

  const sendChat = (text: string) => {
    setChatMessages((m) => [...m, { from: "Creator", text, time: Date.now() }]);
  };

  const respondBroadcast = (id: string, interested: boolean) => {
    setCampaigns((cs) => cs.map((c) => (c.id === id ? { ...c, interested } : c)));
    alert(`You marked ${interested ? "Interested" : "Not Interested"} for ${id}`);
  };

  const openBrief = (c: Campaign) => {
    setSelectedModule("Campaigns & Contracts");
    // This alert simulates opening a brief modal/page
    setTimeout(() => alert(`Brief for ${c.id}:\n\n${c.brief}`), 200);
  };

  const viewProgress = (c: Campaign) => {
    alert(`Progress for ${c.id}: ${c.stage ?? "Not started"}`);
  };

  const raiseTicket = (campaignId?: string) => {
    const ticketId = `T-${Math.floor(Math.random() * 900 + 100)}`;
    const newTicket: Ticket = {
      id: ticketId,
      campaignId,
      subject: campaignId ? `Payment issue for ${campaignId}` : "General Payment Issue",
      status: "Initiated",
      messages: [
        { from: "Creator", text: `Raised ticket for ${campaignId ?? "general"}`, time: Date.now() },
      ],
      createdAt: Date.now(),
    };
    setTickets((t) => [newTicket, ...t]);
    alert(`Ticket ${ticketId} created`);
  };

  const addMessageToTicket = (ticketId: string, text: string) => {
    setTickets((ts) =>
      ts.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              messages: [
                ...t.messages,
                { from: "Creator", text, time: Date.now() },
              ],
              status: "Under Process",
            }
          : t
      )
    );
  };

  const onSavePaymentInfo = (p: PaymentInfo) => {
    setPaymentInfo(p);
    alert("Payment info saved (local)");
  };

  const onSendChatMessage = (text: string) => {
    sendChat(text);
  };

  const onOpenCampaignPerf = (campaignId: string) => {
    setSelectedModule("Performance");
    setSelectedSub("Post Engagement");
    setTimeout(() => alert(`Opening performance for ${campaignId}`), 200);
  };


  // --- Campaign Filtering Logic for Chat/Communication Module ---
  const filteredCampaigns = useMemo(() => {
    // This is primarily for the Communication module's Chat list
    if (selectedModule === "Communication" && selectedSub === "Campaign Chat") {
        const searchLower = chatSearch.toLowerCase();
        return campaigns.filter(
            (c) =>
                c.name.toLowerCase().includes(searchLower) ||
                c.id.toLowerCase().includes(searchLower)
        );
    }
    return campaigns; // Fallback, though not strictly needed elsewhere now
  }, [campaigns, selectedModule, selectedSub, chatSearch]);

  // --- Payment Filtering Logic (useMemo) ---
  const filteredPayments = useMemo(() => {
    let payments = campaigns.filter(c => c.paymentStatus); // Only campaigns that have a payment status

    const searchLower = paymentSearch.toLowerCase();

    // 1. Filter by Status
    if (paymentStatusFilter !== "All") {
        payments = payments.filter(c => c.paymentStatus === paymentStatusFilter);
    }

    // 2. Filter by Search term
    if (paymentSearch) {
        payments = payments.filter(
            (c) =>
                c.name.toLowerCase().includes(searchLower) ||
                c.id.toLowerCase().includes(searchLower) ||
                c.poc.toLowerCase().includes(searchLower)
        );
    }

    return payments;
  }, [campaigns, paymentSearch, paymentStatusFilter]);

  /* --------------------------- Render content per selected module/sub --------------------------- */
  const renderContent = () => {
    switch (selectedModule) {
      case "Creator Directory":
        if (selectedSub === "View / Update Profile" || selectedSub === "Add Social Media Links") {
          return (
            <div className="space-y-4">
              <ProfileSection profile={profile} onSaveSection={saveProfileSection} />
              <SocialLinks socials={socials} onUpdate={updateSocials} />
            </div>
          );
        }
        break;

      case "Communication":
        if (selectedSub === "Campaign Chat") {
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  placeholder="Search campaigns by name or id to chat"
                  className="p-2 border rounded flex-1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1">
                  <CampaignChatList campaigns={filteredCampaigns} onOpenChat={openChat} search={chatSearch} />
                </div>
                <div className="col-span-2">
                  {openChatCampaign ? (
                    <ChatWindow
                      campaign={openChatCampaign}
                      messages={chatMessages}
                      onSend={onSendChatMessage}
                      onClose={() => setOpenChatCampaign(null)}
                    />
                  ) : (
                    <div className="p-6 bg-white rounded-lg shadow">Select a campaign to open chat</div>
                  )}
                </div>
              </div>
            </div>
          );
        }
        if (selectedSub === "Notifications") {
            return (
                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-lg shadow">
                    <div className="font-semibold">Notifications</div>
                    <ul className="mt-2 text-sm text-gray-700 space-y-2">
                      <li>
                        <button className="text-left w-full" onClick={() => { setSelectedModule("Campaigns & Contracts"); setSelectedSub("Overview"); }}>
                          • You have been invited to CID-1005 — NDA signed.
                        </button>
                      </li>
                      <li>• Payment received for CID-1004 — view payment status</li>
                      <li>• Ticket T-001 updated — check resolution</li>
                    </ul>
                  </div>
                </div>
              );
        }
        if (selectedSub === "Broadcast") {
            return <BroadcastList campaigns={campaigns} onRespond={respondBroadcast} />;
        }
        break;

      case "Campaigns & Contracts":
        // Define the base lists before per-strip filtering/searching
        const baseUnderReview = campaigns.filter(c => 
            c.stage === "Accepted" || 
            c.stage === "NDA Signed" || 
            c.stage === "Content Submitted" || 
            c.stage === "Content Approval"
        );
        
        const baseAvailable = campaigns.filter(c => 
            c.isBroadcast || (!c.stage && !c.interested)
        );
        
        const baseUpdateRequests = campaigns.filter(c => 
            !!c.updateRequest
        ); 

        const baseCompleted = campaigns.filter(c => 
            c.stage === "Content Posted"
        );
        
        const underReviewOptions = ["All", "Accepted", "NDA Signed", "Content Submitted", "Content Approval"];
        const availableOptions = ["All", "Broadcast", "New Invite"];
        const updateRequestOptions = ["In Process", "Resolved"]; 
        const completedOptions = ["All", "Content Posted"];

        
        return (
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">Campaigns & Contracts Overview</h3>
            
            {/* Under Review & Contract Signing */}
            <CampaignStrip 
                title="Under Review & Contract Signing" 
                campaigns={baseUnderReview} 
                onOpenBrief={openBrief} 
                onViewProgress={viewProgress} 
                search={underReviewSearch}
                setSearch={setUnderReviewSearch}
                filter={underReviewFilter}
                setFilter={setUnderReviewFilter}
                filterOptions={underReviewOptions}
                filterKey="stage"
            />
            
            {/* Available & New Opportunities */}
            <CampaignStrip 
                title="Available & New Opportunities" 
                campaigns={baseAvailable} 
                onOpenBrief={openBrief} 
                onViewProgress={viewProgress} 
                search={availableSearch}
                setSearch={setAvailableSearch}
                filter={availableFilter}
                setFilter={setAvailableFilter}
                filterOptions={availableOptions}
                filterKey="type"
            />
            
            {/* Update Requests */}
            <CampaignStrip 
                title="Update Requests" 
                campaigns={baseUpdateRequests} 
                onOpenBrief={openBrief} 
                onViewProgress={viewProgress} 
                search={updateRequestSearch}
                setSearch={setUpdateRequestSearch}
                filter={updateRequestFilter}
                setFilter={setUpdateRequestFilter}
                filterOptions={updateRequestOptions}
                filterKey="updateRequest"
            />
            
            {/* Completed & Posted */}
            <CampaignStrip 
                title="Completed & Posted" 
                campaigns={baseCompleted} 
                onOpenBrief={openBrief} 
                onViewProgress={viewProgress} 
                search={completedSearch}
                setSearch={setCompletedSearch}
                filter={completedFilter}
                setFilter={setCompletedFilter}
                filterOptions={completedOptions}
                filterKey="stage"
            />
          </div>
        );

      case "Payments":
        return (
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-gray-800">Payment & Invoicing</h3>
            
            {/* 1. Payment Information Section */}
            <PaymentInfoSection paymentInfo={paymentInfo} onSave={onSavePaymentInfo} />

            {/* 2. Payment Status Card Strip with Search & Filter */}
            <div className="bg-white rounded-lg shadow-xl p-6 border border-indigo-100">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-lg text-gray-800">Payment Status Cards ({filteredPayments.length})</h4>
                    <div className="flex gap-3">
                        <select
                            value={paymentStatusFilter}
                            onChange={(e) => setPaymentStatusFilter(e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                        >
                            <option value="All">Filter by Status (All)</option>
                            <option value="Under Process">Under Process</option>
                            <option value="Awaiting Approval">Awaiting Approval</option>
                            <option value="Completed">Completed</option>
                            <option value="Paid">Paid</option>
                        </select>
                        <input
                            value={paymentSearch}
                            onChange={(e) => setPaymentSearch(e.target.value)}
                            placeholder="Search payments (Name/ID)"
                            className="p-2 border border-gray-300 rounded-lg w-64 text-sm"
                        />
                    </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-50">
                    {filteredPayments.length > 0 ? (
                        filteredPayments.map((c) => (
                            <PaymentCard key={c.id} c={c} onRaiseTicket={(id) => raiseTicket(id)} />
                        ))
                    ) : (
                        <div className="text-gray-500 p-4 text-center w-full">No payments found matching the filter.</div>
                    )}
                </div>
            </div>

            {/* 3. Tickets Section */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3 text-xl text-gray-800">Support Tickets</h4>
              <TicketsView tickets={tickets} onAddMessage={addMessageToTicket} />
            </div>
          </div>
        );

      case "Performance":
        return <PerformanceView campaigns={campaigns} onOpenCampaignPerf={onOpenCampaignPerf} />;
      default:
        return <div>Not implemented</div>;
    }
  };


// --- Placeholder Components (Required by renderContent) ---

// Placeholder component for CampaignChatList
const CampaignChatList: React.FC<{ campaigns: Campaign[]; onOpenChat: (c: Campaign) => void; search: string; }> = ({ campaigns, onOpenChat, search }) => {
    const filtered = campaigns.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()));
    return (
        <div className="space-y-3">
        <h4 className="font-semibold mb-2">Campaigns ({filtered.length})</h4>
        {filtered.map((c) => (
            <div key={c.id} className="p-3 bg-white rounded-lg shadow flex items-center justify-between hover:bg-gray-50 transition">
            <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-gray-500">{c.id} • {c.poc}</div>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">{c.timelineAgo}</div>
                <button onClick={() => onOpenChat(c)} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm"> Open Chat </button>
            </div>
            </div>
        ))}
        {filtered.length === 0 && <div className="text-gray-500">No campaigns found.</div>}
        </div>
    );
};

// Placeholder component for ChatWindow
const ChatWindow: React.FC<{ campaign: Campaign | null; onSend: (msg: string) => void; messages: { from: "Creator" | "User"; text: string; time: number }[]; onClose: () => void; }> = ({ campaign, onSend, messages, onClose }) => {
    const [text, setText] = useState("");
    useEffect(() => setText(""), [campaign]);
    if (!campaign) return null;
    return (
        <div className="bg-white rounded-lg shadow p-4 w-full">
            <div className="flex items-center justify-between mb-3 border-b pb-2">
            <div>
                <div className="font-semibold">{campaign.name}</div>
                <div className="text-xs text-gray-500">{campaign.id} • POC: {campaign.poc}</div>
            </div>
            <div className="flex gap-2">
                <button onClick={onClose} className="px-3 py-1 rounded-lg border text-sm">Close</button>
            </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-3 h-72 overflow-auto mb-3 space-y-2 flex flex-col">
            {messages.map((m, i) => (
                <div key={i} className={`p-2 rounded-lg max-w-[80%] ${m.from === "Creator" ? "bg-indigo-50 self-end text-right" : "bg-gray-100 self-start text-left"}`}>
                <div className="text-sm font-bold">{m.from}</div>
                <div className="text-sm">{m.text}</div>
                <div className="text-xs text-gray-400 mt-1">{timeAgo(m.time)}</div>
                </div>
            ))}
            </div>
            <div className="flex items-center gap-2">
            <input
                className="flex-1 p-2 border rounded-lg"
                placeholder="Type a message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === "Enter" && text.trim()) {
                    onSend(text.trim());
                    setText("");
                }
                }}
            />
            <label className="px-3 py-2 border rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                📎
                <input type="file" className="hidden" />
            </label>
            <button
                onClick={() => {
                if (text.trim()) {
                    onSend(text.trim());
                    setText("");
                }
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
                Send
            </button>
            </div>
        </div>
    );
};

// Placeholder component for BroadcastList
const BroadcastList: React.FC<{ campaigns: Campaign[]; onRespond: (id: string, interested: boolean) => void }> = ({ campaigns, onRespond }) => {
    const broadcasts = campaigns.filter((c) => c.isBroadcast);
    if (broadcasts.length === 0) return <div className="text-gray-500 p-4 bg-white rounded-lg shadow">No active broadcasts</div>;
    return (
        <div className="space-y-3">
        {broadcasts.map((b) => (
            <div key={b.id} className="p-4 bg-white rounded-lg shadow border border-blue-100">
            <div className="flex items-start justify-between">
                <div>
                <div className="font-semibold text-blue-700">{b.name}</div>
                <div className="text-xs text-gray-500">{b.id} • {b.poc}</div>
                <p className="mt-2 text-sm text-gray-600">{b.brief}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                <button onClick={() => onRespond(b.id, true)} className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">Interested</button>
                <button onClick={() => onRespond(b.id, false)} className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-100">Not Interested</button>
                </div>
            </div>
            </div>
        ))}
        </div>
    );
};

// Placeholder component for TicketsView
const TicketsView: React.FC<{ tickets: Ticket[]; onAddMessage: (ticketId: string, text: string) => void; }> = ({ tickets, onAddMessage }) => {
    const [openTicket, setOpenTicket] = useState<Ticket | null>(tickets[0] ?? null);
    const [msg, setMsg] = useState("");
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1">
            <div className="p-3 bg-white rounded-lg shadow border border-gray-200">
                <h4 className="font-semibold mb-2">Tickets</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                {tickets.map((t) => (
                    <button key={t.id} onClick={() => setOpenTicket(t)} className={`block w-full text-left p-2 rounded-lg transition ${openTicket?.id === t.id ? "bg-indigo-100 text-indigo-800" : "hover:bg-gray-100 text-gray-800"}`} >
                    <div className="font-medium">{t.subject}</div>
                    <div className="text-xs text-gray-500">{t.id} • {t.campaignId ?? "General"}</div>
                    </button>
                ))}
                </div>
            </div>
            </div>

            <div className="col-span-2">
            <div className="p-4 bg-white rounded-lg shadow border border-gray-200">
                {openTicket ? (
                <>
                    <div className="flex justify-between items-center mb-3 border-b pb-2">
                    <div>
                        <div className="font-semibold">{openTicket.subject}</div>
                        <div className="text-xs text-gray-500">{openTicket.id} • {openTicket.campaignId ?? "General"}</div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${openTicket.status === "Resolved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{openTicket.status}</div>
                    </div>
                    <div className="h-64 overflow-auto border border-gray-200 rounded-lg p-3 space-y-2 mb-3 flex flex-col">
                    {openTicket.messages.map((m, i) => (
                        <div key={i} className={`p-2 rounded-lg max-w-[80%] ${m.from === "Creator" ? "bg-indigo-50 self-end text-right" : "bg-gray-100 self-start text-left"}`}>
                        <div className="text-sm font-bold">{m.from}</div>
                        <div className="text-sm">{m.text}</div>
                        <div className="text-xs text-gray-400 mt-1">{timeAgo(m.time)}</div>
                        </div>
                    ))}
                    </div>
                    <div className="flex gap-2">
                    <input value={msg} onChange={(e) => setMsg(e.target.value)} className="flex-1 p-2 border rounded-lg" placeholder="Write a message..." />
                    <button onClick={() => { if (msg.trim()) { onAddMessage(openTicket.id, msg.trim()); setMsg(""); } }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Send</button>
                    </div>
                </>
                ) : (
                <div className="text-gray-500 p-6 text-center">Select a ticket to view conversation</div>
                )}
            </div>
            </div>
        </div>
    );
};

// Placeholder component for PerformanceView
const PerformanceView: React.FC<{ campaigns: Campaign[]; onOpenCampaignPerf: (campaignId: string) => void; }> = ({ campaigns, onOpenCampaignPerf }) => {
    const posted = campaigns.filter((c) => c.stage === "Content Posted");
    return (
        <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-xs text-gray-500">Total Posts</div>
            <div className="text-2xl font-semibold mt-2"> {posted.length} </div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-xs text-gray-500">Avg Engagement Rate</div>
            <div className="text-2xl font-semibold mt-2">4.6%</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-xs text-gray-500">Total Earnings (est.)</div>
            <div className="text-2xl font-semibold mt-2">₹ 52,400</div>
            </div>
        </div>

        <div>
            <h4 className="font-semibold mb-3">Posts & Contracts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posted.map((c) => (
                <div key={c.id} className="p-3 bg-white rounded-lg shadow flex items-center justify-between">
                <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.id}</div>
                </div>
                <div>
                    <button onClick={() => onOpenCampaignPerf(c.id)} className="px-3 py-1 bg-indigo-600 text-white rounded">Open</button>
                </div>
                </div>
            ))}
            {posted.length === 0 && <div className="text-gray-500">No posted content yet.</div>}
            </div>
        </div>
        </div>
    );
};


// --- Main Layout ---
  return (
    <div className="min-h-screen flex flex-col">
      <Header role={role} />

      <div className="flex flex-1">
        <Sidebar
          modules={modules}
          selected={selectedModule}
          onSelect={(m) => {
            setSelectedModule(m);
            setSelectedSub(subitems[m][0]);
            // No need to reset general campaign search, as it was removed.
            // Resetting individual states for a clean view on module change.
            setUnderReviewSearch(""); setUnderReviewFilter("All");
            setAvailableSearch(""); setAvailableFilter("All");
            setUpdateRequestSearch(""); setUpdateRequestFilter("In Process");
            setCompletedSearch(""); setCompletedFilter("All");
            setPaymentSearch(""); // Reset payment search
            setPaymentStatusFilter("All"); // Reset payment filter
          }}
          subitems={subitems}
          selectedSub={selectedSub}
          onSelectSub={(s) => setSelectedSub(s)}
          role={role}
          setRole={setRole}
        />
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                {selectedModule} — <span className="text-indigo-600">{selectedSub}</span>
              </h1>
              <div className="text-sm text-gray-600">Creator Dashboard</div>
            </div>
            <div>{renderContent()}</div>
            <div className="mt-8 text-xs text-gray-400">
              This is a mock UI. All actions are local-state only.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
