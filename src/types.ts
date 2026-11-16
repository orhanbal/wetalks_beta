/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Visitor' | 'Reader' | 'Writer' | 'Editor' | 'Admin';

export type ArticleStatus = 'Draft' | 'Pending' | 'Published' | 'Rejected' | 'Archived';

export interface SocialLinks {
  twitter?: string;
  github?: string;
  linkedin?: string;
  website?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  expertise: string[];
  socials: SocialLinks;
  followersCount: number;
  articlesCount: number;
  role: UserRole;
  followedAuthors: string[]; // List of writer user IDs followed by this user
  savedArticles: string[]; // List of article IDs saved by this user
  likedArticles: string[]; // List of article IDs liked by this user
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string; // Markdown or rich HTML-ish text
  coverImage: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  categoryId: string;
  tags: string[]; // Slugs of tags
  createdAt: string; // ISO String
  readTime: number; // in minutes
  status: ArticleStatus;
  views: number;
  likes: number;
  seoTitle?: string;
  seoDescription?: string;
  seriesId?: string; // ID of the Series/Dizi this article belongs to
  publicationType?: 'news' | 'article' | 'series' | 'interview' | 'event';
  sourceName?: string;
  sourceUrl?: string;
  trInterest?: number;
  eCommerceImpact?: number;
  sellerImpact?: number;
  aiAudit?: AiEditorialAudit;
  isAutoPublished?: boolean;
}

export interface AiEditorialAudit {
  score: number; // 0 - 100
  verdict: 'APPROVED_FOR_AUTO_PUBLISH' | 'NEEDS_MANUAL_REVIEW';
  summary: string;
  criteria: {
    accuracyAndObjectivity: number; // 0-10
    sellerValueAndRelevance: number; // 0-10
    linguisticQuality: number; // 0-10
    visualContextMatch: number; // 0-10
    attributionAndSafety: number; // 0-10
  };
  critiqueNotes?: string[];
  auditedAt: string;
}

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  parentId?: string; // Supports nested replies
}

export interface Notification {
  id: string;
  userId: string; // Target user
  type: 'follower' | 'comment' | 'approval' | 'rejection' | 'newPost';
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  link?: string; // Path or contextual target
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // Lucide icon name representation
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface NavigationMenuItem {
  id: string;
  title: string;
  view: string;
  categoryParam?: string; // e.g. 'deneyimler', 'makaleler', 'roportajlar', 'gundem' or a custom value
  visible: boolean;
}

export interface SystemSettings {
  appName: string;
  siteTitle?: string;
  appDescription: string;
  accentColor: 'zinc' | 'emerald' | 'indigo' | 'rose' | 'amber';
  wordsPerMinute: number;
  menuItems?: NavigationMenuItem[]; // Dynamic list of menu items
  
  // Custom Logos & Favicon
  lightLogo?: string;
  darkLogo?: string;
  favicon?: string;
  
  // Feature Switches
  enableAiAssistant: boolean;
  enableComments: boolean;
  enableNewsletter: boolean;
  enableManifesto: boolean;
  enableLikesSaves: boolean;
  enableGuestReading: boolean;
  showDesignStudio?: boolean;
  showExploreProjectButton?: boolean;
  
  // Status Switches
  appActive?: boolean;
  insightsActive?: boolean;
  
  // Dashboard Tabs Switchboard (Toggles visibility of each space within Dashboard)
  showOverviewTab: boolean;
  showSavedLikedTab: boolean;
  showMyArticlesTab: boolean;
  showEditorApprovalsTab: boolean;
  showEditorCategoriesTab: boolean;
  showAdminUsersTab: boolean;
  showAdminCatalogTab: boolean;
  showAgendaNewsTab: boolean;
  showAgendaSourcesTab: boolean;
  showAiGenerationTab: boolean;
  headingFont?: string;
  articleFont?: string;
  menuFont?: string;
}

export interface ArticleSeries {
  id: string;
  title: string;
  description: string;
  articleIds: string[]; // List of article IDs that are part of this series in sequence
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO format or YYYY-MM-DD
  endDate?: string; // Optional end date for multi-day events
  durationDays?: number; // Optional duration in days for multi-day events
  time?: string; // HH:MM
  location?: string;
  organizer?: string;
  sourceUrl?: string;
  isAiGenerated?: boolean;
}



