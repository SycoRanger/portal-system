from rest_framework import viewsets, permissions
from .models import Teacher
from .serializers import TeacherSerializer
from accounts.permissions import IsAdmin


class TeacherViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'teacher':
            return Teacher.objects.filter(user=user)
        return Teacher.objects.select_related('user').all().order_by('-id')
