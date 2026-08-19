from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from students.models import Student
from teachers.models import Teacher
from courses.models import Course
from attendance.models import Attendance
from grades.models import Grade
from grades.utils import letter_grade


class DashboardSummaryView(APIView):
    def get(self, request):
        user = request.user

        if user.role == 'admin':
            total_students = Student.objects.count()
            total_teachers = Teacher.objects.count()
            total_courses = Course.objects.count()
            today = timezone.now().date()
            today_attendance = Attendance.objects.filter(date=today)
            present_today = today_attendance.filter(status='present').count()
            marked_today = today_attendance.count()
            recent_students = Student.objects.select_related('user').order_by('-id')[:5]

            return Response({
                'total_students': total_students,
                'total_teachers': total_teachers,
                'total_courses': total_courses,
                'attendance_today': {
                    'marked': marked_today,
                    'present': present_today,
                    'percentage': round(present_today / marked_today * 100, 1) if marked_today else None,
                },
                'recent_students': [
                    {'student_id': s.student_id, 'name': s.user.get_full_name() or s.user.username}
                    for s in recent_students
                ],
            })

        if user.role == 'teacher':
            teacher = user.teacher_profile
            courses = Course.objects.filter(teacher=teacher)
            student_count = Student.objects.filter(enrollment__course__in=courses).distinct().count()
            today = timezone.now().date()
            marked_today = Attendance.objects.filter(course__in=courses, date=today).count()

            return Response({
                'total_courses': courses.count(),
                'total_students': student_count,
                'attendance_marked_today': marked_today,
                'courses': [{'id': c.id, 'code': c.code, 'name': c.name} for c in courses],
            })

        if user.role == 'student':
            student = user.student_profile
            grades = Grade.objects.filter(student=student).select_related('course')
            attendance = Attendance.objects.filter(student=student)
            total_marked = attendance.count()
            present = attendance.filter(status='present').count()

            course_attendance = {}
            for a in attendance:
                key = a.course.code
                course_attendance.setdefault(key, {'present': 0, 'total': 0})
                course_attendance[key]['total'] += 1
                if a.status == 'present':
                    course_attendance[key]['present'] += 1

            grade_list = []
            for g in grades:
                pct = round(float(g.marks_obtained) / float(g.total_marks) * 100, 2) if g.total_marks else None
                grade_list.append({
                    'course': g.course.code,
                    'exam_type': g.exam_type,
                    'marks_obtained': g.marks_obtained,
                    'total_marks': g.total_marks,
                    'percentage': pct,
                    'letter_grade': letter_grade(pct),
                })

            return Response({
                'overall_attendance_percentage': round(present / total_marked * 100, 1) if total_marked else None,
                'attendance_by_course': [
                    {'course': k, 'present': v['present'], 'total': v['total'],
                     'percentage': round(v['present'] / v['total'] * 100, 1)}
                    for k, v in course_attendance.items()
                ],
                'grades': grade_list,
            })

        return Response({})
