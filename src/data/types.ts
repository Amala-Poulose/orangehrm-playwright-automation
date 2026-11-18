export interface LoginCredentials {
  username: string;
  password: string;
}

export interface EmployeeData {
  firstName: string;
  middleName?: string;
  lastName: string;
  employeeId: string;
  login?: LoginCredentials;
}

export interface EmployeeUpdate {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  otherId?: string;
  maritalStatus?: 'Single' | 'Married' | 'Other';
}
