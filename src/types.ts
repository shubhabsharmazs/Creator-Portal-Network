// src/types.ts

// --- Core Shared Types ---

export type Role = "Creator" | "Microsoft User" | "Admin";

export type CampaignStage =
  | "Invite"
  | "Accepted"
  | "Content Sent"
  | "Approval"
  | "Content Posted Confirmation Sent"
  | "Post Approval";

export type Campaign = {
  id: string;
  name: string;
  poc: string;
  createdAt: number;
  brief: string;
  deliverables?: string;
  amount?: string;
  offering?: string;
  isBroadcast?: boolean;
  stage: CampaignStage | "Draft";
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
  // MS User specific fields (optional for Creator)
  budgetUtilization?: number; // 0.0 to 1.0
  creatorIds: string[];
};

export type CreatorProfile = {
  id: string;
  name: string;
  platform: "Instagram" | "YouTube" | "TikTok";
  followers: number;
  engagement: number; // 0.0 to 1.0
  notes: string;
  isVerified: boolean;
  assignedCampaigns: string[];
};