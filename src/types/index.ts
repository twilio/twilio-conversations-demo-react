export interface Lead {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  tags: string[];
  lastContactedAt?: Date;
  notes?: string;
  campaignIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  status: "draft" | "active" | "paused" | "completed";
  messages: CampaignMessage[];
  schedule: {
    startDate: Date;
    endDate?: Date;
    frequency?: "once" | "daily" | "weekly" | "monthly";
  };
  targetTags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignMessage {
  id: string;
  content: string;
  delay: number; // delay in hours from campaign start or previous message
  conditions?: {
    field: string;
    operator: "equals" | "contains" | "exists";
    value: string;
  }[];
}
