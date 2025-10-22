// App.tsx — COMBINED (PART 1 of 2)
// Paste Part 1, then Part 2 right after in the same file.

import React, { useEffect, useMemo, useState } from "react";
import "./index.css";

/**
 * Creator Portal — Final combined App.tsx (Part 1)
 *
 * - Full single-file UI split across two messages (Part 1 then Part 2)
 * - Tailwind CSS assumed
 *
 * Part 1 contains: types, helpers, mock data, Header, Sidebar, Modal, CreatorDirectory,
 * Communications, Notifications, and shared bits used by Part 2.
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

type NotificationItem = {
  id: string;
  text: string;
  time: number;
  read?: boolean;
  type?: "payment" | "invite" | "update" | "system";
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
   Mock Data (campaigns, notifications, tickets)
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
  // 10 available
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
      isNew: i < 3,
    });
  }
  // 6 ongoing
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
  // 4 completed
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
  // add some update requests to few
  if (campaigns[12]) {
    campaigns[12].updateRequests = [
      {
        id: "UR-101",
        from: "creator",
        message: "Please update logo placement.",
        time: now - 1000 * 60 * 60 * 24,
      },
    ];
  }
  if (campaigns[3]) {
    campaigns[3].updateRequests = [
      {
        id: "UR-102",
        from: "creator",
        message: "Need higher res asset for thumbnail.",
        time: now - 1000 * 60 * 60 * 6,
      },
    ];
  }
  return campaigns;
}

/* Notifications */
function makeNotifications() {
  const list: NotificationItem[] = [
    {
      id: "N-001",
      text: "Payment processed for CID-1009",
      time: now - 1000 * 60 * 60 * 24 * 3,
      type: "payment",
    },
    {
      id: "N-002",
      text: "New invite: Autumn Fashion Drop #1",
      time: now - 1000 * 60 * 60 * 24 * 5,
      type: "invite",
    },
    {
      id: "N-003",
      text: "Payment under process for CID-1101",
      time: now - 1000 * 60 * 60 * 24 * 1,
      type: "payment",
    },
    {
      id: "N-004",
      text: "Update request resolved for CID-1012",
      time: now - 1000 * 60 * 60 * 36,
      type: "update",
    },
    {
      id: "N-005",
      text: "Campaign accepted: Smart Home Launch - Run 1",
      time: now - 1000 * 60 * 60 * 72,
      type: "system",
    },
    {
      id: "N-006",
      text: "New invite: Eco Gadget Review #3",
      time: now - 1000 * 60 * 60 * 24 * 2,
      type: "invite",
    },
    {
      id: "N-007",
      text: "Payment received for CID-2001",
      time: now - 1000 * 60 * 60 * 24 * 7,
      type: "payment",
    },
    {
      id: "N-008",
      text: "Ticket T-005 updated by Support",
      time: now - 1000 * 60 * 60 * 12,
      type: "system",
    },
    {
      id: "N-009",
      text: "New invite: Winter Skincare Invite #2",
      time: now - 1000 * 60 * 60 * 24 * 4,
      type: "invite",
    },
    {
      id: "N-010",
      text: "Payment initiation for CID-1010",
      time: now - 1000 * 60 * 60 * 48,
      type: "payment",
    },
    {
      id: "N-011",
      text: "Campaign brief updated: Fitness App Collab",
      time: now - 1000 * 60 * 60 * 18,
      type: "update",
    },
    {
      id: "N-012",
      text: "Reminder: Submit draft for CID-1003",
      time: now - 1000 * 60 * 60 * 6,
      type: "system",
    },
    {
      id: "N-013",
      text: "Payment delay notification: CID-1103",
      time: now - 1000 * 60 * 60 * 24 * 9,
      type: "payment",
    },
    {
      id: "N-014",
      text: "New invite: Home Decor Series #5",
      time: now - 1000 * 60 * 60 * 24 * 11,
      type: "invite",
    },
    {
      id: "N-015",
      text: "Support message: Ticket T-002 resolved",
      time: now - 1000 * 60 * 60 * 30,
      type: "system",
    },
  ];
  return list;
}

