import React, { useEffect, useMemo, useState } from "react";
import "./index.css";

/**
 * Updated Creator Portal - App.tsx
 * - Keeps the original large portal and theme
 * - Combines Campaigns & Contracts into one section with horizontal card scroller
 * - Combines Payments into one section with horizontal card scroller
 * - Communication remains unchanged
 *
 * Drop into CodeSandbox / Replit TypeScript React + Tailwind template.
 */

/* ---------------------------
   Types & Mock Data
   --------------------------- */

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
    stage: "Content Submitted",
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
    stage: "Accepted",
    createdAt: now - 1000 * 60 * 60 * 24,
    brief:
      "Review a sustainable gadget. Deliverables: 1 unboxing + 1 tutorial video. Focus on eco benefits.",
    isBroadcast: false,
    paymentStatus: "Awaiting Approval",
    updateRequest: {
      id: "UR-101",
      status: "In Process",
      note: "Change thumbnail frame",
    },
  },
  {
    id: "CID-1003",
    name: "Winter Skincare Broadcast",
    poc: "Campaign Team",
    timelineAgo: "3 hours ago",
    stage: undefined,
    createdAt: now - 1000 * 60 * 60 * 3,
    brief:
      "Open broadcast: Winter skincare line. Creators can enroll by clicking Interested.",
    isBroadcast: true,
  },
  {
    id: "CID-1004",
    name: "Smart Home Launch",
    poc: "Sonal Gupta",
    timelineAgo: "10 days ago",
    stage: "Content Posted",
    createdAt: now - 1000 * 60 * 60 * 24 * 10,
    brief:
      "Smart home device launch. Deliverable posted. Link to performance dashboard included.",
    isBroadcast: false,
    paymentStatus: "Paid",
  },
];

const seedTickets: Ticket[] = [
  {
    id: "T-001",
    campaignId: "CID-1004",
    subject: "Payment delayed — Smart Home Launch",
    status: "Under Process",
    messages: [
      {
        from: "Creator",
        text: "Payment not received yet for CID-1004",
        time: now - 1000 * 60 * 60 * 24,
      },
      {
        from: "Support",
        text: "Escalated to finance. Checking.",
        time: now - 1000 * 60 * 60 * 20,
      },
    ],
    createdAt: now - 1000 * 60 * 60 * 24,
  },
  {
    id: "T-002",
    campaignId: "CID-1001",
    subject: "Request for asset change",
    status: "Resolved",
    messages: [
      {
        from: "Creator",
        text: "Need clarification on logo placement.",
        time: now - 1000 * 60 * 60 * 10,
      },
      {
        from: "Support",
        text: "Updated brief and shared assets.",
        time: now - 1000 * 60 * 60 * 9,
      },
    ],
    createdAt: now - 1000 * 60 * 60 * 10,
  },
];

/* ---------------------------
   Helpers
   --------------------------- */

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ---------------------------
   UI: Header & Sidebar (unchanged theme)
   --------------------------- */

const Header: React.FC<{ role: Role }> = ({ role }) => {
  return (
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
}> = ({
  modules,
  selected,
  onSelect,
  subitems,
  selectedSub,
  onSelectSub,
  role,
  setRole,
}) => {
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
  );
};

/* ---------------------------
   Creator Directory components
   --------------------------- */

