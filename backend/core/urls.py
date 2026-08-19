from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', TokenObtainPairView.as_view()),
    path('api/auth/refresh/', TokenRefreshView.as_view()),
    path('api/accounts/', include('accounts.urls')),
    path('api/students/', include('students.urls')),
    path('api/teachers/', include('teachers.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/attendance/', include('attendance.urls')),
    path('api/grades/', include('grades.urls')),
    path('api/dashboard/', include('dashboard.urls')),
]
