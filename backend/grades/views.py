from rest_framework import viewsets, permissions
from .models import Grade
from .serializers import GradeSerializer
from accounts.permissions import IsAdminOrTeacher


class GradeViewSet(viewsets.ModelViewSet):
    serializer_class = GradeSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = Grade.objects.select_related('student', 'course')
        if user.role == 'student':
            return qs.filter(student__user=user)
        if user.role == 'teacher':
            return qs.filter(course__teacher__user=user)
        return qs

    def perform_create(self, serializer):
        teacher = getattr(self.request.user, 'teacher_profile', None)
        serializer.save(graded_by=teacher)
