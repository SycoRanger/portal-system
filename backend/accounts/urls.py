from django.urls import path
from .views import RegisterView, MeView, ChangePasswordView, AdminResetPasswordView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('me/', MeView.as_view()),
    path('change-password/', ChangePasswordView.as_view()),
    path('reset-password/<int:user_id>/', AdminResetPasswordView.as_view()),
]
