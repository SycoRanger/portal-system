from rest_framework import viewsets, permissions
from .models import Student
from .serializers import StudentSerializer
from accounts.permissions import IsAdmin


class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Student.objects.filter(user=user)
        return Student.objects.select_related('user').all().order_by('-id')
