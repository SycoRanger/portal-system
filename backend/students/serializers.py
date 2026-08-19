from rest_framework import serializers
from .models import Student
from accounts.models import User
from accounts.serializers import UserSerializer


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True, required=False
    )
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = Student
        fields = [
            'id', 'user', 'user_id', 'student_id', 'date_of_birth', 'address',
            'first_name', 'last_name', 'email',
        ]

    def update(self, instance, validated_data):
        # Allow updating linked user's basic fields (name/email) from the same form
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        email = validated_data.pop('email', None)
        validated_data.pop('user', None)  # never reassign the linked user on update

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
