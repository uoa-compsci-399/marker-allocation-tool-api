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

export interface Application {
  markerID: number;
  year: number;
  availability: number;
  curriculumVitae: Buffer;
  academicRecord: Buffer;
  areaOfStudy: string;
  enrolmentStatus: string;
  workEligible: number;
  inAuckland: number;
  availabilityConstraint: string;
  relevantExperience: string;
  declaration: number;
}

export interface ApplicationRow extends Application {
  applicationID: number;
}

// For use with bit fields
export enum Semester {
  SummerSchool = 0x1,
  SemesterOne = 0x2,
  SemesterTwo = 0x4,
}
