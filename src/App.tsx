import React, { useState } from "react";
import "./index.css";

// --- Mock Data: All Features per Module per Role ---
const features: Record<string, Record<string, Record<string, string[]>>> = {
  admin: {
    creatorDirectory: {
      Profile: ["Set up master profiles", "Manage verified data"],
      Engagement: ["Track all prior collaborations"],
      SearchFilter: ["Maintain tagging and filter options"],
      Access: ["Configure permissions", "Azure AD Integration", "Data Import"],
    },
    communications: {
      Messaging: ["Configure messaging policies and templates"],
      Notifications: ["Configure triggers and rules"],
      FileSharing: ["Manage storage, permissions, allowed file types"],
      Templates: ["Maintain approved communication templates"],
      Broadcast: ["Configure group messaging"],
      Integration: ["Email/Teams integration setup"],
    },
    contractsPayments: {
      Contracts: [
        "Maintain legal-approved contract templates",
        "Configure auto-population of fields",
      ],
      ESignature: ["Configure e-signature workflow"],
      Payments: [
        "Define payment policies and schedules",
        "Monitor payment dashboard",
        "Budget tracker",
      ],
      Repository: ["Maintain searchable contract repository"],
    },
    onboarding: {
      SelfService: ["Configure onboarding flow", "Vetting & verification"],
      Account: ["Define required fields", "Resource hub setup"],
      Policies: ["Maintain platform terms, NDA, code of conduct"],
      ProgramTagging: ["Define program tiers and tags"],
    },
    campaigns: {
      Briefs: ["Maintain brief templates", "Oversee campaign creation"],
      Content: ["Review submissions", "Provide feedback"],
      Tracking: ["Monitor campaign deliverables", "Campaign status dashboard"],
      Product: ["Manage product dispatch and tracking"],
    },
  },
  msUser: {
    creatorDirectory: {
      Profile: ["Discover and view relevant creators", "Check past engagement"],
      Engagement: ["Review creator history for campaign decisions"],
      SearchFilter: [
        "Locate and shortlist creators using tags, niches, past campaigns",
      ],
    },
    communications: {
      Messaging: ["Chat and collaborate directly with creators"],
      Notifications: [
        "Receive alerts for messages, tasks, approvals, campaign status",
      ],
      FileSharing: ["Share briefs, creative assets, and documents"],
      Templates: ["Use templates for consistent messaging"],
      Broadcast: ["Send announcements/updates to multiple creators"],
      Integration: ["Communicate via integrated Microsoft tools"],
    },
    contractsPayments: {
      Contracts: [
        "Generate campaign-specific contracts",
        "Negotiate edits based on creator inputs",
      ],
      ESignature: ["Send contracts for signing"],
      Payments: ["Set payout terms", "Track campaign-level payment progress"],
      Repository: ["Access signed contracts relevant to campaigns"],
    },
    onboarding: {
      SelfService: ["Invite new creators to join the portal"],
      ProgramTagging: ["Assign creators to campaigns or groups"],
    },
    campaigns: {
      Briefs: ["Create campaign briefs and add creators"],
      Content: ["Review submitted pitches", "Provide feedback on drafts"],
      Tracking: ["Track campaign-level deliverables"],
      Product: ["Manage product dispatch and tracking"],
    },
  },
  creator: {
    creatorDirectory: {
      Profile: [
        "View and update own profile",
        "Link channels",
        "Review engagement history",
      ],
    },
    communications: {
      Messaging: ["Send/receive messages", "Collaborate on drafts"],
      Notifications: ["Receive alerts for briefs, deliverables, feedback"],
      FileSharing: ["Upload content deliverables", "Review shared resources"],
      Broadcast: ["Receive announcements/updates"],
    },
    contractsPayments: {
      Contracts: ["Sign contracts digitally"],
      Payments: ["View payment schedule, expected dates, completed payments"],
      Repository: ["View own signed contracts"],
    },
    onboarding: {
      Account: [
        "Complete account setup",
        "Fill out profile info and social handles",
      ],
      Policies: ["Accept digital agreements to comply with policies"],
      Financial: ["Provide payment info and tax forms"],
    },
    campaigns: {
      Briefs: ["View campaign briefs assigned to them"],
      Content: ["Submit content drafts", "Submit pitches/ideas"],
      Tracking: ["Track own tasks and submission status"],
      Product: ["Confirm receipt of products and deliverables"],
    },
  },
};

// --- Feature Section Component (Collapsible) ---
const FeatureSection: React.FC<{ title: string; features: string[] }> = ({
  title,
  features,
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4 border rounded-lg shadow-sm">
      <button
        className="w-full text-left p-3 bg-gray-200 font-semibold hover:bg-gray-300 rounded-t"
        onClick={() => setOpen(!open)}
      >
        {title}
      </button>
      {open && (
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {features.map((f, i) => (
            <div
              key={i}
              className="border p-2 rounded hover:shadow-md transition"
            >
              {f}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Module Page Component ---
const ModulePage: React.FC<{ moduleName: string; role: string }> = ({
  moduleName,
  role,
}) => {
  const sections = features[role][moduleName];
  return (
    <div className="p-6 overflow-auto">
      <h2 className="text-2xl font-bold mb-4">
        {moduleName.replace(/([A-Z])/g, " $1")}
      </h2>
      {Object.entries(sections).map(([sectionTitle, featureList]) => (
        <FeatureSection
          key={sectionTitle}
          title={sectionTitle}
          features={featureList}
        />
      ))}
    </div>
  );
};

// --- Sidebar Component ---
const Sidebar: React.FC<{ setModule: (mod: string) => void }> = ({
  setModule,
}) => {
  const modules = [
    "creatorDirectory",
    "communications",
    "contractsPayments",
    "onboarding",
    "campaigns",
  ];
  return (
    <div className="w-64 h-screen bg-gray-100 p-4 overflow-auto">
      <h1 className="text-xl font-bold mb-6">Portal Modules</h1>
      {modules.map((mod) => (
        <button
          key={mod}
          className="block w-full text-left py-2 px-3 hover:bg-gray-200 rounded mb-1"
          onClick={() => setModule(mod)}
        >
          {mod.replace(/([A-Z])/g, " $1")}
        </button>
      ))}
    </div>
  );
};

// --- Header Component ---
const Header: React.FC<{ role: string }> = ({ role }) => (
  <div className="h-16 bg-white shadow flex items-center justify-between px-6">
    <h2 className="text-xl font-semibold">Creator Management Portal</h2>
    <span className="font-medium">{role.toUpperCase()}</span>
  </div>
);

// --- Main App ---
const App: React.FC = () => {
  const [role, setRole] = useState<string>("admin"); // admin, msUser, creator
  const [module, setModule] = useState<string>("creatorDirectory");

  return (
    <div className="flex h-screen">
      <Sidebar setModule={setModule} />
      <div className="flex-1 flex flex-col">
        <Header role={role} />
        <div className="p-4 overflow-auto flex-1">
          {/* Role Switcher */}
          <div className="mb-4">
            <span className="mr-2 font-semibold">Switch Role:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="admin">Admin</option>
              <option value="msUser">Microsoft User</option>
              <option value="creator">Creator</option>
            </select>
          </div>
          {/* Module Content */}
          <ModulePage moduleName={module} role={role} />
        </div>
      </div>
    </div>
  );
};

export default App;
``;