const ProfileSection: React.FC<{
  profile: typeof initialProfile;
  onSaveSection: (
    section: string,
    newData: Partial<typeof initialProfile>
  ) => void;
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
            <div className="mt-1 p-2 border rounded bg-gray-50">
              {profile.name}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Email</label>
            <div className="mt-1 p-2 border rounded bg-gray-50">
              {profile.email}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Phone</label>
            {editing.contact ? (
              <input
                value={local.phone}
                onChange={(e) =>
                  setLocal((l) => ({ ...l, phone: e.target.value }))
                }
                className="mt-1 p-2 border rounded w-full"
              />
            ) : (
              <div className="mt-1 p-2 border rounded bg-gray-50">
                {profile.phone}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">
              Creator Type
            </label>
            {editing.contact ? (
              <input
                value={local.creatorType}
                onChange={(e) =>
                  setLocal((l) => ({ ...l, creatorType: e.target.value }))
                }
                className="mt-1 p-2 border rounded w-full"
              />
            ) : (
              <div className="mt-1 p-2 border rounded bg-gray-50">
                {profile.creatorType}
              </div>
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
                onSaveSection("contact", {
                  phone: local.phone,
                  creatorType: local.creatorType,
                });
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

const SocialLinks: React.FC<{
  socials: typeof initialSocials;
  onUpdate: (s: typeof initialSocials) => void;
}> = ({ socials, onUpdate }) => {
  const [local, setLocal] = useState(socials);
  useEffect(() => setLocal(socials), [socials]);

  const verifyInstagram = () => {
    const confirmed = window.confirm(
      "Simulate Instagram verification: allow connecting @instagram?"
    );
    if (confirmed) {
      setLocal((l) => ({
        ...l,
        instagram: { ...l.instagram, verified: true },
      }));
      onUpdate({ ...local, instagram: { ...local.instagram, verified: true } });
    }
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
            <label className="text-xs font-medium text-gray-500">
              Instagram
            </label>
            <div className="flex items-center gap-2 mt-2">
              <input
                className="p-2 border rounded w-full"
                value={local.instagram.handle}
                onChange={(e) =>
                  setLocal((l) => ({
                    ...l,
                    instagram: { ...l.instagram, handle: e.target.value },
                  }))
                }
              />
              <button
                onClick={verifyInstagram}
                className="px-3 py-2 bg-amber-400 rounded text-white"
              >
                {local.instagram.verified ? "Verified" : "Verify"}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">
              Facebook
            </label>
            <input
              className="mt-2 p-2 border rounded w-full"
              value={local.facebook.handle}
              onChange={(e) =>
                setLocal((l) => ({
                  ...l,
                  facebook: { ...l.facebook, handle: e.target.value },
                }))
              }
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Threads</label>
            <input
              className="mt-2 p-2 border rounded w-full"
              value={local.threads.handle}
              onChange={(e) =>
                setLocal((l) => ({
                  ...l,
                  threads: { ...l.threads, handle: e.target.value },
                }))
              }
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">TikTok</label>
            <input
              className="mt-2 p-2 border rounded w-full"
              value={local.tiktok.handle}
              onChange={(e) =>
                setLocal((l) => ({
                  ...l,
                  tiktok: { ...l.tiktok, handle: e.target.value },
                }))
              }
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

/* ---------------------------
   Communication components (unchanged)
   --------------------------- */

const CampaignChatList: React.FC<{
  campaigns: Campaign[];
  onOpenChat: (c: Campaign) => void;
  search: string;
}> = ({ campaigns, onOpenChat, search }) => {
  const filtered = campaigns.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-3">
      {filtered.map((c) => (
        <div
          key={c.id}
          className="p-3 bg-white rounded-lg shadow flex items-center justify-between"
        >
          <div>
            <div className="font-semibold">{c.name}</div>
            <div className="text-xs text-gray-500">
              {c.id} • {c.poc}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">{c.timelineAgo}</div>
            <button
              onClick={() => onOpenChat(c)}
              className="px-3 py-1 bg-indigo-600 text-white rounded"
            >
              Open Chat
            </button>
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div className="text-gray-500">No campaigns found.</div>
      )}
    </div>
  );
};

const ChatWindow: React.FC<{
  campaign: Campaign | null;
  onSend: (msg: string) => void;
  messages: { from: "Creator" | "User"; text: string; time: number }[];
  onClose: () => void;
}> = ({ campaign, onSend, messages, onClose }) => {
  const [text, setText] = useState("");
  useEffect(() => setText(""), [campaign]);
  if (!campaign) return null;
  return (
    <div className="bg-white rounded-lg shadow p-4 w-full max-w-3xl">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-semibold">{campaign.name}</div>
          <div className="text-xs text-gray-500">
            {campaign.id} • POC: {campaign.poc}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded border">
            Close
          </button>
        </div>
      </div>

      <div className="border rounded p-3 h-72 overflow-auto mb-3 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded ${
              m.from === "Creator" ? "bg-indigo-50 self-end" : "bg-gray-100"
            }`}
          >
            <div className="text-sm">
              <b>{m.from}</b>
            </div>
            <div className="text-sm">{m.text}</div>
            <div className="text-xs text-gray-400 mt-1">{timeAgo(m.time)}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          className="flex-1 p-2 border rounded"
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
        <label className="px-3 py-1 border rounded cursor-pointer">
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
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

const BroadcastList: React.FC<{
  campaigns: Campaign[];
  onRespond: (id: string, interested: boolean) => void;
}> = ({ campaigns, onRespond }) => {
  const broadcasts = campaigns.filter((c) => c.isBroadcast);
  if (broadcasts.length === 0)
    return <div className="text-gray-500">No broadcasts</div>;
  return (
    <div className="space-y-3">
      {broadcasts.map((b) => (
        <div key={b.id} className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold">{b.name}</div>
              <div className="text-xs text-gray-500">
                {b.id} • {b.poc}
              </div>
              <p className="mt-2 text-sm text-gray-600">{b.brief}</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <button
                onClick={() => onRespond(b.id, true)}
                className="px-3 py-1 bg-green-500 text-white rounded"
              >
                Interested
              </button>
              <button
                onClick={() => onRespond(b.id, false)}
                className="px-3 py-1 border rounded"
              >
                Not Interested
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ---------------------------
   Campaigns & Contracts: Combined Horizontal Card Scroller
   --------------------------- */

const CampaignCard: React.FC<{
  c: Campaign;
  onOpenBrief: (c: Campaign) => void;
  onViewProgress: (c: Campaign) => void;
}> = ({ c, onOpenBrief, onViewProgress }) => {
  return (
    <div className="min-w-[340px] bg-white rounded-2xl p-4 shadow-lg border hover:shadow-2xl transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-lg">{c.name}</div>
          <div className="text-xs text-gray-500">
            {c.id} • {c.poc}
          </div>
        </div>
        <div className="text-sm text-gray-500">{c.timelineAgo}</div>
      </div>

      <div className="mt-3">
        <div className="text-sm text-gray-600">
          {c.brief.slice(0, 120)}
          {c.brief.length > 120 ? "..." : ""}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div
          className={`text-xs px-2 py-1 rounded ${
            c.stage
              ? "bg-indigo-50 text-indigo-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {c.stage ?? (c.isBroadcast ? "Broadcast" : "Invite")}
        </div>
        {c.updateRequest && (
          <div
            className={`text-xs px-2 py-1 rounded ${
              c.updateRequest.status === "In Process"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {c.updateRequest.status}
          </div>
        )}
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
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onOpenBrief(c)}
          className="px-3 py-1 bg-indigo-600 text-white rounded"
        >
          Open Brief
        </button>
        <button
          onClick={() => onViewProgress(c)}
          className="px-3 py-1 border rounded"
        >
          View Progress
        </button>
      </div>
    </div>
  );
};

/* ---------------------------
   Payments: Combined Horizontal Card Scroller
   --------------------------- */

const PaymentCard: React.FC<{
  c: Campaign;
  onRaiseTicket: (campaignId?: string) => void;
}> = ({ c, onRaiseTicket }) => {
  return (
    <div className="min-w-[320px] bg-white rounded-2xl p-4 shadow-lg border hover:shadow-2xl transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold">{c.name}</div>
          <div className="text-xs text-gray-500">
            {c.id} • {c.poc}
          </div>
        </div>
        <div className="text-sm text-gray-500">{c.timelineAgo}</div>
      </div>

      <div className="mt-3 text-sm text-gray-600">
        Payment Status:{" "}
        <span className="font-medium">{c.paymentStatus ?? "N/A"}</span>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onRaiseTicket(c.id)}
          className="px-3 py-1 bg-red-50 text-red-700 rounded"
        >
          Raise Ticket
        </button>
        <button
          onClick={() => alert(`View payment details for ${c.id}`)}
          className="px-3 py-1 border rounded"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

/* ---------------------------
   Payments: Tickets view
   --------------------------- */

const TicketsView: React.FC<{
  tickets: Ticket[];
  onAddMessage: (ticketId: string, text: string) => void;
}> = ({ tickets, onAddMessage }) => {
  const [openTicket, setOpenTicket] = useState<Ticket | null>(
    tickets[0] ?? null
  );
  const [msg, setMsg] = useState("");
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="col-span-1">
        <div className="p-3 bg-white rounded-lg shadow">
          <h4 className="font-semibold mb-2">Tickets</h4>
          <div className="space-y-2">
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => setOpenTicket(t)}
                className={`block w-full text-left p-2 rounded ${
                  openTicket?.id === t.id ? "bg-indigo-50" : "hover:bg-gray-100"
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
          {openTicket ? (
            <>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <div className="font-semibold">{openTicket.subject}</div>
                  <div className="text-xs text-gray-500">
                    {openTicket.id} • {openTicket.campaignId ?? "General"}
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded ${
                    openTicket.status === "Resolved"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {openTicket.status}
                </div>
              </div>

              <div className="h-64 overflow-auto border rounded p-3 space-y-2 mb-3">
                {openTicket.messages.map((m, i) => (
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
                    if (msg.trim()) {
                      onAddMessage(openTicket.id, msg.trim());
                      setMsg("");
                    }
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
  );
};

/* ---------------------------
   Performance (unchanged placeholder)
   --------------------------- */

const PerformanceView: React.FC<{
  campaigns: Campaign[];
  onOpenCampaignPerf: (campaignId: string) => void;
}> = ({ campaigns, onOpenCampaignPerf }) => {
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
            <div
              key={c.id}
              className="p-3 bg-white rounded-lg shadow flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-gray-500">{c.id}</div>
              </div>
              <div>
                <button
                  onClick={() => onOpenCampaignPerf(c.id)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded"
                >
                  Open
                </button>
              </div>
            </div>
          ))}
          {posted.length === 0 && (
            <div className="text-gray-500">No posted content yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------------------------
   Main App
   --------------------------- */

export default function App() {
  const [role, setRole] = useState<Role>("Creator");

  const modules = [
    "Creator Directory",
    "Communication",
    "Campaigns & Contracts",
    "Payments",
    "Performance",
  ];
  const subitems: Record<string, string[]> = {
    "Creator Directory": ["View / Update Profile", "Add Social Media Links"],
    Communication: ["Campaign Chat", "Notifications", "Broadcast"],
    "Campaigns & Contracts": ["All Campaigns & Contracts"],
    Payments: ["All Payments & Tickets"],
    Performance: ["Post Engagement", "Contracts", "Payments"],
  };

  const [selectedModule, setSelectedModule] =
    useState<string>("Creator Directory");
  const [selectedSub, setSelectedSub] = useState<string>(
    "View / Update Profile"
  );

  const [profile, setProfile] = useState(initialProfile);
  const [socials, setSocials] = useState(initialSocials);
  const [campaigns, setCampaigns] = useState<Campaign[]>(seedCampaigns);
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets);
  const [paymentInfo, setPaymentInfo] = useState({
    account: "XXXXXXXXXXXX1234",
    ifsc: "HDFC0001234",
    taxDocument: "PAN.pdf",
  });

  // Chat state
  const [openChatCampaign, setOpenChatCampaign] = useState<Campaign | null>(
    null
  );
  const [chatMessages, setChatMessages] = useState<
    { from: "Creator" | "User"; text: string; time: number }[]
  >([
    {
      from: "User",
      text: "Welcome! Please upload your draft.",
      time: now - 1000 * 60 * 60 * 5,
    },
  ]);
  const [chatSearch, setChatSearch] = useState("");

  useEffect(() => {}, [campaigns]);

  const saveProfileSection = (
    section: string,
    data: Partial<typeof initialProfile>
  ) => {
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
    setCampaigns((cs) =>
      cs.map((c) => (c.id === id ? { ...c, interested } : c))
    );
    alert(
      `You marked ${interested ? "Interested" : "Not Interested"} for ${id}`
    );
  };

  const openBrief = (c: Campaign) => {
    setSelectedModule("Campaigns & Contracts");
    setSelectedSub("All Campaigns & Contracts");
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
      subject: campaignId
        ? `Payment issue for ${campaignId}`
        : "General Payment Issue",
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

  const onSavePaymentInfo = (p: any) => {
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

  /* ---------------------------
     Render content per selected module/sub
     --------------------------- */

  const renderContent = () => {
    switch (selectedModule) {
      case "Creator Directory":
        if (selectedSub === "View / Update Profile") {
          return (
            <div className="space-y-4">
              <ProfileSection
                profile={profile}
                onSaveSection={saveProfileSection}
              />
              <SocialLinks socials={socials} onUpdate={updateSocials} />
            </div>
          );
        }
        if (selectedSub === "Add Social Media Links") {
          return <SocialLinks socials={socials} onUpdate={updateSocials} />;
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
                  placeholder="Search campaigns by name or id"
                  className="p-2 border rounded flex-1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1">
                  <CampaignChatList
                    campaigns={campaigns}
                    onOpenChat={openChat}
                    search={chatSearch}
                  />
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
                    <div className="p-6 bg-white rounded-lg shadow">
                      Select a campaign to open chat
                    </div>
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
                    <button
                      className="text-left w-full"
                      onClick={() => {
                        setSelectedModule("Campaigns & Contracts");
                        setSelectedSub("All Campaigns & Contracts");
                      }}
                    >
                      • You have been invited to CID-1002 — review brief
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
          return (
            <BroadcastList campaigns={campaigns} onRespond={respondBroadcast} />
          );
        }
        break;

      case "Campaigns & Contracts":
        // NEW: Combined one-section view with horizontal scroller for campaign cards
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">All Campaigns & Contracts</h3>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500 mb-3">
                Horizontal scroller — each card is independent and scrolls
                inside this area.
              </div>
              <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-400">
                {campaigns.map((c) => (
                  <CampaignCard
                    key={c.id}
                    c={c}
                    onOpenBrief={openBrief}
                    onViewProgress={viewProgress}
                  />
                ))}
              </div>
            </div>

            {/* Optional detail sections below — e.g., update requests / quick filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg shadow">
                <div className="font-semibold mb-2">Broadcasts</div>
                {campaigns.filter((c) => c.isBroadcast).length === 0 && (
                  <div className="text-gray-500">No broadcasts</div>
                )}
                {campaigns
                  .filter((c) => c.isBroadcast)
                  .map((b) => (
                    <div key={b.id} className="py-2">
                      <div className="font-medium">{b.name}</div>
                      <div className="text-xs text-gray-500">{b.id}</div>
                    </div>
                  ))}
              </div>

              <div className="p-4 bg-white rounded-lg shadow">
                <div className="font-semibold mb-2">Update Requests</div>
                {campaigns.filter((c) => c.updateRequest).length === 0 && (
                  <div className="text-gray-500">No update requests</div>
                )}
                {campaigns
                  .filter((c) => c.updateRequest)
                  .map((c) => (
                    <div key={c.id} className="py-2">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-500">
                        {c.updateRequest!.status}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="p-4 bg-white rounded-lg shadow">
                <div className="font-semibold mb-2">Quick Actions</div>
                <button
                  onClick={() => alert("Export invites (mock)")}
                  className="px-3 py-1 bg-indigo-600 text-white rounded"
                >
                  Export Invites
                </button>
                <div className="mt-3">
                  <button
                    onClick={() => alert("Filter: recent")}
                    className="px-3 py-1 border rounded mr-2"
                  >
                    Recent
                  </button>
                  <button
                    onClick={() => alert("Filter: posted")}
                    className="px-3 py-1 border rounded"
                  >
                    Posted
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "Payments":
        // NEW: Combined Payments section with horizontal card scroller
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Payments</h3>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500 mb-3">
                Horizontal scroller — each payment card shows status and quick
                actions.
              </div>
              <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-400">
                {campaigns.map((c) => (
                  <PaymentCard
                    key={c.id}
                    c={c}
                    onRaiseTicket={(id) => raiseTicket(id)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Tickets</h4>
              <TicketsView
                tickets={tickets}
                onAddMessage={addMessageToTicket}
              />
            </div>
          </div>
        );

      case "Performance":
        return (
          <PerformanceView
            campaigns={campaigns}
            onOpenCampaignPerf={onOpenCampaignPerf}
          />
        );

      default:
        return <div>Not implemented</div>;
    }
  };

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
