export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
};

export type ApiError = {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
};

export type Customer = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  type: 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
  address: string;
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE';
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  followUps?: FollowUp[];
};

export type FollowUp = {
  id: string;
  note: string;
  followUpDate?: string | null;
  createdAt: string;
  createdBy: { id: string; name: string; email: string };
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: string | number;
  currentStock: number;
  minStockAlert: number;
  location: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StockMovement = {
  id: string;
  productId: string;
  quantity: number;
  type: 'IN' | 'OUT';
  reason: string;
  createdAt: string;
  product: { id: string; name: string; sku: string };
  createdBy: { id: string; name: string; email: string };
};

export type ChallanItem = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: string | number;
  quantity: number;
};

export type Challan = {
  id: string;
  challanNumber: string;
  customerId: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
  customer: Customer | { id: string; name: string; businessName: string };
  createdBy: { id: string; name: string; email: string };
  items: ChallanItem[];
};

export type DashboardData = {
  counts: {
    customers: number;
    activeProducts: number;
    draftChallans: number;
    confirmedChallans: number;
    lowStock: number;
  };
  lowStock: Product[];
  followUpsDue: Customer[];
};
