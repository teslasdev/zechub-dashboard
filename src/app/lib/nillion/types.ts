/**
 * Type definitions for privacy-preserving analytics
 */

// User analytics data stored privately
export interface PrivateAnalyticsData {
  _id: string;
  userId: string;
  timestamp: string;
  // Private fields (encrypted)
  pageViews: {
    '%allot': number;
  };
  sessionDuration: {
    '%allot': number;
  };
  interactions: {
    '%allot': number;
  };
  // Public metadata
  category: string;
  platform: string;
}

// Aggregated analytics (computed confidentially)
export interface AggregatedAnalytics {
  totalUsers: number;
  totalPageViews: number;
  averageSessionDuration: number;
  totalInteractions: number;
  timeRange: {
    start: string;
    end: string;
  };
}

// Collection schema for analytics
export interface AnalyticsCollection {
  _id: string;
  type: 'owned';
  name: string;
  schema: {
    $schema: string;
    type: string;
    uniqueItems: boolean;
    items: {
      type: string;
      properties: Record<string, unknown>;
      required: string[];
    };
  };
}

// User permission for data access
export interface DataPermission {
  grantee: string;
  read: boolean;
  write: boolean;
  execute: boolean;
}
