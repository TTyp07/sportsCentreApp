export interface User {
  _id: string;
  name: string;
  dateOfBirth: string;
  address: string;
  email: string;
  role: 'member' | 'staff' | 'admin';
  isApproved?: boolean;
  isSuspended?: boolean;
  assignedFacilities?: string[];
  membershipActive?: boolean;
  partnerProfile?: PartnerProfile;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerProfile {
  isVisible: boolean;
  preferredSport?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  availability?: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  isApproved?: boolean;
  membershipActive?: boolean;
}

export interface Facility {
  _id: string;
  name: string;
  type: string;
  description?: string;
  usageGuidelines?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  capacityLimit: number;
  timeSlotDuration: number;
  availableSlots: TimeSlot[];
  assignedStaff: string[] | User[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Booking {
  _id: string;
  member: string | User;
  facility: string | Facility;
  intendedActivity: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed' | 'alternative_suggested';
  alternativeFacility?: string | Facility;
  handledBy?: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface BookingHistory {
  _id: string;
  member: string | User;
  booking: string | Booking;
  facility: string | Facility;
  date: string;
  startTime: string;
  endTime: string;
  outcome: 'completed' | 'cancelled' | 'rejected';
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  message: string;
  type: 'booking_approved' | 'booking_rejected' | 'alternative_suggested' | 'session_completed' | 'equipment_status' | 'partner_request';
  isRead: boolean;
  relatedBooking?: string;
  createdAt: string;
}

export interface PartnerMatch {
  _id: string;
  requester: string | User;
  recipient: string | User;
  sport: string;
  status: 'pending' | 'accepted' | 'rejected';
  proposedSession?: {
    date?: string;
    facility?: string | Facility;
  };
  createdAt: string;
}

export interface EquipmentReport {
  _id: string;
  reportedBy: string | User;
  facility: string | Facility;
  equipmentDescription: string;
  issueDescription: string;
  status: 'pending' | 'noted' | 'repair_in_progress' | 'resolved';
  updatedBy?: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalMembers: number;
  totalStaff: number;
  totalFacilities: number;
  totalBookings: number;
  pendingBookings: number;
  pendingStaff: number;
}
