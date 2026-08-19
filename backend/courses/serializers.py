from rest_framework import serializers
from .models import Course, Enrollment
from teachers.models import Teacher
from teachers.serializers import TeacherSerializer
from students.serializers import StudentSerializer


class CourseSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(read_only=True)
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=Teacher.objects.all(), source='teacher', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Course
        fields = ['id', 'code', 'name', 'teacher', 'teacher_id', 'credit_hours']


class EnrollmentSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'course', 'enrolled_on']
