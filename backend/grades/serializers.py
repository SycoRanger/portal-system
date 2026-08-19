from rest_framework import serializers
from .models import Grade
from .utils import letter_grade


class GradeSerializer(serializers.ModelSerializer):
    percentage = serializers.SerializerMethodField()
    letter_grade = serializers.SerializerMethodField()
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = Grade
        fields = [
            'id', 'student', 'course', 'course_code', 'course_name',
            'marks_obtained', 'total_marks', 'exam_type', 'graded_by',
            'percentage', 'letter_grade',
        ]
        read_only_fields = ['graded_by']

    def get_percentage(self, obj):
        if not obj.total_marks:
            return None
        return round(float(obj.marks_obtained) / float(obj.total_marks) * 100, 2)

    def get_letter_grade(self, obj):
        return letter_grade(self.get_percentage(obj))
