import { PrismaClient, UserRole, EnrollmentStatus, AttendanceStatus, SubmissionStatus, ClubRole, RegistrationStatus, ApplicationStatus, FeedbackCategory, NotificationType, AnnouncementTarget } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Database Seeding...');

  // DDL views and triggers will be applied directly via psql command line tool in setup script.
  console.log('Skipping Prisma-level DDL application (applying via shell instead)...');

  // Clean old data in correct order
  console.log('Cleaning old records...');
  await prisma.activityLog.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.internship.deleteMany();
  await prisma.recruiter.deleteMany();
  await prisma.company.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.clubMember.deleteMany();
  await prisma.club.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.courseAssignment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.student.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = bcrypt.hashSync('password123', 10);

  // 2. Seed Departments
  console.log('Seeding departments...');
  const deptCSE = await prisma.department.create({
    data: { name: 'Computer Science and Engineering', code: 'CSE' }
  });
  const deptECE = await prisma.department.create({
    data: { name: 'Electronics and Communication Engineering', code: 'ECE' }
  });
  const deptME = await prisma.department.create({
    data: { name: 'Mechanical Engineering', code: 'ME' }
  });
  const deptSH = await prisma.department.create({
    data: { name: 'Science and Humanities', code: 'S&H' }
  });

  const depts = [deptCSE, deptECE, deptME, deptSH];

  // 3. Seed Admin User
  console.log('Seeding admin...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@campusconnect.edu',
      passwordHash,
      firstName: 'Albus',
      lastName: 'Dumbledore',
      role: UserRole.ADMIN
    }
  });

  // 4. Seed Faculty Users and Profiles
  console.log('Seeding faculty...');
  const facultyNames = [
    { first: 'Alan', last: 'Turing', code: 'CSE', desig: 'Professor', hours: 'Mon/Wed 10:00 - 12:00' },
    { first: 'Grace', last: 'Hopper', code: 'CSE', desig: 'Associate Professor', hours: 'Tue/Thu 14:00 - 16:00' },
    { first: 'Ada', last: 'Lovelace', code: 'ECE', desig: 'Professor', hours: 'Wed/Fri 11:00 - 13:00' },
    { first: 'Nikola', last: 'Tesla', code: 'ME', desig: 'Associate Professor', hours: 'Mon/Fri 15:00 - 17:00' },
    { first: 'Albert', last: 'Einstein', code: 'S&H', desig: 'Professor', hours: 'Tue/Wed 09:00 - 11:00' }
  ];

  const faculties = [];
  for (const f of facultyNames) {
    const user = await prisma.user.create({
      data: {
        email: `faculty.${f.first.toLowerCase()}@campusconnect.edu`,
        passwordHash,
        firstName: f.first,
        lastName: f.last,
        role: UserRole.FACULTY
      }
    });

    const dept = depts.find(d => d.code === f.code)!;
    const profile = await prisma.faculty.create({
      data: {
        userId: user.id,
        designation: f.desig,
        departmentId: dept.id,
        officeHours: f.hours
      }
    });
    faculties.push(profile);
  }

  // 5. Seed Recruiter Users and Companies
  console.log('Seeding companies and recruiters...');
  const companiesData = [
    { name: 'Google', industry: 'Technology', website: 'https://google.com', desc: 'Global technology leader specializing in search, cloud, AI, and advertising.' },
    { name: 'Microsoft', industry: 'Technology', website: 'https://microsoft.com', desc: 'Empowering people and organizations through software, devices, and cloud computing.' },
    { name: 'Tesla', industry: 'Automotive & Energy', website: 'https://tesla.com', desc: 'Accelerating the world transition to sustainable energy with electric vehicles.' }
  ];

  const recruiters = [];
  for (const c of companiesData) {
    const company = await prisma.company.create({
      data: { name: c.name, industry: c.industry, website: c.website, description: c.desc }
    });

    const user = await prisma.user.create({
      data: {
        email: `recruiter.${c.name.toLowerCase()}@${c.name.toLowerCase()}.com`,
        passwordHash,
        firstName: 'John',
        lastName: `Recruiter-${c.name}`,
        role: UserRole.RECRUITER
      }
    });

    const recruiter = await prisma.recruiter.create({
      data: {
        userId: user.id,
        companyId: company.id,
        designation: 'Talent Acquisition Manager'
      }
    });
    recruiters.push(recruiter);
  }

  // 6. Seed Students programmatically (30 students)
  console.log('Seeding students...');
  const students = [];
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Lopez', 'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen'];

  for (let i = 0; i < 30; i++) {
    const fName = firstNames[i];
    const lName = lastNames[i];
    const email = `student${i + 1}@campusconnect.edu`;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: fName,
        lastName: lName,
        role: UserRole.STUDENT
      }
    });

    // Distribute into departments
    const dept = depts[i % depts.length];
    const batch = `2023-2027`;
    const cgpa = Number((7.0 + Math.random() * 2.8).toFixed(2)); // GPA range 7.0 - 9.8

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        rollNo: `ROLL2023-${1000 + i}`,
        departmentId: dept.id,
        batch,
        cgpa
      }
    });
    students.push(student);
  }

  // 7. Seed Courses
  console.log('Seeding courses...');
  const coursesData = [
    { code: 'CS101', title: 'Introduction to Computer Science', credits: 3, dept: 'CSE' },
    { code: 'CS302', title: 'Database Management Systems', credits: 4, dept: 'CSE' },
    { code: 'CS401', title: 'Artificial Intelligence', credits: 4, dept: 'CSE' },
    { code: 'EC201', title: 'Digital Electronics', credits: 3, dept: 'ECE' },
    { code: 'EC302', title: 'Signals and Systems', credits: 4, dept: 'ECE' },
    { code: 'ME101', title: 'Engineering Mechanics', credits: 3, dept: 'ME' },
    { code: 'ME204', title: 'Thermodynamics', credits: 4, dept: 'ME' },
    { code: 'MA201', title: 'Discrete Mathematics', credits: 3, dept: 'S&H' }
  ];

  const courses = [];
  for (const c of coursesData) {
    const dept = depts.find(d => d.code === c.dept)!;
    const course = await prisma.course.create({
      data: { code: c.code, title: c.title, credits: c.credits, departmentId: dept.id }
    });
    courses.push(course);
  }

  // 8. Seed Course Assignments
  console.log('Seeding course assignments to faculty...');
  // Faculty mapping: CSE(Turing, Hopper), ECE(Lovelace), ME(Tesla), S&H(Einstein)
  const cseFaculty = faculties.filter(f => f.departmentId === deptCSE.id);
  const eceFaculty = faculties.filter(f => f.departmentId === deptECE.id);
  const meFaculty = faculties.filter(f => f.departmentId === deptME.id);
  const shFaculty = faculties.filter(f => f.departmentId === deptSH.id);

  const assignmentsToCreate = [
    { courseCode: 'CS101', faculty: cseFaculty[0] }, // Turing
    { courseCode: 'CS302', faculty: cseFaculty[1] }, // Hopper
    { courseCode: 'CS401', faculty: cseFaculty[0] }, // Turing
    { courseCode: 'EC201', faculty: eceFaculty[0] }, // Lovelace
    { courseCode: 'EC302', faculty: eceFaculty[0] }, // Lovelace
    { courseCode: 'ME101', faculty: meFaculty[0] },  // Tesla
    { courseCode: 'ME204', faculty: meFaculty[0] },  // Tesla
    { courseCode: 'MA201', faculty: shFaculty[0] }   // Einstein
  ];

  for (const asg of assignmentsToCreate) {
    const course = courses.find(c => c.code === asg.courseCode)!;
    await prisma.courseAssignment.create({
      data: {
        courseId: course.id,
        facultyId: asg.faculty.id,
        semester: 'Fall 2026',
        academicYear: '2026'
      }
    });
  }

  // 9. Seed Enrollments (30 students, each enrolled in 3 courses based on department)
  console.log('Seeding enrollments...');
  const grades = ['A', 'B', 'C', 'A+', 'B+', 'C+', 'D', null];
  const enrollments = [];

  for (let sIdx = 0; sIdx < students.length; sIdx++) {
    const student = students[sIdx];
    // Find courses they should register for
    // 1 Course related to their department, 2 generic ones
    const dept = depts.find(d => d.id === student.departmentId)!;
    const deptCourses = courses.filter(c => c.departmentId === dept.id);
    const shCourses = courses.filter(c => c.departmentId === deptSH.id || c.code === 'CS101');
    const selectedCourses = Array.from(new Set([...deptCourses, ...shCourses])).slice(0, 3);

    for (const course of selectedCourses) {
      const isPast = Math.random() > 0.3; // some completed, some ongoing
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          semester: 'Fall 2026',
          academicYear: '2026',
          status: isPast ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE,
          grade: isPast ? grades[Math.floor(Math.random() * (grades.length - 1))] : null
        }
      });
      enrollments.push(enrollment);
    }
  }

  // 10. Seed Attendance records (3 sessions per enrolled student)
  console.log('Seeding attendance...');
  const dates = [
    new Date('2026-07-01'),
    new Date('2026-07-05'),
    new Date('2026-07-10')
  ];

  for (const enrollment of enrollments) {
    for (const dt of dates) {
      const rand = Math.random();
      const status = rand > 0.85 ? AttendanceStatus.ABSENT : rand > 0.7 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;
      await prisma.attendance.create({
        data: {
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
          date: dt,
          status
        }
      });
    }
  }
  // Note: The attendance trigger update_enrollment_attendance will automatically trigger here and update enrollment attendanceRates!

  // 11. Seed Assignments (2 per course)
  console.log('Seeding assignments...');
  const assignments = [];
  for (const course of courses) {
    const asg1 = await prisma.assignment.create({
      data: {
        courseId: course.id,
        title: 'Midterm Homework Assignment',
        description: 'Complete all questions in Chapter 3 and upload code.',
        maxMarks: 100,
        dueDate: new Date('2026-07-20')
      }
    });

    const asg2 = await prisma.assignment.create({
      data: {
        courseId: course.id,
        title: 'Practical Project Milestone',
        description: 'Submit database architecture plan and UML design.',
        maxMarks: 50,
        dueDate: new Date('2026-07-30')
      }
    });
    assignments.push(asg1, asg2);
  }

  // 12. Seed Assignment Submissions (subset of students)
  console.log('Seeding assignment submissions...');
  for (let aIdx = 0; aIdx < assignments.length; aIdx++) {
    const asg = assignments[aIdx];
    // Find students enrolled in this course
    const courseEnrollments = enrollments.filter(e => e.courseId === asg.courseId);
    // Let's have 70% of enrolled students submit
    const submitters = courseEnrollments.slice(0, Math.ceil(courseEnrollments.length * 0.7));

    for (const enroll of submitters) {
      const isGraded = Math.random() > 0.3;
      const marksObtained = isGraded ? Math.floor(60 + Math.random() * 41) / 100 * asg.maxMarks : null; // 60% to 100% score

      await prisma.assignmentSubmission.create({
        data: {
          assignmentId: asg.id,
          studentId: enroll.studentId,
          submissionDate: new Date('2026-07-15'),
          fileUrl: `https://storage.googleapis.com/campusconnect-bucket/submissions/sub_${asg.id}_${enroll.studentId}.pdf`,
          status: isGraded ? SubmissionStatus.GRADED : SubmissionStatus.SUBMITTED,
          marksObtained,
          feedback: isGraded ? 'Well explained, diagrams were neat and clear.' : null
        }
      });
    }
  }

  // 13. Seed Clubs
  console.log('Seeding clubs...');
  const club1 = await prisma.club.create({
    data: {
      name: 'Campus Coding Club',
      description: 'The premier competitive coding and algorithm group of the campus.',
      category: 'Tech',
      presidentId: students[0].id // James Smith
    }
  });

  const club2 = await prisma.club.create({
    data: {
      name: 'Google Developer Group Campus',
      description: 'Community for developing tech stacks with Google Ecosystem tools.',
      category: 'Tech',
      presidentId: students[1].id // Mary Johnson
    }
  });

  const club3 = await prisma.club.create({
    data: {
      name: 'Rhythm Cultural Club',
      description: 'Music, theater, dance and literary activities of the university.',
      category: 'Cultural',
      presidentId: students[2].id // John Williams
    }
  });

  const clubs = [club1, club2, club3];

  // 14. Seed Club Members (10 students per club)
  console.log('Seeding club members...');
  for (const club of clubs) {
    // Add president as Secretary
    await prisma.clubMember.create({
      data: {
        clubId: club.id,
        studentId: club.presidentId,
        role: ClubRole.SECRETARY
      }
    });

    // Add 9 more random students
    const otherStudents = students.filter(s => s.id !== club.presidentId);
    for (let i = 0; i < 9; i++) {
      const s = otherStudents[i];
      await prisma.clubMember.create({
        data: {
          clubId: club.id,
          studentId: s.id,
          role: i === 0 ? ClubRole.COORDINATOR : ClubRole.MEMBER
        }
      });
    }
  }

  // Add one extra member to club1 to make its size 11, so that Query #7 returns a result
  await prisma.clubMember.create({
    data: {
      clubId: clubs[0].id,
      studentId: students[15].id,
      role: ClubRole.MEMBER
    }
  });

  // 15. Seed Events and Registrations
  console.log('Seeding events...');
  const ev1 = await prisma.event.create({
    data: {
      title: 'Hackathon 2026: Infinite Hack',
      description: '24-hour national level coding hackathon hosted by Campus Coding Club.',
      date: new Date('2026-08-10'),
      time: '09:00',
      location: 'Main Auditorium Hall A',
      clubId: club1.id,
      organizerId: adminUser.id,
      capacity: 100
    }
  });

  const ev2 = await prisma.event.create({
    data: {
      title: 'Flutter Developer Workshop',
      description: 'Hands-on training session for developing iOS and Android apps using Flutter.',
      date: new Date('2026-08-18'),
      time: '14:00',
      location: 'Seminar Hall 3',
      clubId: club2.id,
      organizerId: adminUser.id,
      capacity: 50
    }
  });

  const ev3 = await prisma.event.create({
    data: {
      title: 'Annual Cultural Fest: Symphony',
      description: 'Elegance, rhythm, and talent. A major cultural fest featuring music, dances and plays.',
      date: new Date('2026-09-01'),
      time: '17:00',
      location: 'University Open Ground',
      clubId: club3.id,
      organizerId: adminUser.id,
      capacity: 500
    }
  });

  // Seed Event Registrations
  console.log('Seeding event registrations...');
  const events = [ev1, ev2, ev3];
  for (const ev of events) {
    // Register 15 students to each event
    for (let i = 0; i < 15; i++) {
      await prisma.eventRegistration.create({
        data: {
          eventId: ev.id,
          userId: students[i].userId,
          status: RegistrationStatus.REGISTERED
        }
      });
    }
  }

  // 16. Seed Internships
  console.log('Seeding internships...');
  const internships = [];
  const googleCompany = await prisma.company.findUnique({ where: { name: 'Google' } })!;
  const msCompany = await prisma.company.findUnique({ where: { name: 'Microsoft' } })!;
  const teslaCompany = await prisma.company.findUnique({ where: { name: 'Tesla' } })!;

  const int1 = await prisma.internship.create({
    data: {
      companyId: googleCompany.id,
      title: 'Software Engineering Intern',
      description: 'Work alongside search and cloud infra teams to build scalable backend systems.',
      location: 'Bangalore, India',
      type: 'Full-time',
      stipend: 80000,
      durationMonths: 6,
      deadline: new Date('2026-09-15')
    }
  });

  const int2 = await prisma.internship.create({
    data: {
      companyId: googleCompany.id,
      title: 'UI/UX Design Intern',
      description: 'Design intuitive interfaces for Google Workspace suite extensions.',
      location: 'Remote',
      type: 'Remote',
      stipend: 65000,
      durationMonths: 3,
      deadline: new Date('2026-09-20')
    }
  });

  const int3 = await prisma.internship.create({
    data: {
      companyId: msCompany.id,
      title: 'Azure Cloud Consultant Intern',
      description: 'Assist enterprise partners in migrating architectures to Azure.',
      location: 'Hyderabad, India',
      type: 'Full-time',
      stipend: 75000,
      durationMonths: 6,
      deadline: new Date('2026-09-10')
    }
  });

  const int4 = await prisma.internship.create({
    data: {
      companyId: teslaCompany.id,
      title: 'Embedded Systems Developer Intern',
      description: 'Write low level firmware for autopilot sensors and infotainment panels.',
      location: 'Austin, TX (USA)',
      type: 'Full-time',
      stipend: 120000,
      durationMonths: 6,
      deadline: new Date('2026-10-01')
    }
  });
  internships.push(int1, int2, int3, int4);

  // 17. Seed Applications (Student internship applications)
  console.log('Seeding applications...');
  const appStatus = [
    ApplicationStatus.APPLIED,
    ApplicationStatus.SCREENING,
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.OFFERED,
    ApplicationStatus.REJECTED
  ];

  // Let's create 15 applications
  for (let i = 0; i < 15; i++) {
    const student = students[i];
    const internship = internships[i % internships.length];
    const status = appStatus[i % appStatus.length];

    await prisma.application.create({
      data: {
        internshipId: internship.id,
        studentId: student.id,
        resumeUrl: `https://storage.googleapis.com/campusconnect-bucket/resumes/resume_${student.rollNo}.pdf`,
        coverLetter: `Hi, I am excited to apply for the ${internship.title} position. I have solid experience in these languages.`,
        status
      }
    });
  }

  // 18. Seed Feedbacks
  console.log('Seeding feedbacks...');
  const categories = [FeedbackCategory.ACADEMIC, FeedbackCategory.INFRASTRUCTURE, FeedbackCategory.SERVICES, FeedbackCategory.GENERAL];
  for (let i = 0; i < 10; i++) {
    await prisma.feedback.create({
      data: {
        userId: students[i].userId,
        category: categories[i % categories.length],
        rating: 3 + (i % 3), // 3, 4, 5
        comments: `This is feedback number ${i + 1}. The labs are well equipped and faculty members are helpful.`
      }
    });
  }

  // 19. Seed Notifications
  console.log('Seeding notifications...');
  for (let i = 0; i < 15; i++) {
    await prisma.notification.create({
      data: {
        userId: students[i].userId,
        title: 'Welcome to CampusConnect!',
        message: 'Your account has been set up successfully. Explore course registration, internships, and clubs.',
        type: NotificationType.ALERT,
        isRead: i > 7
      }
    });
  }

  // 20. Seed Announcements
  console.log('Seeding announcements...');
  await prisma.announcement.create({
    data: {
      title: 'End Semester Evaluation Schedule Released',
      content: 'The end-semester exam dates are announced. Assessments start December 1st. Check portal for timetables.',
      type: AnnouncementTarget.ALL,
      creatorId: adminUser.id
    }
  });

  await prisma.announcement.create({
    data: {
      title: 'CSE Department Research Symposium',
      content: 'Students are invited to submit papers on machine learning and databases by August 15th.',
      type: AnnouncementTarget.DEPARTMENT,
      departmentId: deptCSE.id,
      creatorId: adminUser.id
    }
  });

  await prisma.announcement.create({
    data: {
      title: 'Internship Placement Guidelines Briefing',
      content: 'Placements cell will hold a mandatory guidelines briefing on Microsoft Teams on August 5th.',
      type: AnnouncementTarget.STUDENTS,
      creatorId: adminUser.id
    }
  });

  console.log('Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
