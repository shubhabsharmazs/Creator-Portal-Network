import React, { useEffect, useMemo, useState } from "react";
import "./index.css";

/**
 * Final Creator Portal - App.tsx
 * - Blue theme preserved
 * - Creator Directory (profile + social links verification)
 * - Communication (unchanged)
 * - Campaigns & Contracts: four horizontal strips (Ongoing, Available, Update Requests, Completed)
 * - Available has search + date filter
 * - Open Brief is letter-style modal; Accept / Decline (reason) / Update Request (message to POC)
 * - Payments: Payment Info editable + Payment Status strip (search + status filter) + tickets
 *
 * All data is mocked and local-state only. Tailwind required.
 */

/* ---------------------------
   Types
----------------------------*/
type Role = "Creator" | "Microsoft User" | "Admin";

type CampaignStage =
  | "Invite"
  | "Accepted"
  | "Content Sent"
  | "Approval"
  | "Content Posted Confirmation Sent"
  | "Post Approval";

type Campaign = {
  id: string;
  name: string;
  poc: string;
  createdAt: number;
  brief: string;
  deliverables?: string;
  amount?: string;
  offering?: string;
  isBroadcast?: boolean;
  stage?: CampaignStage; // undefined => invite (available)
  paymentStatus?:
    | "Under Process"
    | "Awaiting Approval"
    | "Paid"
    | "Initiated"
    | "Completed";
  updateRequests?: {
    id: string;
    from: string;
    message: string;
    time: number;
  }[];
  declined?: { reason: string; by: string; time: number } | null;
  isNew?: boolean;
};

type Ticket = {
  id: string;
  campaignId?: string;
  subject: string;
  status: "Initiated" | "Under Process" | "Resolved";
  messages: { from: "Creator" | "Support"; text: string; time: number }[];
  createdAt: number;
};

/* ---------------------------
   Helpers
----------------------------*/
const now = Date.now();
const makeId = (n: number) => `CID-${1000 + n}`;

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function withinRange(createdAt: number, filter: string) {
  const diff = Date.now() - createdAt;
  switch (filter) {
    case "Today":
      return diff <= 1000 * 60 * 60 * 24;
    case "This Week":
      return diff <= 1000 * 60 * 60 * 24 * 7;
    case "This Month":
      return diff <= 1000 * 60 * 60 * 24 * 30;
    case "This Year":
      return diff <= 1000 * 60 * 60 * 24 * 365;
    default:
      return true;
  }
}

/* ---------------------------
   Mock Data generation (10+ cards per strip)
----------------------------*/

const baseAvailable = [
  {
    name: "Autumn Fashion Drop",
    poc: "Priya Sharma",
    brief: "Promote autumn capsule: 2 posts + 1 short. Use #AutumnDrop",
    deliverables: "2 static posts + 1 short",
    amount: "₹25,000",
    offering: "Product kit + fee",
    isNew: true,
  },
  {
    name: "Eco Gadget Review",
    poc: "Aman Verma",
    brief: "Unboxing & 3-min review focused on sustainability.",
    deliverables: "1 unboxing + 1 review",
    amount: "₹18,000",
    offering: "Product sample",
  },
  {
    name: "Winter Skincare Invite",
    poc: "Campaign Team",
    brief: "Share routine + link. Tag brand handles.",
    deliverables: "1 carousel + 1 story",
    amount: "₹12,000",
    offering: "Paid collaboration",
    isNew: true,
  },
  {
    name: "Home Decor Series",
    poc: "Ria Kapoor",
    brief: "Showcase three looks.",
    deliverables: "3 posts",
    amount: "₹20,000",
    offering: "Product kit",
  },
  {
    name: "Travel Essentials",
    poc: "Neha Singh",
    brief: "Travel essentials guide.",
    deliverables: "1 vlog + 1 post",
    amount: "₹22,000",
    offering: "Fee",
  },
];

const baseOngoing = [
  {
    name: "Smart Home Launch",
    poc: "Sonal Gupta",
    brief: "Smart home device launch deliverables.",
    deliverables: "2 posts + 1 demo",
    amount: "₹35,000",
    offering: "Device + fee",
    stage: "Accepted",
    paymentStatus: "Under Process",
  },
  {
    name: "Fitness App Collab",
    poc: "Vikram Singh",
    brief: "In-app demo + 1 reel",
    deliverables: "1 reel",
    amount: "₹22,000",
    offering: "Fee",
    stage: "Content Sent",
    paymentStatus: "Awaiting Approval",
  },
  {
    name: "Green Energy Campaign",
    poc: "Anita Joshi",
    brief: "Series about renewable energy.",
    deliverables: "2 posts",
    amount: "₹15,000",
    offering: "Fee",
    stage: "Approval",
    paymentStatus: "Initiated",
  },
];

const baseCompleted = [
  {
    name: "Smartwatch Review",
    poc: "Rahul Jain",
    brief: "Review of new smartwatch; posted and live.",
    deliverables: "1 long video",
    amount: "₹30,000",
    offering: "Device + fee",
    stage: "Post Approval",
    paymentStatus: "Paid",
  },
  {
    name: "Kitchen Essentials",
    poc: "Nisha Patel",
    brief: "Product roundup posted and live.",
    deliverables: "3 posts",
    amount: "₹18,000",
    offering: "Fee",
    stage: "Post Approval",
    paymentStatus: "Paid",
  },
];

function makeMockCampaigns() {
  const campaigns: Campaign[] = [];
  // create 10 available by repeating baseAvailable variations
  for (let i = 0; i < 10; i++) {
    const b = baseAvailable[i % baseAvailable.length];
    campaigns.push({
      id: makeId(i + 1),
      name: `${b.name} #${i + 1}`,
      poc: b.poc,
      createdAt: now - i * 1000 * 60 * 60 * (i % 24),
      brief: b.brief,
      deliverables: b.deliverables,
      amount: b.amount,
      offering: b.offering,
      isNew: i < 3, // first few are new
    });
  }
  // ongoing
  for (let i = 0; i < 6; i++) {
    const b = baseOngoing[i % baseOngoing.length];
    campaigns.push({
      id: makeId(100 + i),
      name: `${b.name} - Run ${i + 1}`,
      poc: b.poc,
      createdAt: now - (i + 2) * 1000 * 60 * 60 * 24,
      brief: b.brief,
      deliverables: b.deliverables,
      amount: b.amount,
      offering: b.offering,
      stage: (["Accepted", "Content Sent", "Approval"] as CampaignStage[])[
        i % 3
      ],
      paymentStatus: b.paymentStatus,
    });
  }
  // completed
  for (let i = 0; i < 4; i++) {
    const b = baseCompleted[i % baseCompleted.length];
    campaigns.push({
      id: makeId(200 + i),
      name: `${b.name} (${i + 1})`,
      poc: b.poc,
      createdAt: now - (i + 10) * 1000 * 60 * 60 * 24,
      brief: b.brief,
      deliverables: b.deliverables,
      amount: b.amount,
      offering: b.offering,
      stage: "Post Approval",
      paymentStatus: "Paid",
    });
  }
  // add some update request examples
  campaigns[12].updateRequests = [
    {
      id: "UR-101",
      from: "creator",
      message: "Please update logo placement.",
      time: now - 1000 * 60 * 60 * 24,
    },
  ];
  campaigns[3].updateRequests = [
    {
      id: "UR-102",
      from: "creator",
      message: "Need higher res asset for thumbnail.",
      time: now - 1000 * 60 * 60 * 6,
    },
  ];
  return campaigns;
}

