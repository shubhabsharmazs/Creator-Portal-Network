import React, { useState, useEffect, useMemo } from "react";
import "./index.css";

// ----------------------------------
// Types
// ----------------------------------
interface Campaign {
  id: string;
  name: string;
  poc: string;
  stage?: string;
  paymentStatus?: string;
  amount?: string;
}

interface Notification {
  id: string;
  message: string;
  time: string;
}

const modules = [
  "Creator Directory",
  "Communication",
  "Campaigns & Contracts",
  "Payments",
  "Performance",
];

// ----------------------------------
// Helper components
// ----------------------------------
const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/5 p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

// ----------------------------------
// Progress Tracker (cleaned)
// ----------------------------------
const ProgressTracker: React.FC<{ stage?: string }> = ({ stage }) => {
  const stages = [
    "Accepted",
    "Content Sent",
    "Approval",
    "Content Posted Confirmation Sent",
    "Post Approval",
  ];
  const activeIndex = stages.indexOf(stage || "Accepted");
  return (
    <div className="flex items-center justify-between w-full text-xs mt-2">
      {stages.map((s, i) => (
        <div
          key={i}
          className={`flex-1 text-center ${
            i <= activeIndex ? "text-indigo-600 font-medium" : "text-gray-400"
          }`}
        >
          {s}
        </div>
      ))}
    </div>
  );
};

// ----------------------------------
// Sidebar
// ----------------------------------
const Sidebar: React.FC<{
  selected: string;
  onSelect: (s: string) => void;
}> = ({ selected, onSelect }) => {
  return (
    <div className="w-full md:w-1/5 bg-gradient-to-b from-indigo-700 to-indigo-500 text-white min-h-screen p-4 space-y-3">
      <h1 className="text-lg font-semibold mb-6">Creator Portal</h1>
      {modules.map((m) => (
        <div
          key={m}
          onClick={() => onSelect(m)}
          className={`cursor-pointer px-3 py-2 rounded-lg ${
            selected === m ? "bg-white/20 font-semibold" : "hover:bg-white/10"
          }`}
        >
          {m}
        </div>
      ))}
    </div>
  );
};