/* ---------------------------
   Components (Part 1)
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
);

/* Sidebar */
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
);

/* Modal (centered) */
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
  );
};

/* Uniform card sizes */
const cardMinWidth = "min-w-[360px]";
const cardHeight = "h-56";

/* Creator Directory component (profile + socials) */
const socialsDefault = {
  instagram: { handle: "@creator_ig", verified: false },
  facebook: { handle: "Creator FB" },
  threads: { handle: "@creator_threads" },
  tiktok: { handle: "@creator_tt" },
};

const CreatorDirectory: React.FC<{
  profile: any;
  onSaveProfile: (section: string, data: any) => void;
  socials: any;
  onUpdateSocials: (s: any) => void;
}> = ({ profile, onSaveProfile, socials, onUpdateSocials }) => {
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [localProfile, setLocalProfile] = useState(profile);
  const [localSocials, setLocalSocials] = useState(socials);
  const [verifyOpen, setVerifyOpen] = useState(false);

  useEffect(() => setLocalProfile(profile), [profile]);
  useEffect(() => setLocalSocials(socials), [socials]);

  const confirmInstagram = () => {
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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Creator Directory</h2>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Profile</div>
          <div>
            <button
              onClick={() => setEditing((s) => ({ ...s, profile: !s.profile }))}
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
                  setLocalProfile((l: any) => ({ ...l, phone: e.target.value }))
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

      {/* Socials */}
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
                onClick={() => setVerifyOpen(true)}
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
              setLocalSocials(socialsDefault);
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

      {/* Instagram verify modal */}
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
    </div>
  );
};

