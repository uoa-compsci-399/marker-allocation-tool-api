export interface User {
  firstName: string;
  lastName: string;
  email: string;
  upi: string;
  role: string;
}

export interface UserRow extends User {
  userID: number;
}