/* tickets */
const seedTickets: Ticket[] = [
  {
    id: "T-001",
    campaignId: makeId(201),
    subject: "Payment not received",
    status: "Under Process",
    messages: [
      {
        from: "Creator",
        text: "Payment expected but not received.",
        time: now - 1000 * 60 * 60 * 48,
      },
      {
        from: "Support",
        text: "Finance checking, will update.",
        time: now - 1000 * 60 * 60 * 36,
      },
    ],
    createdAt: now - 1000 * 60 * 60 * 48,
  },
];

/* ---------------------------
   Components
----------------------------*/

/* Header */
const Header: React.FC<{ role: Role }> = ({ role }) => (
  <header className="h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-between px-6">
    <div className="flex items-center gap-4">
      <div className="bg-white/30 rounded-full h-10 w-10 flex items-center justify-center font-bold">
        CP
      </div>
      <div>
        <div className="text-lg font-semibold">Creator Portal</div>
        <div className="text-xs opacity-90">Creator view</div>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="text-sm opacity-90">Signed in as</div>
      <div className="bg-white/10 px-3 py-1 rounded">{role}</div>
      <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
        RS
      </div>
    </div>
  </header>
); /* Sidebar */
const Sidebar: React.FC<{
  modules: string[];
  selected: string;
  onSelect: (m: string) => void;
  subitems: Record<string, string[]>;
  selectedSub: string;
  onSelectSub: (s: string) => void;
  role: Role;
  setRole: (r: Role) => void;
}> = ({
  modules,
  selected,
  onSelect,
  subitems,
  selectedSub,
  onSelectSub,
  role,
  setRole,
}) => (
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

    <nav className="p-4 space-y-3">
      {modules.map((m) => (
        <div key={m}>
          <button
            onClick={() => onSelect(m)}
            className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
              selected === m
                ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700"
                : "text-gray-800 hover:bg-gray-100"
            }`}
          >
            {m}
          </button>
          {selected === m && (
            <div className="mt-2 pl-4">
              {subitems[m].map((s) => (
                <button
                  key={s}
                  onClick={() => onSelectSub(s)}
                  className={`block w-full text-left px-3 py-1 rounded mb-1 text-sm ${
                    selectedSub === s
                      ? "bg-indigo-100 text-indigo-800 font-semibold"
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
); /* Modal (centered) */
const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg";
}> = ({ open, onClose, children, title, size = "md" }) => {
  if (!open) return null;
  const maxW =
    size === "sm" ? "max-w-md" : size === "lg" ? "max-w-4xl" : "max-w-2xl";
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div
          className={`bg-white rounded-lg shadow-lg w-full ${maxW} overflow-auto`}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="font-semibold">{title}</div>
            <button onClick={onClose} className="px-3 py-1 rounded border">
              Close
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </>
  );
};

/* Uniform card styles: min width and fixed height so cards are same size */
const cardMinWidth = "min-w-[360px]";
const cardHeight = "h-56";

/* Campaign Card */
const CampaignCard: React.FC<{
  c: Campaign;
  onOpenBrief?: (c: Campaign) => void;
  onViewProgress?: (c: Campaign) => void;
  showActions?: boolean;
}> = ({ c, onOpenBrief, onViewProgress, showActions = false }) => {
  return (
    <>
      <div
        className={`${cardMinWidth} ${cardHeight} bg-white rounded-2xl p-4 shadow-lg border hover:shadow-2xl transition flex flex-col justify-between`}
      >
        <div>
          <div className="font-semibold text-lg">{c.name}</div>
          <div className="text-xs text-gray-500">
            {c.id} • {c.poc}
          </div>
          <div className="mt-2 text-sm text-gray-600 line-clamp-3">
            {c.brief}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <div
              className={`text-xs px-2 py-1 rounded ${
                c.stage
                  ? "bg-indigo-50 text-indigo-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {c.stage ?? "Invite"}
            </div>
            {c.paymentStatus && (
              <div
                className={`text-xs px-2 py-1 rounded ${
                  c.paymentStatus === "Paid"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {c.paymentStatus}
              </div>
            )}
            {c.isNew && (
              <div className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                New
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenBrief && (
              <button
                onClick={() => onOpenBrief(c)}
                className="px-3 py-1 bg-indigo-600 text-white rounded"
              >
                Open Brief
              </button>
            )}
            {onViewProgress && (
              <button
                onClick={() => onViewProgress(c)}
                className="px-3 py-1 border rounded"
              >
                View Progress
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* Progress Tracker component */
const ProgressTracker: React.FC<{
  stage?: CampaignStage;
  onAdvance: (next: CampaignStage) => void;
}> = ({ stage }) => {
  const stages: CampaignStage[] = [
    "Accepted",
    "Content Sent",
    "Approval",
    "Content Posted Confirmation Sent",
    "Post Approval",
  ];
  const idx = stage ? stages.indexOf(stage) : -1;
  return (
    <>
      <div>
        <div className="flex items-center gap-6 overflow-auto">
          {stages.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  i <= idx
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              <div
                className={`${
                  i <= idx ? "font-semibold text-gray-800" : "text-gray-400"
                }`}
              >
                {s}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          {/* Progress is display-only in creator view (no manual advance) */}
        </div>
      </div>
    </>
  );
};

/* Payment Card - same size as campaign cards */
const PaymentCard: React.FC<{
  c: Campaign;
  onRaiseTicket: (campaignId?: string) => void;
  onViewDetails?: (c: Campaign) => void;
}> = ({ c, onRaiseTicket, onViewDetails }) => (
  <div
    className={`${cardMinWidth} ${cardHeight} bg-white rounded-2xl p-4 shadow-lg border hover:shadow-2xl transition flex flex-col justify-between`}
  >
    <div>
      <div className="font-semibold">{c.name}</div>
      <div className="text-xs text-gray-500">
        {c.id} • {c.poc}
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Payment: <span className="font-medium">{c.paymentStatus ?? "N/A"}</span>
      </div>
    </div>
    <div className="flex items-center justify-between mt-3">
      <button
        onClick={() => onRaiseTicket(c.id)}
        className="px-3 py-1 bg-red-50 text-red-700 rounded"
      >
        Raise Ticket
      </button>
      <button
        onClick={() =>
          onViewDetails
            ? onViewDetails(c)
            : alert(`View payment details for ${c.id}`)
        }
        className="px-3 py-1 border rounded"
      >
        View Details
      </button>
    </div>
  </div>
); /* Tickets view */
const TicketsView: React.FC<{
  tickets: Ticket[];
  onAddMessage: (ticketId: string, text: string) => void;
}> = ({ tickets, onAddMessage }) => {
  const [open, setOpen] = useState<Ticket | null>(tickets[0] ?? null);
  const [msg, setMsg] = useState("");
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1">
          <div className="p-3 bg-white rounded-lg shadow">
            <h4 className="font-semibold mb-2">Tickets</h4>
            <div className="space-y-2">
              {tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setOpen(t)}
                  className={`block w-full text-left p-2 rounded ${
                    open?.id === t.id ? "bg-indigo-50" : "hover:bg-gray-100"
                  }`}
                >
                  <div className="font-medium">{t.subject}</div>
                  <div className="text-xs text-gray-500">
                    {t.id} • {t.campaignId ?? "General"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <div className="p-4 bg-white rounded-lg shadow">
            {open ? (
              <>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="font-semibold">{open.subject}</div>
                    <div className="text-xs text-gray-500">{open.id}</div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded ${
                      open.status === "Resolved"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {open.status}
                  </div>
                </div>

                <div className="h-64 overflow-auto border rounded p-3 space-y-2 mb-3">
                  {open.messages.map((m, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded ${
                        m.from === "Creator"
                          ? "bg-indigo-50 self-end"
                          : "bg-gray-100"
                      }`}
                    >
                      <div className="text-sm font-medium">{m.from}</div>
                      <div className="text-sm">{m.text}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {timeAgo(m.time)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    className="flex-1 p-2 border rounded"
                    placeholder="Write a message..."
                  />
                  <button
                    onClick={() => {
                      if (!msg.trim()) return;
                      onAddMessage(open.id, msg.trim());
                      setMsg("");
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded"
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="text-gray-500">
                Select a ticket to view conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* Payment Info form */
const PaymentInfoForm: React.FC<{
  payment: { account: string; ifsc?: string; taxDocument?: string | null };
  onSave: (p: any) => void;
}> = ({ payment, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(payment);
  useEffect(() => setLocal(payment), [payment]);
  return (
    <>
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Payment Info & Tax Documentation</h3>
          <button
            onClick={() => setEditing((e) => !e)}
            className="px-3 py-1 rounded bg-indigo-50 text-indigo-700"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Bank Account</label>
            {editing ? (
              <input
                value={local.account}
                onChange={(e) =>
                  setLocal((l: any) => ({ ...l, account: e.target.value }))
                }
                className="mt-1 p-2 border rounded w-full"
              />
            ) : (
              <div className="mt-1 p-2 border rounded bg-gray-50">
                {payment.account}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500">IFSC / Routing</label>
            {editing ? (
              <input
                value={local.ifsc}
                onChange={(e) =>
                  setLocal((l: any) => ({ ...l, ifsc: e.target.value }))
                }
                className="mt-1 p-2 border rounded w-full"
              />
            ) : (
              <div className="mt-1 p-2 border rounded bg-gray-50">
                {payment.ifsc ?? "Not provided"}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-gray-500">Tax Document</label>
            <div className="mt-2 flex items-center gap-3">
              <div className="p-2 border rounded bg-gray-50">
                {payment.taxDocument ?? "No tax document uploaded"}
              </div>
              {editing && (
                <button
                  onClick={() => {
                    const doc = prompt(
                      "Enter tax document name (simulate upload)"
                    );
                    if (doc) setLocal((l: any) => ({ ...l, taxDocument: doc }));
                  }}
                  className="px-3 py-1 bg-indigo-600 text-white rounded"
                >
                  Upload
                </button>
              )}
            </div>
          </div>
        </div>

        {editing && (
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => {
                setLocal(payment);
                setEditing(false);
              }}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(local);
                setEditing(false);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </>
  );
};

/* Creator Directory (profile + social links) */
const CreatorDirectory: React.FC<{
  profile: any;
  onSaveProfile: (section: string, data: any) => void;
  socials: any;
  onUpdateSocials: (s: any) => void;
}> = ({ profile, onSaveProfile, socials, onUpdateSocials }) => {
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [localProfile, setLocalProfile] = useState(profile);
  const [localSocials, setLocalSocials] = useState(socials);
  useEffect(() => setLocalProfile(profile), [profile]);
  useEffect(() => setLocalSocials(socials), [socials]);

  // Instagram verify modal state
  const [verifyOpen, setVerifyOpen] = useState(false);

  const verifyInstagram = () => {
    setVerifyOpen(true);
  };

  const confirmInstagram = () => {
    // simulate verification
    setLocalSocials((s: any) => ({
      ...s,
      instagram: { ...s.instagram, verified: true },
    }));
    onUpdateSocials({
      ...localSocials,
      instagram: { ...localSocials.instagram, verified: true },
    });
    setVerifyOpen(false);
    alert("Instagram verified (simulated)");
  };

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Creator Directory</h2>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Profile</div>
            <div>
              <button
                onClick={() =>
                  setEditing((s) => ({ ...s, profile: !s.profile }))
                }
                className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded"
              >
                {editing.profile ? "Cancel" : "Edit"}
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Name</label>
              <div className="mt-1 p-2 border rounded bg-gray-50">
                {localProfile.name}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Email</label>
              <div className="mt-1 p-2 border rounded bg-gray-50">
                {localProfile.email}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500">Phone</label>
              {editing.profile ? (
                <input
                  value={localProfile.phone}
                  onChange={(e) =>
                    setLocalProfile((l: any) => ({
                      ...l,
                      phone: e.target.value,
                    }))
                  }
                  className="mt-1 p-2 border rounded w-full"
                />
              ) : (
                <div className="mt-1 p-2 border rounded bg-gray-50">
                  {localProfile.phone}
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500">Creator Type</label>
              {editing.profile ? (
                <input
                  value={localProfile.creatorType}
                  onChange={(e) =>
                    setLocalProfile((l: any) => ({
                      ...l,
                      creatorType: e.target.value,
                    }))
                  }
                  className="mt-1 p-2 border rounded w-full"
                />
              ) : (
                <div className="mt-1 p-2 border rounded bg-gray-50">
                  {localProfile.creatorType}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-500">Bio</label>
              {editing.profile ? (
                <textarea
                  value={localProfile.bio}
                  onChange={(e) =>
                    setLocalProfile((l: any) => ({ ...l, bio: e.target.value }))
                  }
                  className="mt-1 p-2 border rounded w-full"
                  rows={4}
                />
              ) : (
                <div className="mt-1 p-2 border rounded bg-gray-50">
                  {localProfile.bio}
                </div>
              )}
            </div>
          </div>

          {editing.profile && (
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setLocalProfile(profile);
                  setEditing((s) => ({ ...s, profile: false }));
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSaveProfile("profile", localProfile);
                  setEditing((s) => ({ ...s, profile: false }));
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Socials — kept on same page but not as separate sidebar item */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Social Media Links</div>
            <div className="text-sm text-gray-500">Add / verify handles</div>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Instagram</label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  className="p-2 border rounded w-full"
                  value={localSocials.instagram.handle}
                  onChange={(e) =>
                    setLocalSocials((s: any) => ({
                      ...s,
                      instagram: { ...s.instagram, handle: e.target.value },
                    }))
                  }
                />
                <button
                  onClick={verifyInstagram}
                  className={`px-3 py-1 rounded ${
                    localSocials.instagram.verified
                      ? "bg-green-500 text-white"
                      : "bg-amber-400 text-white"
                  }`}
                >
                  {localSocials.instagram.verified ? "Verified" : "Verify"}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500">Facebook</label>
              <input
                className="mt-2 p-2 border rounded w-full"
                value={localSocials.facebook.handle}
                onChange={(e) =>
                  setLocalSocials((s: any) => ({
                    ...s,
                    facebook: { ...s.facebook, handle: e.target.value },
                  }))
                }
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Threads</label>
              <input
                className="mt-2 p-2 border rounded w-full"
                value={localSocials.threads.handle}
                onChange={(e) =>
                  setLocalSocials((s: any) => ({
                    ...s,
                    threads: { ...s.threads, handle: e.target.value },
                  }))
                }
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">TikTok</label>
              <input
                className="mt-2 p-2 border rounded w-full"
                value={localSocials.tiktok.handle}
                onChange={(e) =>
                  setLocalSocials((s: any) => ({
                    ...s,
                    tiktok: { ...s.tiktok, handle: e.target.value },
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => {
                setLocalSocials(socialsExample);
              }}
              className="px-4 py-2 border rounded"
            >
              Reset
            </button>
            <button
              onClick={() => {
                onUpdateSocials(localSocials);
                alert("Social links saved (local)");
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Save Links
            </button>
          </div>
        </div>
      </div>

      {/* Instagram verification modal */}
      <Modal
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        title="Verify Instagram"
        size="sm"
      >
        <div>
          <div className="text-sm text-gray-700">
            Simulate signing in to Instagram to verify account{" "}
            <b>{localSocials.instagram.handle}</b>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => setVerifyOpen(false)}
              className="px-3 py-1 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={confirmInstagram}
              className="px-3 py-1 bg-indigo-600 text-white rounded"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

/* Placeholder social defaults */
const socialsExample = {
  instagram: { handle: "@creator_ig", verified: false },
  facebook: { handle: "Creator FB" },
  threads: { handle: "@creator_threads" },
  tiktok: { handle: "@creator_tt" },
};

/* Communications module (unchanged) */
const CommunicationsModule: React.FC<{
  campaigns: Campaign[];
  openBrief: (c: Campaign) => void;
  activeChatCampaignId?: string | null;
  openChat?: (id: string) => void;
}> = ({ campaigns, openBrief, activeChatCampaignId, openChat }) => {
  // Keep simple but consistent with earlier implementation; left unchanged in behavior
  return (
    <>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Communication</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/3">
              <div className="font-semibold">Campaigns</div>
              <div className="mt-3 space-y-2">
                {/* Only show ongoing campaigns here */}
                {campaigns
                  .filter((c) =>
                    [
                      "Accepted",
                      "Content Sent",
                      "Approval",
                      "Content Posted Confirmation Sent",
                    ].includes(c.stage ?? "")
                  )
                  .map((c) => (
                    <div
                      key={c.id}
                      onClick={() => openChat && openChat(c.id)}
                      className={`p-3 rounded-lg cursor-pointer border ${
                        c.id === activeChatCampaignId
                          ? "bg-indigo-100 border-indigo-400"
                          : "bg-indigo-50 hover:bg-indigo-100"
                      }`}
                    >
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.id}</div>
                    </div>
                  ))}

                {/* If no ongoing campaigns available */}
                {campaigns.filter((c) =>
                  [
                    "Accepted",
                    "Content Sent",
                    "Approval",
                    "Content Posted Confirmation Sent",
                  ].includes(c.stage ?? "")
                ).length === 0 && (
                  <div className="text-sm text-gray-500 p-2">
                    No ongoing campaigns available.
                  </div>
                )}
              </div>
            </div>

            <div className="md:flex-1">
              <div className="font-semibold">Messages</div>
              <div className="mt-3 p-4 bg-gray-50 rounded">
                {activeChatCampaignId ? (
                  (() => {
                    const c = campaigns.find(
                      (x) => x.id === activeChatCampaignId
                    );
                    if (!c)
                      return (
                        <>
                          <div className="text-sm text-gray-500">
                            Selected campaign not found.
                          </div>
                        </>
                      );
                    const messages = [
                      {
                        from: "POC",
                        text: `Hi ${c.name}, please share your draft soon.`,
                        time: "2d ago",
                      },
                      {
                        from: "Creator",
                        text: "Sure, I’ll upload by tonight!",
                        time: "1d ago",
                      },
                    ];

                    return (
                      <>
                        <div className="flex flex-col h-96 bg-gray-50 rounded p-4">
                          {/* Chat Messages */}
                          <div className="flex-1 overflow-auto space-y-2">
                            {messages.map((m, i) => (
                              <div
                                key={i}
                                className={`p-2 rounded max-w-[70%] ${
                                  m.from === "Creator"
                                    ? "bg-indigo-100 self-end ml-auto"
                                    : "bg-white mr-auto"
                                }`}
                              >
                                <div className="text-xs font-medium text-gray-500">
                                  {m.from}
                                </div>
                                <div className="text-sm">{m.text}</div>
                                <div className="text-xs text-gray-400">
                                  {m.time}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Input Box */}
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              onClick={() => alert("Upload file (demo)")}
                              className="px-3 py-2 border rounded text-lg"
                              title="Upload content"
                            >
                              +
                            </button>
                            <input
                              id="chat-input"
                              placeholder="Write a message..."
                              className="flex-1 p-2 border rounded"
                            />
                            <button
                              onClick={() => {
                                const el = document.getElementById(
                                  "chat-input"
                                ) as HTMLInputElement | null;
                                if (!el || !el.value.trim())
                                  return alert("Enter a message");
                                alert("Message sent (demo): " + el.value);
                                el.value = "";
                              }}
                              className="px-4 py-2 bg-indigo-600 text-white rounded"
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <div className="text-sm text-gray-500">
                    Select a campaign from the left to open its chat.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ---------------------------
   Main App
----------------------------*/
export default function App() {
  // --- Added state: active chat and payment modal campaign (injected by assistant)
  const [activeChatCampaignId, setActiveChatCampaignId] = useState<
    string | null
  >(null);
  const [paymentModalCampaign, setPaymentModalCampaign] =
    useState<Campaign | null>(null);

  // Open chat handler: navigate to Communication and set active chat campaign id
  const openChat = (campaignId: string) => {
    setSelectedModule("Communication");
    setActiveChatCampaignId(campaignId);
  };

  // Handle payment status click: navigate to Payments and open payment modal for campaign
  const handlePaymentStatusClick = (campaign: Campaign) => {
    setSelectedModule("Payments");
    setPaymentModalCampaign(campaign);
  };

  const [role, setRole] = useState<Role>("Creator");

  const modules = [
    "Creator Directory",
    "Communication",
    "Campaigns & Contracts",
    "Payments",
    "Performance",
  ];
  const subitems: Record<string, string[]> = {
    "Creator Directory": ["View / Update Profile"], // no social links subitem
    Communication: ["Campaign Chat", "Notifications", "Broadcast"],
    "Campaigns & Contracts": ["All Campaigns & Contracts"],
    Payments: ["All Payments & Tickets"],
    Performance: ["Post Engagement", "Contracts", "Payments"],
  };

  const [selectedModule, setSelectedModule] = useState<string>(
    "Campaigns & Contracts"
  );
  const [selectedSub, setSelectedSub] = useState<string>(
    "All Campaigns & Contracts"
  );
  // data
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    makeMockCampaigns()
  );
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets);
  const [paymentInfo, setPaymentInfo] = useState({
    account: "XXXXXXXXXXXX1234",
    ifsc: "HDFC0001234",
    taxDocument: "PAN.pdf",
  });
  const [profile, setProfile] = useState({
    name: "Rohit Sharma",
    phone: "+91 98765 43210",
    email: "rohit@example.com",
    creatorType: "Lifestyle / Tech",
    bio: "Creator focused on tech reviews.",
  });
  const [socials, setSocials] = useState(socialsExample);

  // Brief modal states
  const [briefOpen, setBriefOpen] = useState(false);
  const [briefCampaign, setBriefCampaign] = useState<Campaign | null>(null);

  // progress popup for messages
  const [progressPopup, setProgressPopup] = useState<{
    open: boolean;
    campaign: Campaign | null;
  }>({ open: false, campaign: null });

  // filters & search (only Available needs date filter per your last note; others get search only)
  const [searchAvailable, setSearchAvailable] = useState("");
  const [filterAvailable, setFilterAvailable] = useState("All");

  const [searchOngoing, setSearchOngoing] = useState("");
  const [searchCompleted, setSearchCompleted] = useState("");
  const [searchUpdate, setSearchUpdate] = useState("");

  // Payments search & filter
  const [searchPayments, setSearchPayments] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("All");

  /* Categorize campaigns */
  const availableList = useMemo(
    () => campaigns.filter((c) => !c.stage && !c.isBroadcast && !c.declined),
    [campaigns]
  );
  const ongoingList = useMemo(
    () => campaigns.filter((c) => c.stage && c.stage !== "Post Approval"),
    [campaigns]
  );
  const completedList = useMemo(
    () => campaigns.filter((c) => c.stage === "Post Approval" || c.declined),
    [campaigns]
  );
  const updateRequestsList = useMemo(
    () =>
      campaigns.filter((c) => c.updateRequests && c.updateRequests.length > 0),
    [campaigns]
  );
  /* Utilities */
  const openBriefModal = (c: Campaign) => {
    setBriefCampaign(c);
    setBriefOpen(true);
  };
  const closeBriefModal = () => {
    setBriefCampaign(null);
    setBriefOpen(false);
  };

  const acceptInvite = (id: string) => {
    setCampaigns((cs) =>
      cs.map((c) =>
        c.id === id ? { ...c, stage: "Accepted", isNew: false } : c
      )
    );
    closeBriefModal();
  };

  const declineInvite = (id: string) => {
    const reason = prompt("Please enter reason for declining (this is a demo)");
    if (reason === null) return;
    setCampaigns((cs) =>
      cs.map((c) =>
        c.id === id
          ? { ...c, declined: { reason, by: "Creator", time: Date.now() } }
          : c
      )
    );
    closeBriefModal();
  };

  const updateRequestFromBrief = (id: string, message: string) => {
    setCampaigns((cs) =>
      cs.map((c) =>
        c.id === id
          ? {
              ...c,
              updateRequests: [
                ...(c.updateRequests ?? []),
                {
                  id: `UR-${Math.floor(Math.random() * 9000)}`,
                  from: "creator",
                  message,
                  time: Date.now(),
                },
              ],
            }
          : c
      )
    );
    closeBriefModal();
  };

  const advanceStage = (id: string, next: CampaignStage) => {
    setCampaigns((cs) =>
      cs.map((c) => {
        if (c.id !== id) return c;
        const updated: Campaign = { ...c, stage: next };
        // when Post Approval is reached, mark payment status and it will appear in Completed list due to stage
        if (next === "Post Approval") {
          updated.paymentStatus = "Under Process";
        }
        return updated;
      })
    );
  };

  // Payments: raise ticket
  const raiseTicket = (campaignId?: string) => {
    const ticketId = `T-${Math.floor(Math.random() * 900 + 100)}`;
    const newTicket: Ticket = {
      id: ticketId,
      campaignId,
      subject: campaignId ? `Payment issue: ${campaignId}` : "General",
      status: "Initiated",
      messages: [
        {
          from: "Creator",
          text: `Raised ticket for ${campaignId ?? "general"}`,
          time: Date.now(),
        },
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

  const savePaymentInfo = (p: any) => {
    setPaymentInfo(p);
    alert("Payment info saved (local)");
  };

  const sendMessageToPOC = (campaignId: string, message: string) => {
    // add update request and move to update requests list (already reflected by presence in updateRequestsList)
    setCampaigns((cs) =>
      cs.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              updateRequests: [
                ...(c.updateRequests ?? []),
                {
                  id: `UR-${Math.floor(Math.random() * 9000)}`,
                  from: "creator",
                  message,
                  time: Date.now(),
                },
              ],
            }
          : c
      )
    );
    alert("Update request sent; campaign moved to Update Requests.");
  };

  // Filter helpers
  const filterStrip = (
    list: Campaign[],
    search: string,
    dateFilter?: string
  ) => {
    return list.filter((c) => {
      const match =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase());
      const dateMatch = dateFilter
        ? withinRange(c.createdAt, dateFilter)
        : true;
      return match && dateMatch;
    });
  };

  const paymentsList = useMemo(
    () => campaigns.filter((c) => c.paymentStatus),
    [campaigns]
  );
  const filteredPayments = useMemo(
    () =>
      paymentsList.filter((c) => {
        const searchMatch =
          c.name.toLowerCase().includes(searchPayments.toLowerCase()) ||
          c.id.toLowerCase().includes(searchPayments.toLowerCase());
        const statusMatch =
          filterPaymentStatus === "All"
            ? true
            : c.paymentStatus === filterPaymentStatus;
        return searchMatch && statusMatch;
      }),
    [paymentsList, searchPayments, filterPaymentStatus]
  );
  /* Brief Modal content component */
  const BriefModalContent: React.FC<{ campaign: Campaign | null }> = ({
    campaign,
  }) => {
    const [msg, setMsg] = useState("");
    if (!campaign) return null;

    // determine if this campaign is currently displayed in Available (invite)
    const isAvailable = !campaign.stage && !campaign.declined;

    // letter style content
    const letter = (
      <div className="prose max-w-none">
        <p>Dear Creator,</p>
        <p>
          We are excited to invite you to collaborate on{" "}
          <strong>{campaign.name}</strong>.
        </p>
        <p>
          <strong>Deliverables:</strong>{" "}
          {campaign.deliverables ?? campaign.brief}
        </p>
        <p>
          <strong>Offer Amount:</strong> {campaign.amount ?? "To be discussed"}
        </p>
        <p>
          <strong>Offering:</strong> {campaign.offering ?? "Product + fee"}
        </p>
        <p>
          Please follow the brand guidelines and submit the content by the
          deadline. We look forward to your creativity.
        </p>
        <p>
          Regards,
          <br />
          Microsoft Campaign Team
        </p>
      </div>
    );
    return (
      <>
        <div>
          <div className="bg-gray-50 rounded p-4 mb-4">{letter}</div>

          {isAvailable ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => acceptInvite(campaign.id)}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Accept
              </button>
              <button
                onClick={() => declineInvite(campaign.id)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded"
              >
                Decline
              </button>

              <div className="ml-auto w-full md:w-auto flex items-center gap-2">
                <input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder={`Message to ${campaign.poc}`}
                  className="p-2 border rounded flex-1"
                />
                <button
                  onClick={() => {
                    if (!msg.trim()) {
                      alert("Enter message");
                      return;
                    }
                    updateRequestFromBrief(campaign.id, msg.trim());
                    setMsg("");
                  }}
                  className="px-3 py-2 bg-yellow-500 rounded text-white"
                >
                  Update Request
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              This is a read-only brief (actions are available only for
              Available invites).
            </div>
          )}
        </div>
      </>
    );
  };

  /* view progress popup content */
  const ProgressPopupContent: React.FC<{ campaign: Campaign | null }> = ({
    campaign,
  }) => {
    if (!campaign) return null;
    return (
      <>
        <div>
          <div className="text-sm">
            Current Stage: <strong>{campaign.stage ?? "Invite"}</strong>
          </div>
          <div className="h-64 overflow-auto border rounded p-3 mt-3 space-y-2">
            {(campaign.updateRequests ?? []).map((u) => (
              <div key={u.id} className="p-2 bg-indigo-50 rounded">
                <div className="text-sm font-medium">You</div>
                <div className="text-sm">{u.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {timeAgo(u.time)}
                </div>
              </div>
            ))}
            <div className="p-2 bg-gray-100 rounded">
              <div className="text-sm font-medium">Microsoft User</div>
              <div className="text-sm">
                Simulated response message from POC (demo)
              </div>
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs text-gray-500">Send message to POC</label>
            <SendToPOCForm
              campaign={campaign}
              onSend={(msg) => {
                sendMessageToPOC(campaign.id, msg);
                setProgressPopup({ open: false, campaign: null });
              }}
            />
          </div>
        </div>
      </>
    );
  };

  const SendToPOCForm: React.FC<{
    campaign: Campaign;
    onSend: (msg: string) => void;
  }> = ({ campaign, onSend }) => {
    const [msg, setMsg] = useState("");
    return (
      <>
        <div className="flex items-center gap-2 mt-2">
          <div className="text-xs text-gray-500">
            To: <b>{campaign.poc}</b>
          </div>
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Write message..."
            className="p-2 border rounded flex-1"
          />
          <button
            onClick={() => {
              if (!msg.trim()) {
                alert("Enter message");
                return;
              }
              onSend(msg.trim());
              setMsg("");
            }}
            className="px-3 py-2 bg-indigo-600 text-white rounded"
          >
            Send
          </button>
        </div>
      </>
    );
  };

  /* Creator Directory handlers */
  const saveProfileSection = (section: string, data: any) => {
    setProfile((p) => ({ ...p, ...data }));
    alert("Profile saved (local)");
  };
  const updateSocials = (s: any) => {
    setSocials(s);
    alert("Socials saved (local)");
  };

  /* Effect: if any campaign reaches Post Approval, it will appear in completed (because stage set) */
  useEffect(() => {
    // no-op; stage changes are handled by advanceStage
  }, [campaigns]);

  /* ---------------------------
     Render modules
  ----------------------------*/

  const renderCampaignsModule = () => {
    // Prepare filtered arrays
    const availableFiltered = filterStrip(
      availableList,
      searchAvailable,
      filterAvailable
    );
    const ongoingFiltered = filterStrip(ongoingList, searchOngoing);
    const completedFiltered = filterStrip(completedList, searchCompleted);
    const updateFiltered = filterStrip(updateRequestsList, searchUpdate);

    return (
      <>
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Campaigns & Contracts</h2>

          {/* Available */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold">
                  Available & New Opportunities
                </div>
                <div className="text-xs text-gray-500">
                  Invite-only campaigns
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  value={searchAvailable}
                  onChange={(e) => setSearchAvailable(e.target.value)}
                  placeholder="Search by name or id"
                  className="p-2 border rounded"
                />
                <select
                  value={filterAvailable}
                  onChange={(e) => setFilterAvailable(e.target.value)}
                  className="p-2 border rounded"
                >
                  <option>All</option>
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>This Year</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-400">
              {availableFiltered.length === 0 && (
                <div className="text-gray-500 p-4">
                  No invites match your search / filter.
                </div>
              )}
              {availableFiltered.map((c) => (
                <div key={c.id} className="inline-block mr-3">
                  <CampaignCard c={c} onOpenBrief={openBriefModal} />
                </div>
              ))}
              {/* ensure at least 10 cards */}
              {Array.from({
                length: Math.max(0, 10 - availableFiltered.length),
              }).map((_, i) => (
                <div key={"avail-pad-" + i} className="inline-block mr-3">
                  <div
                    className={`${cardMinWidth} ${cardHeight} bg-white/60 rounded-2xl p-4 border-dashed border-2 border-gray-200 text-gray-400 flex items-center justify-center`}
                  >
                    Placeholder
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ongoing */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold">Ongoing Campaigns</div>
                <div className="text-xs text-gray-500">
                  Track progress of active campaigns
                </div>
              </div>
              <div>
                <input
                  value={searchOngoing}
                  onChange={(e) => setSearchOngoing(e.target.value)}
                  placeholder="Search by name or id"
                  className="p-2 border rounded"
                />
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-400">
              {ongoingFiltered.length === 0 && (
                <div className="text-gray-500 p-4">
                  No ongoing campaigns match your filters.
                </div>
              )}
              {ongoingFiltered.map((c) => (
                <div key={c.id} className="inline-block mr-3">
                  <div
                    className={`${cardMinWidth} ${cardHeight} bg-white rounded-2xl p-4 shadow-lg border`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-lg">{c.name}</div>
                        <div className="text-xs text-gray-500">
                          {c.id} • {c.poc}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {timeAgo(c.createdAt)}
                      </div>
                    </div>

                    <div className="mt-3">
                      <ProgressTracker
                        stage={c.stage}
                        onAdvance={(next) => advanceStage(c.id, next)}
                      />
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => openBriefModal(c)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded"
                        >
                          Open Brief
                        </button>
                        <button
                          onClick={() => openChat(c.id)}
                          className="px-3 py-1 border rounded"
                        >
                          View Messages
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {Array.from({
                length: Math.max(0, 10 - ongoingFiltered.length),
              }).map((_, i) => (
                <div key={"ongo-pad-" + i} className="inline-block mr-3">
                  <div
                    className={`${cardMinWidth} ${cardHeight} bg-white/60 rounded-2xl p-4 border-dashed border-2 border-gray-200 text-gray-400 flex items-center justify-center`}
                  >
                    Placeholder
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Update Requests */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold">Update Requests</div>
                <div className="text-xs text-gray-500">
                  Campaigns where you requested updates
                </div>
              </div>
              <div>
                <input
                  value={searchUpdate}
                  onChange={(e) => setSearchUpdate(e.target.value)}
                  placeholder="Search by name or id"
                  className="p-2 border rounded"
                />
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-400">
              {updateFiltered.length === 0 && (
                <div className="text-gray-500 p-4">No update requests yet.</div>
              )}
              {updateFiltered.map((c) => (
                <div key={c.id} className="inline-block mr-3">
                  <div
                    className={`${cardMinWidth} ${cardHeight} bg-white rounded-2xl p-4 shadow-lg border`}
                  >
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs text-gray-500">
                      {c.id} • {c.poc}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {(c.updateRequests ?? [])
                        .map((u) => u.message)
                        .join(" • ")}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => openBriefModal(c)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded"
                      >
                        Open Brief
                      </button>
                      <button
                        onClick={() => alert("Open conversation (demo)")}
                        className="px-3 py-1 border rounded"
                      >
                        View Messages
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {Array.from({
                length: Math.max(0, 10 - updateFiltered.length),
              }).map((_, i) => (
                <div key={"upd-pad-" + i} className="inline-block mr-3">
                  <div
                    className={`${cardMinWidth} ${cardHeight} bg-white/60 rounded-2xl p-4 border-dashed border-2 border-gray-200 text-gray-400 flex items-center justify-center`}
                  >
                    Placeholder
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold">Completed & Declined</div>
                <div className="text-xs text-gray-500">
                  Completed posts and declined invites
                </div>
              </div>
              <div>
                <input
                  value={searchCompleted}
                  onChange={(e) => setSearchCompleted(e.target.value)}
                  placeholder="Search by name or id"
                  className="p-2 border rounded"
                />
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-400">
              {completedFiltered.length === 0 && (
                <div className="text-gray-500 p-4">
                  No completed items match your filters.
                </div>
              )}
              {completedFiltered.map((c) => (
                <div key={c.id} className="inline-block mr-3">
                  <div
                    className={`${cardMinWidth} ${cardHeight} bg-white rounded-2xl p-4 shadow-lg border`}
                  >
                    <div>
                      <div className="font-semibold text-lg">{c.name}</div>
                      <div className="text-xs text-gray-500">
                        {c.id} • {c.poc}
                      </div>
                      <div className="mt-2 text-sm text-gray-600 line-clamp-3">
                        {c.brief}
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2 justify-between items-center">
                      <button
                        onClick={() => openBriefModal(c)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded"
                      >
                        Open Brief
                      </button>
                      <button
                        onClick={() => handlePaymentStatusClick(c)}
                        className="px-3 py-1 border rounded"
                      >
                        Payment Status
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {Array.from({
                length: Math.max(0, 10 - completedFiltered.length),
              }).map((_, i) => (
                <div key={"comp-pad-" + i} className="inline-block mr-3">
                  <div
                    className={`${cardMinWidth} ${cardHeight} bg-white/60 rounded-2xl p-4 border-dashed border-2 border-gray-200 text-gray-400 flex items-center justify-center`}
                  >
                    Placeholder
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  /* Render Payments module */
  const PaymentsModule = ({
    campaignToShow,
    clearCampaignToShow,
  }: {
    campaignToShow?: Campaign | null;
    clearCampaignToShow?: () => void;
  }) => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Payments</h2>

      <PaymentInfoForm payment={paymentInfo} onSave={savePaymentInfo} />

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-semibold">Payment Status</div>
            <div className="text-xs text-gray-500">
              Track payment progress for campaigns
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={searchPayments}
              onChange={(e) => setSearchPayments(e.target.value)}
              placeholder="Search by name or id"
              className="p-2 border rounded"
            />
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              className="p-2 border rounded"
            >
              <option>All</option>
              <option>Under Process</option>
              <option>Awaiting Approval</option>
              <option>Paid</option>
              <option>Initiated</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-400">
          {filteredPayments.length === 0 && (
            <div className="text-gray-500 p-4">
              No payments match your search / filter.
            </div>
          )}
          {filteredPayments.map((c) => (
            <div key={c.id} className="inline-block mr-3">
              <PaymentCard
                c={c}
                onRaiseTicket={(id) => raiseTicket(id)}
                onViewDetails={(cc) => {
                  setPaymentModalCampaign(cc);
                }}
              />
            </div>
          ))}
          {Array.from({
            length: Math.max(0, 10 - filteredPayments.length),
          }).map((_, i) => (
            <div key={"pay-pad-" + i} className="inline-block mr-3">
              <div
                className={`${cardMinWidth} ${cardHeight} bg-white/60 rounded-2xl p-4 border-dashed border-2 border-gray-200 text-gray-400 flex items-center justify-center`}
              >
                Placeholder
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Tickets</h4>
        <TicketsView tickets={tickets} onAddMessage={addMessageToTicket} />
      </div>

      {/* Payment Details Modal - opens when campaignToShow is provided */}
      <Modal
        open={!!campaignToShow}
        onClose={() => {
          if (clearCampaignToShow) clearCampaignToShow();
        }}
        title="Payment Details"
      >
        {campaignToShow && (
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <b>Campaign:</b> {campaignToShow.name}
            </div>
            <div>
              <b>ID:</b> {campaignToShow.id}
            </div>
            <div>
              <b>Amount:</b> {campaignToShow.amount ?? "₹ —"}
            </div>
            <div>
              <b>Status:</b> {campaignToShow.paymentStatus ?? "Under Process"}
            </div>
            <div>
              <b>Transaction ID:</b> TXN-{campaignToShow.id.slice(-4)}-XYZ
            </div>
            <div>
              <b>Mode:</b> Bank Transfer
            </div>
            <div>
              <b>Invoice Date:</b>{" "}
              {new Date(Date.now() - 86400000 * 2).toLocaleDateString()}
            </div>
            <div>
              <b>Expected Date:</b>{" "}
              {new Date(Date.now() + 86400000 * 5).toLocaleDateString()}
            </div>

            <div className="pt-3 flex justify-end gap-3">
              <button
                onClick={() => alert("Invoice download started (demo)")}
                className="px-3 py-1 bg-indigo-500 text-white rounded"
              >
                Download Invoice
              </button>
              <button
                onClick={() => {
                  raiseTicket(campaignToShow.id);
                  alert("Ticket raised (demo)");
                }}
                className="px-3 py-1 border rounded"
              >
                Raise Ticket
              </button>
            </div>

            <div className="pt-3 text-center text-gray-500 italic">
              Thank you for your collaboration. Payment is being processed as
              per schedule.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
  /* Creator Directory module render */
  const CreatorDirectoryModule = () => (
    <CreatorDirectory
      profile={profile}
      onSaveProfile={saveProfileSection}
      socials={socials}
      onUpdateSocials={updateSocials}
    />
  );
  /* Performance module (placeholder) */
  const PerformanceModule = () => (
    <div>
      <h2 className="text-lg font-semibold">Performance</h2>
      <div className="bg-white rounded-lg shadow p-4 mt-3">
        Performance metrics placeholder (will link from posted campaigns).
      </div>
    </div>
  );
  /* Selected module render switch */
  const renderSelected = () => {
    switch (selectedModule) {
      case "Creator Directory":
        return <CreatorDirectoryModule />;
      case "Communication":
        return (
          <>
            <CommunicationsModule
              campaigns={campaigns}
              openBrief={openBriefModal}
              activeChatCampaignId={activeChatCampaignId}
              openChat={openChat}
            />
          </>
        );
      case "Campaigns & Contracts":
        return renderCampaignsModule();
      case "Payments":
        return (
          <>
            <PaymentsModule
              campaignToShow={paymentModalCampaign}
              clearCampaignToShow={() => setPaymentModalCampaign(null)}
            />
          </>
        );
      case "Performance":
        return <PerformanceModule />;
      default:
        return <div>Not implemented</div>;
    }
  };

  /* Brief modal & progress popup components usage */
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header role={role} />

        <div className="flex flex-1">
          <Sidebar
            modules={modules}
            selected={selectedModule}
            onSelect={(m) => {
              setSelectedModule(m);
              setSelectedSub(subitems[m][0]);
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
                  {selectedModule} —{" "}
                  <span className="text-indigo-600">{selectedSub}</span>
                </h1>
                <div className="text-sm text-gray-600">Creator Dashboard</div>
              </div>

              <div>{renderSelected()}</div>

              <div className="mt-8 text-xs text-gray-400">
                This is a mock UI. All actions update local state only.
              </div>
            </div>
          </main>
        </div>

        {/* Brief Modal */}
        <Modal
          open={briefOpen}
          onClose={closeBriefModal}
          title={briefCampaign ? `Brief — ${briefCampaign.name}` : "Brief"}
          size="lg"
        >
          <BriefModalContent campaign={briefCampaign} />
        </Modal>

        {/* Progress Popup */}
        <Modal
          open={progressPopup.open}
          onClose={() => setProgressPopup({ open: false, campaign: null })}
          title={
            progressPopup.campaign
              ? `Progress — ${progressPopup.campaign.name}`
              : "Progress"
          }
          size="md"
        >
          <ProgressPopupContent campaign={progressPopup.campaign} />
        </Modal>
      </div>
    </>
  );
}
