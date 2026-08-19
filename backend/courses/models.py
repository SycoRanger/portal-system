from django.db import models
from teachers.models import Teacher
from students.models import Student


class Course(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='courses')
    credit_hours = models.PositiveSmallIntegerField(default=3)

    def __str__(self):
        return self.code


class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollment')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollment')
    enrolled_on = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')
