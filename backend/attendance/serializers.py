from rest_framework import serializers
from .models import Attendance
from students.serializers import StudentSerializer
from courses.serializers import CourseSerializer


class AttendanceSerializer(serializers.ModelSerializer):
    student_detail = StudentSerializer(source='student', read_only=True)
    course_detail = CourseSerializer(source='course', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'student', 'student_detail', 'course', 'course_detail', 'date', 'status', 'marked_by']
        read_only_fields = ['marked_by']
