-- ==========================================
-- SECTION 1: TRIGGER FUNCTIONS AND TRIGGERS
-- ==========================================

-- 1. Trigger for Attendance Updates
-- Automatically updates "attendanceRate" in "Enrollment" when "Attendance" is modified.
CREATE OR REPLACE FUNCTION update_enrollment_attendance()
RETURNS TRIGGER AS $$
DECLARE
    v_student_id VARCHAR;
    v_course_id VARCHAR;
    v_total INT;
    v_present INT;
    v_rate DOUBLE PRECISION;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_student_id := OLD."studentId";
        v_course_id := OLD."courseId";
    ELSE
        v_student_id := NEW."studentId";
        v_course_id := NEW."courseId";
    END IF;

    -- Count total classes scheduled for this student in this course
    SELECT COUNT(*) INTO v_total
    FROM "Attendance"
    WHERE "studentId" = v_student_id AND "courseId" = v_course_id;

    -- Count present and late classes (late counts as present for percentage)
    SELECT COUNT(*) INTO v_present
    FROM "Attendance"
    WHERE "studentId" = v_student_id 
      AND "courseId" = v_course_id 
      AND status IN ('PRESENT', 'LATE');

    IF v_total > 0 THEN
        v_rate := (v_present::DOUBLE PRECISION / v_total::DOUBLE PRECISION) * 100.0;
    ELSE
        v_rate := 0.0;
    END IF;

    -- Update the specific Enrollment attendanceRate
    -- We match on studentId and courseId. (We assume the current active enrollment or all enrollments match)
    UPDATE "Enrollment"
    SET "attendanceRate" = v_rate, "updatedAt" = NOW()
    WHERE "studentId" = v_student_id AND "courseId" = v_course_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_attendance_change ON "Attendance";
CREATE TRIGGER trg_attendance_change
AFTER INSERT OR UPDATE OR DELETE ON "Attendance"
FOR EACH ROW EXECUTE FUNCTION update_enrollment_attendance();


