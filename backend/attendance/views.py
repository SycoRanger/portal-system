from rest_framework import viewsets, permissions
from .models import Attendance
from .serializers import AttendanceSerializer
from accounts.permissions import IsAdminOrTeacher


class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = Attendance.objects.select_related('student', 'student__user', 'course')

        if user.role == 'student':
            qs = qs.filter(student__user=user)
        elif user.role == 'teacher':
            qs = qs.filter(course__teacher__user=user)

        # optional history filters
        course_id = self.request.query_params.get('course')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if course_id:
            qs = qs.filter(course_id=course_id)
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)

        return qs

    def perform_create(self, serializer):
        teacher = getattr(self.request.user, 'teacher_profile', None)
        serializer.save(marked_by=teacher)
