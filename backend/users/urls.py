from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    ProfileView,
    TransactionHistoryView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    InstructorApplicationViewSet,
    UserManageViewSet,
    StudentViewSet,
    SiteSettingsView
)

from .views import NotificationViewSet
router = DefaultRouter()
router.register(r'instructor-applications', InstructorApplicationViewSet, basename='instructor-application')
router.register(r'manage', UserManageViewSet, basename='manage-users')
router.register(r'students', StudentViewSet, basename='students')
router.register(r'notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('settings/', SiteSettingsView.as_view(), name='site_settings'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('transactions/', TransactionHistoryView.as_view(), name='transactions'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('', include(router.urls)),
]
