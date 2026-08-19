from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer
from students.models import Student
from accounts.permissions import IsAdmin


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.select_related('teacher', 'teacher__user').all().order_by('code')
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'enroll']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        course = self.get_object()
        student = Student.objects.get(pk=request.data.get('student_id'))
        enrollment, _ = Enrollment.objects.get_or_create(student=student, course=course)
        return Response(EnrollmentSerializer(enrollment).data)