// ----------------------------------
// Creator Directory
// ----------------------------------
const CreatorDirectory: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-semibold mb-3">View / Update Profile</h2>
        <p className="text-sm text-gray-600 mb-3">
          View and edit your personal profile details below.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border p-2 rounded" placeholder="Name" />
          <input className="border p-2 rounded" placeholder="Phone" />
          <input className="border p-2 rounded" placeholder="Email" />
          <input className="border p-2 rounded" placeholder="Creator Type" />
        </div>
        <button className="mt-3 bg-indigo-600 text-white px-4 py-1 rounded">
          Save
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-semibold mb-3">Social Media Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border p-2 rounded" placeholder="Instagram" />
          <input className="border p-2 rounded" placeholder="Facebook" />
          <input className="border p-2 rounded" placeholder="Threads" />
          <input className="border p-2 rounded" placeholder="TikTok" />
        </div>
        <button
          onClick={() => alert("Redirecting to Instagram verification...")}
          className="mt-3 bg-green-600 text-white px-4 py-1 rounded"
        >
          Verify Instagram
        </button>
      </div>
    </div>
  );
};
// ----------------------------------
// Communication Module (updated)
// ----------------------------------
const CommunicationsModule: React.FC<{
  campaigns: Campaign[];
  activeChatCampaignId?: string | null;
  openChat?: (id: string) => void;
}> = ({ campaigns, activeChatCampaignId, openChat }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* LEFT SIDE — Ongoing Campaigns */}
      <div className="md:w-1/3">
        <div className="font-semibold">Ongoing Campaigns</div>
        <div className="mt-3 space-y-2 overflow-y-auto max-h-[400px]">
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
                onClick={() => (openChat ? openChat(c.id) : null)}
                className={`cursor-pointer p-3 rounded-lg border ${
                  c.id === activeChatCampaignId
                    ? "bg-indigo-50 border-indigo-400"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">{c.id}</div>
              </div>
            ))}
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

      {/* RIGHT SIDE — Chat Window */}
      <div className="md:flex-1 flex flex-col">
        <div className="font-semibold mb-2">Campaign Chat</div>

        {activeChatCampaignId ? (
          (() => {
            const c = campaigns.find((x) => x.id === activeChatCampaignId);
            if (!c)
              return (
                <div className="text-sm text-gray-500">
                  Selected campaign not found.
                </div>
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
              <div className="flex flex-col h-96 bg-gray-50 rounded p-4">
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
                      <div className="text-xs text-gray-400">{m.time}</div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
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
            );
          })()
        ) : (
          <div className="text-sm text-gray-500">
            Select a campaign from the left to open its chat.
          </div>
        )}
      </div>
    </div>
  );
};
// ----------------------------------
// Campaigns & Contracts Module
// ----------------------------------
const CampaignsContractsModule: React.FC<{
  campaigns: Campaign[];
  openBriefModal: (c: Campaign) => void;
  openChat: (id: string) => void;
}> = ({ campaigns, openBriefModal, openChat }) => {
  const cardMinWidth = "min-w-[250px] md:min-w-[300px]";

  const ongoingFiltered = campaigns.filter((c) =>
    [
      "Accepted",
      "Content Sent",
      "Approval",
      "Content Posted Confirmation Sent",
    ].includes(c.stage ?? "")
  );

  const availableFiltered = campaigns.filter(
    (c) => c.stage === "Invite" || c.stage === "Available"
  );

  const completedFiltered = campaigns.filter((c) =>
    ["Completed", "Declined"].includes(c.stage ?? "")
  );

  return (
    <div className="space-y-8">
      {/* Ongoing Campaigns */}
      <div>
        <h2 className="font-semibold mb-3">Ongoing Campaigns</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {ongoingFiltered.map((c) => (
            <div
              key={c.id}
              className={`bg-white shadow rounded-lg p-4 ${cardMinWidth} flex-shrink-0`}
            >
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-gray-500">{c.poc}</div>

              <div className="space-y-2 mt-2">
                <ProgressTracker stage={c.stage} />
                <div className="flex gap-2">
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
                    Open Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
          {ongoingFiltered.length === 0 && (
            <div className="text-sm text-gray-500">No ongoing campaigns</div>
          )}
        </div>
      </div>

      {/* Available Campaigns */}
      <div>
        <h2 className="font-semibold mb-3">Available Campaigns</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {availableFiltered.map((c) => (
            <div
              key={c.id}
              className={`bg-white shadow rounded-lg p-4 ${cardMinWidth} flex-shrink-0`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-sm text-gray-500">{c.poc}</div>
                </div>
                <div className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">
                  New
                </div>
              </div>

              <button
                onClick={() => openBriefModal(c)}
                className="mt-3 w-full bg-indigo-600 text-white rounded py-1"
              >
                Open Brief
              </button>
            </div>
          ))}
          {availableFiltered.length === 0 && (
            <div className="text-sm text-gray-500">No new campaigns</div>
          )}
        </div>
      </div>

      {/* Completed & Declined */}
      <div>
        <h2 className="font-semibold mb-3">Completed & Declined</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {completedFiltered.map((c) => (
            <div
              key={c.id}
              className={`bg-white shadow rounded-lg p-4 ${cardMinWidth} flex-shrink-0`}
            >
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-gray-500">{c.poc}</div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => openBriefModal(c)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded"
                >
                  Open Brief
                </button>
                <button
                  onClick={() => alert(`Redirecting to payment for ${c.id}`)}
                  className="px-3 py-1 border rounded"
                >
                  Payment Status
                </button>
              </div>
            </div>
          ))}
          {completedFiltered.length === 0 && (
            <div className="text-sm text-gray-500">
              No completed or declined campaigns
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// ----------------------------------
// Payments Module
// ----------------------------------
const PaymentsModule: React.FC<{
  campaigns: Campaign[];
}> = ({ campaigns }) => {
  const paymentFiltered = campaigns.filter((c) =>
    ["Completed", "Declined", "Content Posted Confirmation Sent"].includes(
      c.stage ?? ""
    )
  );
  const [modalCampaign, setModalCampaign] = useState<Campaign | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="font-semibold">Payments</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {paymentFiltered.map((c) => (
          <div
            key={c.id}
            className="bg-white shadow rounded-lg p-4 min-w-[250px] flex-shrink-0"
          >
            <div className="font-semibold">{c.name}</div>
            <div className="text-sm text-gray-500">{c.poc}</div>
            <div className="mt-3 flex justify-between items-center">
              <div className="text-xs text-gray-500">Payment Status</div>
              <button
                onClick={() => setModalCampaign(c)}
                className="px-3 py-1 border rounded text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!modalCampaign}
        onClose={() => setModalCampaign(null)}
        title="Payment Details"
      >
        {modalCampaign && (
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <b>Campaign:</b> {modalCampaign.name}
            </div>
            <div>
              <b>ID:</b> {modalCampaign.id}
            </div>
            <div>
              <b>Amount:</b> ₹{modalCampaign.amount ?? "—"}
            </div>
            <div>
              <b>Status:</b> {modalCampaign.paymentStatus ?? "Processing"}
            </div>
            <div>
              <b>Transaction ID:</b> TXN-{modalCampaign.id.slice(-4)}-XYZ
            </div>
            <div>
              <b>Expected Date:</b>{" "}
              {new Date(Date.now() + 86400000 * 5).toLocaleDateString()}
            </div>
            <div className="pt-3 flex justify-end gap-3">
              <button
                onClick={() => alert("Invoice downloaded (demo)")}
                className="px-3 py-1 bg-indigo-600 text-white rounded"
              >
                Download Invoice
              </button>
              <button
                onClick={() => alert("Ticket raised (demo)")}
                className="px-3 py-1 border rounded"
              >
                Raise Ticket
              </button>
            </div>
            <div className="pt-3 text-center text-gray-500 italic">
              Thank you for your collaboration. Payment is being processed.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ----------------------------------
// APP Component
// ----------------------------------
const App: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState("Creator Directory");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeChatCampaignId, setActiveChatCampaignId] = useState<
    string | null
  >(null);
  const [briefCampaign, setBriefCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    // Mock data
    setCampaigns([
      { id: "C101", name: "Surface Launch", poc: "John", stage: "Accepted" },
      {
        id: "C102",
        name: "Office365 Push",
        poc: "Priya",
        stage: "Content Sent",
      },
      { id: "C103", name: "Azure Onboarding", poc: "Rahul", stage: "Approval" },
      { id: "C104", name: "Teams Collab", poc: "Sarah", stage: "Invite" },
      {
        id: "C105",
        name: "Defender Showcase",
        poc: "Isha",
        stage: "Completed",
      },
    ]);
  }, []);

  const openBriefModal = (c: Campaign) => setBriefCampaign(c);

  const openChat = (campaignId: string) => {
    setSelectedModule("Communication");
    setActiveChatCampaignId(campaignId);
  };

  const renderModule = () => {
    switch (selectedModule) {
      case "Creator Directory":
        return <CreatorDirectory />;
      case "Communication":
        return (
          <CommunicationsModule
            campaigns={campaigns}
            activeChatCampaignId={activeChatCampaignId}
            openChat={openChat}
          />
        );
      case "Campaigns & Contracts":
        return (
          <CampaignsContractsModule
            campaigns={campaigns}
            openBriefModal={openBriefModal}
            openChat={openChat}
          />
        );
      case "Payments":
        return <PaymentsModule campaigns={campaigns} />;
      default:
        return <div>Select a module from the sidebar.</div>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar selected={selectedModule} onSelect={setSelectedModule} />
      <div className="flex-1 p-6 overflow-auto">
        {renderModule()}
        <Modal
          open={!!briefCampaign}
          onClose={() => setBriefCampaign(null)}
          title="Campaign Brief"
        >
          {briefCampaign && (
            <div className="space-y-3 text-sm text-gray-700">
              <div className="font-semibold">{briefCampaign.name}</div>
              <div>
                Dear Creator,
                <br />
                We are thrilled to have you on board for the{" "}
                <b>{briefCampaign.name}</b> campaign led by {briefCampaign.poc}.
                <br />
                Deliverables include posting one static and one video post by
                the due date. Compensation details have been shared separately.
                <br />
                Please confirm participation by clicking Accept below.
              </div>
              <div className="pt-3 flex justify-end gap-3">
                <button
                  onClick={() => {
                    alert("Request for update sent (demo)");
                    setBriefCampaign(null);
                  }}
                  className="px-3 py-1 border rounded"
                >
                  Update Request
                </button>
                <button
                  onClick={() => {
                    alert("Campaign Declined (demo)");
                    setBriefCampaign(null);
                  }}
                  className="px-3 py-1 border rounded text-red-500"
                >
                  Decline
                </button>
                <button
                  onClick={() => {
                    alert("Campaign Accepted (demo)");
                    setBriefCampaign(null);
                  }}
                  className="px-3 py-1 bg-indigo-600 text-white rounded"
                >
                  Accept
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default App;
