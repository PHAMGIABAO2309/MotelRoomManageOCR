export interface Tenant {
  id: string;
  name: string;
  phone: string;
  moveInDate: string; // ISO string format
  dateOfBirth?: string; // ISO string format
  avatarUrl?: string; // data:image URL
  idNumber?: string;
  sex?: string;
  nationality?: string;
  placeOfOrigin?: string;
  placeOfResidence?: string;
  occupation?: string;
}

export interface UsageRecord {
  id: string;
  startDate: string; // ISO string format
  endDate: string; // ISO string format
  electricReading: number;
  waterReading: number;
  electricUsage: number;
  waterUsage: number;
  billAmount: number;
  isPaid: boolean;
  tenantsSnapshot: Tenant[];
}

export interface Room {
  id: string;
  name: string;
  status: 'occupied' | 'vacant';
  baseRent: number;
  tenants: Tenant[];
  usageHistory: UsageRecord[];
  archivedUsageHistory?: UsageRecord[];
  isPinned?: boolean;
}

export interface User {
  id:string;
  name: string;
  username: string;
  password?: string;
  role: 'Admin' | 'Staff';
  avatarUrl?: string;
}

export interface Notification {
  id: string;
  roomId: string;
  recordId: string;
  message: string;
  date: string; // ISO string of the due date
}

export enum PageType {
  ROOM_GRID,
  USER_MANAGEMENT,
  EDIT_PROFILE,
  TENANT_VIEW,
  INVOICE_MANAGEMENT,
  TENANT_ARCHIVE,
}

export enum ModalType {
    NONE,
    ADD_ROOM,
    MANAGE_TENANTS,
    RECORD_USAGE,
    EDIT_TENANT,
    EDIT_USAGE,
    ADD_USER,
    EDIT_USER,
    CHECK_OUT,
    PAYMENT_QR,
    VIEW_TENANT_DETAIL,
}