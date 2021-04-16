export interface UserRequest {
  userID: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface ApplicationRequest {
  applicationID: string;
  applicantID: string;
  courseID: string;
  CV: string;
  relevantExperience: string;
}
