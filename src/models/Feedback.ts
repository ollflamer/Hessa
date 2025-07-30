export interface Feedback {
  id: string;
  name: string;
  email: string;
  text: string;
  response?: string;
  status: 'pending' | 'in_progress' | 'answered' | 'closed';
  adminId?: string;
  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
}

export interface CreateFeedbackDto {
  name: string;
  email: string;
  text: string;
}

export interface FeedbackResponseDto {
  response: string;
}

export interface FeedbackFilters {
  status?: string;
  email?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface FeedbackRateLimit {
  id: string;
  email: string;
  ipAddress?: string;
  lastMessageAt: Date;
  messageCount: number;
  createdAt: Date;
}
