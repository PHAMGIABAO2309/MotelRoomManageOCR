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
  tenantSnapshot: Tenant;
}

export interface Room {
  id: string;
  name: string;
  status: 'occupied' | 'vacant';
  baseRent: number;
  tenant: Tenant | null;
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

export enum PageType {
  ROOM_GRID,
  USER_MANAGEMENT,
  EDIT_PROFILE,
  TENANT_VIEW,
  INVOICE_MANAGEMENT,
}

export enum ModalType {
    NONE,
    ADD_ROOM,
    ASSIGN_TENANT,
    RECORD_USAGE,
    EDIT_TENANT,
    EDIT_USAGE,
    TENANT_DETAIL,
    ADD_USER,
    EDIT_USER,
    CHECK_OUT,
}