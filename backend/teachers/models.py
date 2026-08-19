from django.db import models
from accounts.models import User


class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    teacher_id = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.teacher_id
