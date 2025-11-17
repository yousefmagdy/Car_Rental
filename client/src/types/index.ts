export interface Car {
  _id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  dailyRate: number;
  status: 'available' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  driverLicense: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rental {
  _id: string;
  car: Car | string;
  client: Client | string;
  employee: Employee | string;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export type CarFormData = Omit<Car, '_id' | 'createdAt' | 'updatedAt'>;
export type EmployeeFormData = Omit<Employee, '_id' | 'createdAt' | 'updatedAt'>;
export type ClientFormData = Omit<Client, '_id' | 'createdAt' | 'updatedAt'>;
export type RentalFormData = Omit<Rental, '_id' | 'createdAt' | 'updatedAt'>;