-- 2. Trigger for Application Status History
-- Automatically records status history details when an Application changes status.
CREATE OR REPLACE FUNCTION log_application_status_history()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO "ApplicationStatusHistory" (id, "applicationId", status, "changedById", "changedAt")
        VALUES (gen_random_uuid()::VARCHAR, NEW.id, NEW.status, NULL, NOW());
    ELSIF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO "ApplicationStatusHistory" (id, "applicationId", status, "changedById", "changedAt")
        VALUES (gen_random_uuid()::VARCHAR, NEW.id, NEW.status, NULL, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_application_status_history ON "Application";
CREATE TRIGGER trg_application_status_history
AFTER INSERT OR UPDATE ON "Application"
FOR EACH ROW EXECUTE FUNCTION log_application_status_history();


-- 3. Trigger for Placement Status Notifications
-- Automatically alerts students when recruiters update their internship application status.
CREATE OR REPLACE FUNCTION generate_placement_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id VARCHAR;
    v_internship_title VARCHAR;
    v_company_name VARCHAR;
BEGIN
    -- Only trigger on status updates
    IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        -- Get the student's User ID
        SELECT "userId" INTO v_user_id
        FROM "Student"
        WHERE id = NEW."studentId";

        -- Get internship title and company name
        SELECT i.title, c.name INTO v_internship_title, v_company_name
        FROM "Internship" i
        JOIN "Company" c ON i."companyId" = c.id
        WHERE i.id = NEW."internshipId";

        -- Insert notification
        INSERT INTO "Notification" (id, "userId", title, message, "isRead", type, "createdAt", "updatedAt")
        VALUES (
            gen_random_uuid()::VARCHAR,
            v_user_id,
            'Internship Application Update',
            CONCAT('Your application for "', v_internship_title, '" at ', v_company_name, ' has been updated to: ', NEW.status),
            FALSE,
            'PLACEMENT',
            NOW(),
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_placement_notification ON "Application";
CREATE TRIGGER trg_placement_notification
AFTER UPDATE ON "Application"
FOR EACH ROW EXECUTE FUNCTION generate_placement_notification();


-- 4. Trigger for Auditing Core Database Changes
-- Log user activity automatically on sensitive actions
CREATE OR REPLACE FUNCTION audit_user_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_details VARCHAR;
    v_user_id VARCHAR;
BEGIN
    IF (TG_TABLE_NAME = 'User') THEN
        v_user_id := NEW.id;
        v_details := CONCAT('User accounts created or updated: ', NEW.email, ' (Role: ', NEW.role, ')');
    ELSIF (TG_TABLE_NAME = 'Enrollment') THEN
        SELECT "userId" INTO v_user_id FROM "Student" WHERE id = NEW."studentId";
        v_details := CONCAT('Student enrolled in Course ID: ', NEW."courseId", ' (Semester: ', NEW.semester, ')');
    ELSIF (TG_TABLE_NAME = 'Application') THEN
        SELECT "userId" INTO v_user_id FROM "Student" WHERE id = NEW."studentId";
        v_details := CONCAT('Student applied to Internship ID: ', NEW."internshipId", ' (Status: ', NEW.status, ')');
    ELSE
        v_user_id := NULL;
        v_details := CONCAT('Audit triggered on table: ', TG_TABLE_NAME);
    END IF;

    INSERT INTO "ActivityLog" (id, "userId", action, details, "ipAddress", "createdAt")
    VALUES (
        gen_random_uuid()::VARCHAR,
        v_user_id,
        CONCAT(TG_OP, ' ', TG_TABLE_NAME),
        v_details,
        '127.0.0.1',
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_user ON "User";
CREATE TRIGGER trg_audit_user
AFTER INSERT OR UPDATE ON "User"
FOR EACH ROW EXECUTE FUNCTION audit_user_activity();

DROP TRIGGER IF EXISTS trg_audit_enrollment ON "Enrollment";
CREATE TRIGGER trg_audit_enrollment
AFTER INSERT ON "Enrollment"
FOR EACH ROW EXECUTE FUNCTION audit_user_activity();

DROP TRIGGER IF EXISTS trg_audit_application ON "Application";
CREATE TRIGGER trg_audit_application
AFTER INSERT ON "Application"
FOR EACH ROW EXECUTE FUNCTION audit_user_activity();


-- ==========================================
-- SECTION 2: STORED PROCEDURES / FUNCTIONS
-- ==========================================

-- 1. EnrollStudent()
CREATE OR REPLACE FUNCTION EnrollStudent(
    p_student_id VARCHAR,
    p_course_id VARCHAR,
    p_semester VARCHAR,
    p_academic_year VARCHAR
)
RETURNS VARCHAR AS $$
DECLARE
    v_exists INT;
    v_enrollment_id VARCHAR;
BEGIN
    -- Check if duplicate enrollment exists
    SELECT COUNT(*) INTO v_exists
    FROM "Enrollment"
    WHERE "studentId" = p_student_id
      AND "courseId" = p_course_id
      AND semester = p_semester
      AND "academicYear" = p_academic_year;

    IF v_exists > 0 THEN
        RAISE EXCEPTION 'Student is already enrolled in this course for this semester.';
    END IF;

    -- Generate UUID for enrollment
    v_enrollment_id := gen_random_uuid()::VARCHAR;

    -- Insert enrollment record
    INSERT INTO "Enrollment" (id, "studentId", "courseId", semester, "academicYear", "enrollmentDate", grade, "attendanceRate", status, "createdAt", "updatedAt")
    VALUES (v_enrollment_id, p_student_id, p_course_id, p_semester, p_academic_year, NOW(), NULL, 0.0, 'ACTIVE', NOW(), NOW());

    RETURN v_enrollment_id;
END;
$$ LANGUAGE plpgsql;


-- 2. ApplyForInternship()
CREATE OR REPLACE FUNCTION ApplyForInternship(
    p_student_id VARCHAR,
    p_internship_id VARCHAR,
    p_resume_url VARCHAR,
    p_cover_letter TEXT
)
RETURNS VARCHAR AS $$
DECLARE
    v_deadline TIMESTAMP;
    v_exists INT;
    v_cgpa FLOAT;
    v_application_id VARCHAR;
BEGIN
    -- Check eligibility (CGPA >= 6.0)
    SELECT cgpa INTO v_cgpa FROM "Student" WHERE id = p_student_id;
    IF v_cgpa < 6.0 THEN
        RAISE EXCEPTION 'Ineligible: Student CGPA must be 6.0 or higher to apply for internships.';
    END IF;

    -- Check internship deadline
    SELECT deadline INTO v_deadline FROM "Internship" WHERE id = p_internship_id;
    IF v_deadline < NOW() THEN
        RAISE EXCEPTION 'Application deadline has passed.';
    END IF;

    -- Check duplicate application
    SELECT COUNT(*) INTO v_exists
    FROM "Application"
    WHERE "studentId" = p_student_id AND "internshipId" = p_internship_id;

    IF v_exists > 0 THEN
        RAISE EXCEPTION 'Student has already applied for this internship.';
    END IF;

    -- Insert application
    v_application_id := gen_random_uuid()::VARCHAR;
    INSERT INTO "Application" (id, "internshipId", "studentId", "applicationDate", "resumeUrl", "coverLetter", status, "createdAt", "updatedAt")
    VALUES (v_application_id, p_internship_id, p_student_id, NOW(), p_resume_url, p_cover_letter, 'APPLIED', NOW(), NOW());

    RETURN v_application_id;
END;
$$ LANGUAGE plpgsql;


-- 3. RegisterForEvent()
CREATE OR REPLACE FUNCTION RegisterForEvent(
    p_user_id VARCHAR,
    p_event_id VARCHAR
)
RETURNS VARCHAR AS $$
DECLARE
    v_capacity INT;
    v_registered INT;
    v_exists INT;
    v_reg_id VARCHAR;
BEGIN
    -- Check if registered already
    SELECT COUNT(*) INTO v_exists
    FROM "EventRegistration"
    WHERE "eventId" = p_event_id AND "userId" = p_user_id;

    IF v_exists > 0 THEN
        RAISE EXCEPTION 'User is already registered for this event.';
    END IF;

    -- Check capacity
    SELECT capacity INTO v_capacity FROM "Event" WHERE id = p_event_id;
    SELECT COUNT(*) INTO v_registered FROM "EventRegistration" WHERE "eventId" = p_event_id AND status != 'CANCELLED';

    IF v_registered >= v_capacity THEN
        RAISE EXCEPTION 'Event is full. Registration closed.';
    END IF;

    -- Insert registration
    v_reg_id := gen_random_uuid()::VARCHAR;
    INSERT INTO "EventRegistration" (id, "eventId", "userId", "registrationDate", status, "createdAt", "updatedAt")
    VALUES (v_reg_id, p_event_id, p_user_id, NOW(), 'REGISTERED', NOW(), NOW());

    RETURN v_reg_id;
END;
$$ LANGUAGE plpgsql;


-- 4. SubmitAssignment()
CREATE OR REPLACE FUNCTION SubmitAssignment(
    p_student_id VARCHAR,
    p_assignment_id VARCHAR,
    p_file_url VARCHAR
)
RETURNS VARCHAR AS $$
DECLARE
    v_due_date TIMESTAMP;
    v_status VARCHAR;
    v_sub_id VARCHAR;
    v_exists_id VARCHAR;
BEGIN
    -- Retrieve due date
    SELECT "dueDate" INTO v_due_date FROM "Assignment" WHERE id = p_assignment_id;

    -- Determine submission status
    IF NOW() > v_due_date THEN
        v_status := 'LATE';
    ELSE
        v_status := 'SUBMITTED';
    END IF;

    -- Check if submission already exists
    SELECT id INTO v_exists_id
    FROM "AssignmentSubmission"
    WHERE "assignmentId" = p_assignment_id AND "studentId" = p_student_id;

    IF v_exists_id IS NOT NULL THEN
        -- Update existing submission
        UPDATE "AssignmentSubmission"
        SET "fileUrl" = p_file_url, "submissionDate" = NOW(), status = v_status::"SubmissionStatus", "updatedAt" = NOW()
        WHERE id = v_exists_id;
        RETURN v_exists_id;
    ELSE
        -- Insert new submission
        v_sub_id := gen_random_uuid()::VARCHAR;
        INSERT INTO "AssignmentSubmission" (id, "assignmentId", "studentId", "submissionDate", "marksObtained", feedback, "fileUrl", status, "createdAt", "updatedAt")
        VALUES (v_sub_id, p_assignment_id, p_student_id, NOW(), NULL, NULL, p_file_url, v_status::"SubmissionStatus", NOW(), NOW());
        RETURN v_sub_id;
    END IF;
END;
$$ LANGUAGE plpgsql;


-- 5. GenerateStudentReport()
CREATE OR REPLACE FUNCTION GenerateStudentReport(p_student_id VARCHAR)
RETURNS JSON AS $$
DECLARE
    v_profile JSON;
    v_academics JSON;
    v_activities JSON;
    v_placements JSON;
    v_result JSON;
BEGIN
    -- Profile Section
    SELECT json_build_object(
        'student_id', s.id,
        'roll_no', s."rollNo",
        'name', CONCAT(u."firstName", ' ', u."lastName"),
        'email', u.email,
        'department', d.name,
        'batch', s.batch,
        'cgpa', s.cgpa
    ) INTO v_profile
    FROM "Student" s
    JOIN "User" u ON s."userId" = u.id
    JOIN "Department" d ON s."departmentId" = d.id
    WHERE s.id = p_student_id;

    -- Academic summary
    SELECT json_agg(
        json_build_object(
            'course_code', c.code,
            'course_title', c.title,
            'semester', e.semester,
            'grade', COALESCE(e.grade, 'Ongoing'),
            'attendance_rate', e."attendanceRate",
            'submissions_count', (
                SELECT COUNT(*) FROM "AssignmentSubmission" sub 
                JOIN "Assignment" a ON sub."assignmentId" = a.id 
                WHERE sub."studentId" = p_student_id AND a."courseId" = c.id
            )
        )
    ) INTO v_academics
    FROM "Enrollment" e
    JOIN "Course" c ON e."courseId" = c.id
    WHERE e."studentId" = p_student_id;

    -- Extra-curricular & Clubs
    SELECT json_agg(
        json_build_object(
            'club_name', cl.name,
            'role', m.role,
            'joined_on', m."joinDate"
        )
    ) INTO v_activities
    FROM "ClubMember" m
    JOIN "Club" cl ON m."clubId" = cl.id
    WHERE m."studentId" = p_student_id;

    -- Placement applications
    SELECT json_agg(
        json_build_object(
            'job_title', i.title,
            'company', comp.name,
            'stipend', i.stipend,
            'status', app.status,
            'applied_on', app."applicationDate"
        )
    ) INTO v_placements
    FROM "Application" app
    JOIN "Internship" i ON app."internshipId" = i.id
    JOIN "Company" comp ON i."companyId" = comp.id
    WHERE app."studentId" = p_student_id;

    -- Merge everything
    v_result := json_build_object(
        'profile', v_profile,
        'academics', COALESCE(v_academics, '[]'::json),
        'extracurricular', COALESCE(v_activities, '[]'::json),
        'placements', COALESCE(v_placements, '[]'::json)
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;
