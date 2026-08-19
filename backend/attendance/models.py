from django.db import models
from students.models import Student
from courses.models import Course
from teachers.models import Teacher


class Attendance(models.Model):
    STATUS_CHOICES = [('present', 'Present'), ('absent', 'Absent'), ('leave', 'Leave')]
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    marked_by = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = ('student', 'course', 'date')
        ordering = ['-date']
