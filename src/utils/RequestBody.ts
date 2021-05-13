export interface RequestBody {
  id: string;

  forEach(param: (value: any) => void): void;
}

export interface UserRequest extends RequestBody {
  userID: string;
  firstName: string;
  lastName: string;
  email: string;
  upi: string;
  role: string;
}

export interface ApplicationRequestPreAuth extends RequestBody {
  // User
  firstName: string;
  lastName: string;
  email: string;
  // Marker
  studentId: string;
  dateOfBirth: string;
  // Application
  areaOfStudy: string;
  enrolmentStatus: string;
  availability: string[];
  academicRecord: string;
  curriculumVitae: string;
  workEligible: number;
  inAuckland: number;
  declaration: number;
  // ApplicationCourse[]
  selectedCourses: string[];
}

export interface ApplicationRequest extends RequestBody {
  applicationID: string;
  markerID: string;
  year: string;
  whichSemestersField: string;
  selectedCourse: string[];
  curriculumVitae: string;
  academicRecord: string;
  hoursRequested: string;
  relevantExperience: string;
}

export interface CourseRequest extends RequestBody {
  courseID: string;
  courseName: string;
  enrolmentEstimate: string;
  enrolmentFinal: string;
  expectedWorkload: string;
  preferredMarkerCount: string;
  courseCoordinators: string;
  semesters: string;
  year: string;
  applicationClosingDate: string;
  courseInfoDeadline: string;
  markerAssignmentDeadline: string;
  markerPrefDeadline: string;
  isPublished: string;
  otherNotes: string;
}

export interface CourseID {
  courseID: string;
}

export interface UserID {
  userID: string;
}

export interface ActiveCourse {
  courseName: string;
}

export interface CourseCoordinatorFull {
  courseCoordinator: string;
}

export interface Marker {
  userID: number;
}
