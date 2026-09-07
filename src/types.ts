/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PropertyPurpose = 'SALE' | 'RENT';

export type PropertyType = 
  | 'HOUSE' 
  | 'APARTMENT' 
  | 'CONDO' 
  | 'LAND' 
  | 'COMMERCIAL' 
  | 'FARM' 
  | 'OTHER';

export type PropertyStatus = 
  | 'AVAILABLE' 
  | 'RESERVED' 
  | 'SOLD' 
  | 'RENTED' 
  | 'INACTIVE';

export interface Property {
  id: string;
  code: string;
  title: string;
  description: string;
  purpose: PropertyPurpose;
  propertyType: PropertyType;
  status: PropertyStatus;
  price: number;
  condominiumFee?: number;
  iptu?: number;
  city: string;
  state: string;
  neighborhood: string;
  address: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parkingSpaces: number;
  builtArea: number;
  totalArea: number;
  features: string[];
  images: string[];
  videoURL?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any;
  publishedAt?: any;
  featured: boolean;
  ownerId?: string;
}

export type UserRole = 'ADMIN' | 'CORRETOR' | 'CLIENTE';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role: UserRole;
  createdAt?: any;
  updatedAt?: any;
  active: boolean;
  creci?: string;
  company?: string;
}

export type LeadStatus = 
  | 'NEW' 
  | 'FIRST_CONTACT' 
  | 'QUALIFIED' 
  | 'VISIT_SCHEDULED' 
  | 'VISIT_DONE' 
  | 'PROPOSAL' 
  | 'NEGOTIATION' 
  | 'CLOSING' 
  | 'WON' 
  | 'LOST';

export type LeadSource = 
  | 'SITE' 
  | 'WHATSAPP' 
  | 'INSTAGRAM' 
  | 'FACEBOOK' 
  | 'GOOGLE' 
  | 'REFERRAL' 
  | 'PROPERTY_PORTAL' 
  | 'AD' 
  | 'BLOG' 
  | 'AI_ASSISTANT'
  | 'OTHER';

export type OpportunityPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface LeadQualification {
  intent: 'BUY' | 'RENT' | 'SELL' | 'INVEST';
  budget: number;
  propertyType: PropertyType;
  city: string;
  neighborhood: string;
  bedrooms: number;
  parkingSpaces: number;
  timeframe: string;
  paymentMethod: 'FINANCING' | 'CASH' | 'CONSORTIUM' | 'OTHER' | 'NOT_INFORMED';
  notes?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  propertyId?: string;
  propertyCode?: string;
  message: string;
  source: LeadSource;
  status: LeadStatus;
  priority: OpportunityPriority;
  score: number;
  qualification?: LeadQualification;
  createdAt: any;
  updatedAt: any;
  lastContactAt?: any;
  nextContactAt?: any;
  assignedTo?: string;
  notes?: string;
  lostReason?: string;
  lostNotes?: string;
  potentialValue?: number;
}

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: any;
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  propertyId: string;
  userId: string;
  leadId?: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  preferredPropertyType?: PropertyType;
  purpose?: PropertyPurpose;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  notes?: string;
  createdAt: any;
  updatedAt: any;
  assignedTo?: string;
  favorites?: string[]; // Property IDs
  viewedProperties?: string[]; // Property IDs
}

export type InteractionType = 
  | 'CALL' 
  | 'WHATSAPP' 
  | 'EMAIL' 
  | 'MEETING' 
  | 'VISIT' 
  | 'NOTE' 
  | 'PROPOSAL' 
  | 'OTHER';

export interface Interaction {
  id: string;
  clientId?: string;
  leadId?: string;
  type: InteractionType;
  description: string;
  createdAt: any;
  createdBy: string;
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskType = 
  | 'CALL' 
  | 'WHATSAPP' 
  | 'EMAIL' 
  | 'VISIT' 
  | 'PROPOSAL' 
  | 'FOLLOW_UP' 
  | 'OTHER';

export interface CRMTask {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: OpportunityPriority;
  dueDate: any;
  assignedTo: string;
  clientId?: string;
  leadId?: string;
  createdAt: any;
  updatedAt: any;
}

export type ProposalStatus = 
  | 'DRAFT' 
  | 'SENT' 
  | 'UNDER_REVIEW' 
  | 'ACCEPTED' 
  | 'REJECTED' 
  | 'CANCELLED' 
  | 'EXPIRED';

export interface Proposal {
  id: string;
  leadId: string;
  clientId: string;
  propertyId: string;
  createdBy: string;
  amount: number;
  downPayment?: number;
  financingAmount?: number;
  paymentMethod: string;
  validUntil: any;
  status: ProposalStatus;
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  avatar: string;
}

export type BlogPostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  coverImage: string;
  category: string;
  authorId: string;
  authorName: string;
  status: BlogPostStatus;
  publishedAt?: any;
  createdAt: any;
  updatedAt: any;
  views: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: any;
  details?: string;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp: string;
  creci: string;
  address: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  theme: {
    primaryColor: string;
    accentColor: string;
  };
  logoURL?: string;
  faviconURL?: string;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt: any;
}

export interface AIConversation {
  id: string;
  userId?: string;
  leadId?: string;
  sessionId: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'TRANSFERRED';
  summary?: string;
  lastMessage?: string;
  createdAt: any;
  updatedAt: any;
  channel: 'SITE' | 'ADMIN';
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'model' | 'system';
  content: string;
  createdAt: any;
  metadata?: {
    intent?: string;
    propertyIds?: string[];
    leadQualification?: Partial<LeadQualification>;
    transferRequested?: boolean;
    visitRequested?: boolean;
    propertyId?: string;
  };
}

export interface AIUsage {
  id: string;
  userId?: string;
  conversationId?: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCost?: number;
  action: string;
  createdAt: any;
}

export interface AIRecommendation {
  id: string;
  conversationId: string;
  userId?: string;
  propertyId: string;
  score: number;
  reasons: string[];
  createdAt: any;
}

export interface AISettings {
  enabled: boolean;
  model: string;
  initialMessage: string;
  tone: string;
  humanHandoffStartTime: string;
  humanHandoffEndTime: string;
  monthlyLimit: number;
}

