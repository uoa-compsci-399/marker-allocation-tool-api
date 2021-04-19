export interface RequestBody {
  id: string;
}

export interface UserRequest extends RequestBody {
  userID: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface ApplicationRequest extends RequestBody {
  applicationID: string;
  markerID: string;
  year: string;
  whichSemestersField: string;
  appliedCourses: string;
  curriculumVitae: string;
  academicRecord: string;
  hoursRequested: string;
  relevantExperience: string;
}

export interface CourseRequest extends RequestBody {
  courseID: string;
  courseName: string;
  year: string;
  whichSemestersField: string;
  isPublished: string;
  enrolmentEstimate: string;
  enrolmentFinal: string;
  workload: string;
  courseInfoDeadline: string;
  applicationDeadline: string;
  markerPrefDeadline: string;
  markerAssignmentDeadline: string;
  otherTasks: string;
}
