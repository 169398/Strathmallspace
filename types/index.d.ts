import { BADGE_CRITERIA } from "@/constants";
import { users } from "@/db/schema";

import { InferSelectModel } from "drizzle-orm";
export type user = InferSelectModel<typeof users>;

export interface SidebarLink {
    imgURL: string;
    route: string;
    label: string;
  }

  export interface BadgeCounts {
    GOLD: number;
    SILVER: number;
    BRONZE: number;
  }
  
  export type BadgeCriteriaType = keyof typeof BADGE_CRITERIA;