/* Communications Module (unchanged core) */
const CommunicationsModule: React.FC<{
  campaigns: Campaign[];
  onOpenCampaignChat: (campaignId: string) => void;
  notifications: NotificationItem[];
}> = ({ campaigns, onOpenCampaignChat, notifications }) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<
    { from: "Creator" | "User"; text: string; time: number }[]
  >([
    {
      from: "User",
      text: "Welcome to campaign chat (demo)",
      time: now - 1000 * 60 * 60 * 5,
    },
  ]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (selectedCampaignId) {
      onOpenCampaignChat(selectedCampaignId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaignId]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Communication</h2>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="font-semibold">Campaigns</div>
            <div className="mt-3 space-y-2 max-h-96 overflow-auto">
              {campaigns.map((c) => (
                <div
                  key={c.id}
                  className="p-2 rounded hover:bg-gray-100 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-sm">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.id}</div>
                  </div>
                  <div>
                    {/* Only show Open Chat if campaign is accepted (ongoing) */}
                    {c.stage && c.stage !== "Post Approval" ? (
                      <button
                        onClick={() => setSelectedCampaignId(c.id)}
                        className="px-2 py-1 bg-indigo-600 text-white rounded text-xs"
                      >
                        Open Chat
                      </button>
                    ) : (
                      <div className="text-xs text-gray-400">No chat</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="font-semibold">Chat</div>
            <div className="mt-3 p-4 bg-gray-50 rounded h-72 overflow-auto">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`mb-2 p-2 rounded ${
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

            <div className="mt-3 flex items-center gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={() => {
                  if (!text.trim()) return;
                  setMessages((s) => [
                    ...s,
                    { from: "Creator", text: text.trim(), time: Date.now() },
                  ]);
                  setText("");
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Notifications</div>
            <div className="text-xs text-gray-500">
              System alerts and updates
            </div>
          </div>
          <div>
            <button
              onClick={() => alert("Mark all read (demo)")}
              className="px-3 py-1 border rounded text-sm"
            >
              Mark all read
            </button>
          </div>
        </div>

        <div className="mt-3 max-h-64 overflow-auto space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => alert(`${n.text} — ${timeAgo(n.time)}`)}
              className="w-full text-left p-3 rounded hover:bg-gray-50 flex items-center justify-between"
            >
              <div>
                <div className="text-sm">{n.text}</div>
                <div className="text-xs text-gray-400">{timeAgo(n.time)}</div>
              </div>
              <div className="text-xs text-gray-500">{n.type}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Broadcast (blank) */}
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No broadcasts available right now.
      </div>
    </div>
  );
};

/* ---------------------------
   End of Part 1
   Part 2 will continue with Campaigns, Payments, Modals, and full App wiring.
----------------------------*/
// App.tsx — COMBINED (PART 2 of 2)
// Paste this right after Part 1 in the same file.

const progressSteps = [
  "Accepted",
  "Content Sent",
  "Approval",
  "Content Posted Confirmation Sent",
  "Post Approval",
];

const getStageIndex = (stage?: string) =>
  progressSteps.findIndex((s) => s === stage);

/* Payment Detail Modal */
const PaymentDetailModal: React.FC<{
  open: boolean;
  onClose: () => void;
  campaign?: Campaign;
}> = ({ open, onClose, campaign }) => {
  if (!open || !campaign) return null;
  return (
    <Modal open={open} onClose={onClose} title="Payment Details" size="md">
      <div className="space-y-3 text-sm text-gray-700">
        <div>
          <b>Campaign:</b> {campaign.name}
        </div>
        <div>
          <b>Campaign ID:</b> {campaign.id}
        </div>
        <div>
          <b>Amount:</b> {campaign.amount || "₹ —"}
        </div>
        <div>
          <b>Status:</b> {campaign.paymentStatus || "Under Process"}
        </div>
        <div>
          <b>Transaction ID:</b> TXN-{campaign.id.slice(-4)}-XYZ
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
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => alert("Ticket raised (demo)")}
            className="px-3 py-1 bg-indigo-600 text-white rounded"
          >
            Raise Ticket
          </button>
        </div>
      </div>
    </Modal>
  );
};

/* Campaigns & Contracts */
const CampaignsContracts: React.FC<{
  campaigns: Campaign[];
  setCampaigns: (c: Campaign[]) => void;
  openChat: (cid: string) => void;
  openPayment: (c: Campaign) => void;
}> = ({ campaigns, setCampaigns, openChat, openPayment }) => {
  const [filter, setFilter] = useState("All");
  const [briefOpen, setBriefOpen] = useState<Campaign | null>(null);
  const [reasonModal, setReasonModal] = useState(false);
  const [reasonText, setReasonText] = useState("");
  const [updateModal, setUpdateModal] = useState(false);
  const [updateMsg, setUpdateMsg] = useState("");

  const ongoing = campaigns.filter(
    (c) => c.stage && c.stage !== "Post Approval"
  );
  const available = campaigns.filter((c) => !c.stage && !c.declined);
  const updateReq = campaigns.filter((c) => c.updateRequests?.length);
  const completed = campaigns.filter(
    (c) => c.stage === "Post Approval" || c.declined
  );

  const handleAccept = (c: Campaign) => {
    setCampaigns(
      campaigns.map((x) =>
        x.id === c.id ? { ...x, stage: "Accepted", isNew: false } : x
      )
    );
    setBriefOpen(null);
  };

  const handleDecline = (c: Campaign) => {
    setReasonModal(true);
    setReasonText("");
    setBriefOpen(c);
  };

  const confirmDecline = () => {
    if (!briefOpen) return;
    setCampaigns(
      campaigns.map((x) =>
        x.id === briefOpen.id
          ? {
              ...x,
              declined: { reason: reasonText, by: "creator", time: Date.now() },
              isNew: false,
            }
          : x
      )
    );
    setReasonModal(false);
    setBriefOpen(null);
  };

  const handleUpdate = (c: Campaign) => {
    setUpdateModal(true);
    setUpdateMsg("");
    setBriefOpen(c);
  };

  const sendUpdate = () => {
    if (!briefOpen) return;
    const req = {
      id: `UR-${Math.floor(Math.random() * 999)}`,
      from: "creator",
      message: updateMsg,
      time: Date.now(),
    };
    setCampaigns(
      campaigns.map((x) =>
        x.id === briefOpen.id
          ? {
              ...x,
              updateRequests: [...(x.updateRequests || []), req],
              isNew: false,
            }
          : x
      )
    );
    setUpdateModal(false);
    setBriefOpen(null);
  };

  const CardStrip = ({
    title,
    data,
    filterable,
  }: {
    title: string;
    data: Campaign[];
    filterable?: boolean;
  }) => {
    const [search, setSearch] = useState("");
    const visible = useMemo(
      () =>
        data
          .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
          .filter((c) =>
            filterable ? withinRange(c.createdAt, filter) : true
          ),
      [data, search, filter, filterable]
    );

    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{title}</h3>
          <div className="flex items-center gap-2">
            {filterable && (
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                {["Today", "This Week", "This Month", "This Year", "All"].map(
                  (f) => (
                    <option key={f}>{f}</option>
                  )
                )}
              </select>
            )}
            <input
              placeholder="Search…"
              className="border rounded px-2 py-1 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {visible.map((c) => (
            <div
              key={c.id}
              className={`bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-100 rounded-xl shadow ${cardMinWidth} ${cardHeight} p-4 flex flex-col justify-between`}
            >
              <div>
                <div className="font-semibold text-indigo-800">{c.name}</div>
                <div className="text-xs text-gray-500">{c.id}</div>
                <div className="text-xs text-gray-500 mt-1">POC: {c.poc}</div>
                {c.isNew && (
                  <div className="mt-1 inline-block bg-green-500 text-white text-xs px-2 rounded">
                    NEW
                  </div>
                )}
                {c.stage && title === "Ongoing Campaigns" && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Progress</div>
                    <div className="flex items-center gap-1">
                      {progressSteps.map((s, i) => (
                        <div
                          key={s}
                          className={`flex-1 h-1 rounded ${
                            i <= getStageIndex(c.stage)
                              ? "bg-indigo-600"
                              : "bg-gray-200"
                          }`}
                        ></div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {c.stage}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 flex justify-between items-center">
                <button
                  onClick={() => setBriefOpen(c)}
                  className="text-sm px-3 py-1 bg-indigo-600 text-white rounded"
                >
                  Open Brief
                </button>

                {title === "Ongoing Campaigns" && (
                  <button
                    onClick={() => openChat(c.id)}
                    className="text-sm px-3 py-1 border rounded"
                  >
                    Open Chat
                  </button>
                )}

                {title === "Completed & Declined" && (
                  <button
                    onClick={() => openPayment(c)}
                    className="text-sm px-3 py-1 border rounded"
                  >
                    Payment Status
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Campaigns & Contracts</h2>
      <CardStrip title="Ongoing Campaigns" data={ongoing} />
      <CardStrip
        title="Available & New Opportunities"
        data={available}
        filterable
      />
      <CardStrip title="Update Requests" data={updateReq} />
      <CardStrip title="Completed & Declined" data={completed} />

      {/* Brief Modal */}
      <Modal
        open={!!briefOpen}
        onClose={() => setBriefOpen(null)}
        title="Campaign Brief"
        size="lg"
      >
        {briefOpen && (
          <div className="whitespace-pre-wrap text-gray-700 space-y-3 text-sm">
            <p>
              Dear Creator,
              <br />
              <br />
              We’re thrilled to invite you to collaborate on{" "}
              <b>{briefOpen.name}</b>. Below are the key details.
            </p>
            <p>
              <b>Deliverables:</b> {briefOpen.deliverables}
              <br />
              <b>Offer Amount:</b> {briefOpen.amount}
              <br />
              <b>Offering:</b> {briefOpen.offering}
            </p>
            <p>{briefOpen.brief}</p>
            <p>
              Regards,
              <br />
              Microsoft Campaign Team
            </p>

            {!briefOpen.stage && !briefOpen.declined && (
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => handleAccept(briefOpen)}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(briefOpen)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleUpdate(briefOpen)}
                  className="px-3 py-1 bg-amber-500 text-white rounded"
                >
                  Update Request
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Decline Modal */}
      <Modal
        open={reasonModal}
        onClose={() => setReasonModal(false)}
        title="Decline Reason"
        size="sm"
      >
        <textarea
          rows={4}
          className="w-full border rounded p-2"
          placeholder="Enter reason..."
          value={reasonText}
          onChange={(e) => setReasonText(e.target.value)}
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={confirmDecline}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            Submit
          </button>
        </div>
      </Modal>

      {/* Update Modal */}
      <Modal
        open={updateModal}
        onClose={() => setUpdateModal(false)}
        title="Update Request"
        size="sm"
      >
        {briefOpen && (
          <div className="text-sm">
            <div className="mb-2">
              <b>To:</b> {briefOpen.poc}
            </div>
            <textarea
              rows={4}
              className="w-full border rounded p-2"
              placeholder="Write your message…"
              value={updateMsg}
              onChange={(e) => setUpdateMsg(e.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={sendUpdate}
                className="px-3 py-1 bg-indigo-600 text-white rounded"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

/* Main App */
const App: React.FC = () => {
  const [role, setRole] = useState<Role>("Creator");
  const modules = [
    "Creator Directory",
    "Communication",
    "Campaigns & Contracts",
    "Payments",
    "Performance",
  ];
  const subitems: Record<string, string[]> = {
    "Creator Directory": ["Profile"],
    Communication: ["Chat & Notifications"],
    "Campaigns & Contracts": ["Overview"],
    Payments: ["Payment Info", "Status & Tickets"],
    Performance: ["Overview"],
  };
  const [selected, setSelected] = useState("Creator Directory");
  const [selectedSub, setSelectedSub] = useState("Profile");
  const [campaigns, setCampaigns] = useState(makeMockCampaigns());
  const [notifications] = useState<NotificationItem[]>(makeNotifications());
  const [profile, setProfile] = useState({
    name: "Rohan Sharma",
    email: "rohan@example.com",
    phone: "9876543210",
    creatorType: "Tech Reviewer",
    bio: "Creating content that bridges tech and lifestyle.",
  });
  const [socials, setSocials] = useState(socialsDefault);
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentCampaign, setPaymentCampaign] = useState<Campaign | undefined>(
    undefined
  );

  const openPayment = (c: Campaign) => {
    setPaymentCampaign(c);
    setPaymentModal(true);
    setSelected("Payments");
  };

  const openChat = (cid: string) => {
    setSelected("Communication");
    console.log("Open chat for", cid);
  };

  const renderModule = () => {
    switch (selected) {
      case "Creator Directory":
        return (
          <CreatorDirectory
            profile={profile}
            onSaveProfile={(s, d) => setProfile(d)}
            socials={socials}
            onUpdateSocials={(d) => setSocials(d)}
          />
        );
      case "Communication":
        return (
          <CommunicationsModule
            campaigns={campaigns}
            onOpenCampaignChat={openChat}
            notifications={notifications}
          />
        );
      case "Campaigns & Contracts":
        return (
          <CampaignsContracts
            campaigns={campaigns}
            setCampaigns={setCampaigns}
            openChat={openChat}
            openPayment={openPayment}
          />
        );
      case "Payments":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Payments</h2>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="font-semibold mb-2">
                Payment Info & Tax Documentation
              </div>
              <p className="text-sm text-gray-700">
                Bank: HDFC Bank | Account No: XXXX-XXXX-1234 | IFSC: HDFC000123
              </p>
              <button
                onClick={() => alert("Edit info (demo)")}
                className="mt-3 px-3 py-1 border rounded text-sm"
              >
                Edit Info
              </button>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="font-semibold mb-2">Payment Status</div>
              <p className="text-sm text-gray-700">
                View campaign-wise payment progress and raise tickets.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-lg shadow p-6 text-gray-600">
            Placeholder for {selected}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-100 to-blue-100">
      <Header role={role} />
      <div className="flex flex-1">
        <Sidebar
          modules={modules}
          selected={selected}
          onSelect={(m) => {
            setSelected(m);
            setSelectedSub(subitems[m][0]);
          }}
          subitems={subitems}
          selectedSub={selectedSub}
          onSelectSub={setSelectedSub}
          role={role}
          setRole={setRole}
        />
        <main className="flex-1 overflow-y-auto p-6">{renderModule()}</main>
      </div>
      <PaymentDetailModal
        open={paymentModal}
        onClose={() => setPaymentModal(false)}
        campaign={paymentCampaign}
      />
    </div>
  );
};

export default App;
