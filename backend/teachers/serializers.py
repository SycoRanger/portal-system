from rest_framework import serializers
from .models import Teacher
from accounts.models import User
from accounts.serializers import UserSerializer


class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True, required=False
    )
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = Teacher
        fields = [
            'id', 'user', 'user_id', 'teacher_id', 'department',
            'first_name', 'last_name', 'email',
        ]

    def update(self, instance, validated_data):
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        email = validated_data.pop('email', None)
        validated_data.pop('user', None)

        if first_name is not None or last_name is not None or email is not None:
            user = instance.user
            if first_name is not None:
                user.first_name = first_name
            if last_name is not None:
                user.last_name = last_name
            if email is not None:
                user.email = email
            user.save()

        return super().update(instance, validated_data)
