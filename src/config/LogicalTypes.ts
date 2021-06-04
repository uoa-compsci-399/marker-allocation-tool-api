import { User } from '../db/DatabaseTypes';

export interface LogicalDatabaseImage {
  markerCoordinators?: Record<string, LogicalMarkerCoordinator>;
  courseCoordinators?: Record<string, LogicalCourseCoordinator>;
  markers?: Record<string, LogicalMarker>;
  // `users` should not be necessary, but it is included for extensibility
  users?: Record<string, LogicalUser>;
  courses?: Record<string, LogicalCourse>;
  applications?: Record<string, LogicalApplication>;
}

export interface LogicalUser extends User {
  tokensByName?: string[];
}

export interface LogicalUserToken {
  createdAt: string;
  value: string;
}

export interface LogicalMarkerCoordinator extends LogicalUser {}

export interface LogicalCourseCoordinator extends LogicalUser {
  coursesByName?: string[];
}

export interface LogicalMarker extends LogicalUser {
  studentID: string;
  dateOfBirth: string;
  applicationsByName?: string[];
}

export interface LogicalCourse {
  courseName: string;
  enrolmentEstimate: number;
  enrolmentFinal: number;
  expectedWorkload: number;
  preferredMarkerCount: number;
  semesters: number;
  year: number;
  applicationClosingDate?: string;
  courseInfoDeadline?: string;
  markerAssignmentDeadline?: string;
  markerPrefDeadline?: string;
  isPublished: number;
  otherNotes?: string;
  workloadDistributionsByName?: string[];
}

export interface LogicalApplicationCourse {
  status: number;
  hoursAllocated: number;
}

export interface LogicalCourseCoordinatorCourse {
  permissions: number;
}

export interface LogicalWorkloadDistribution {
  assignment: string;
  workload: number;
}

export interface LogicalApplication {
  year: number;
  availability: number;
  curriculumVitae: Buffer;
  academicRecord: Buffer;
  areaOfStudy: string;
  enrolmentStatus: string;
  workEligible: number;
  inAuckland: number;
  declaration: number;
  coursesByName?: string[];
}
