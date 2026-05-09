from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings

from .models import User, Profile, InstructorApplication, SiteSettings
from .serializers import (
    UserSerializer, 
    UserWriteSerializer, 
    ProfileSerializer,
    CustomTokenObtainPairSerializer,
    InstructorApplicationSerializer,
    SiteSettingsSerializer
)

class SiteSettingsView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        settings_obj = SiteSettings.objects.first()
        if not settings_obj:
            settings_obj = SiteSettings.objects.create()
        serializer = SiteSettingsSerializer(settings_obj)
        return Response(serializer.data)

    def put(self, request):
        if not (request.user.is_authenticated and (request.user.is_superuser or request.user.role == 'administrator')):
            return Response({'error': 'Unauthorized'}, status=403)
        
        settings_obj = SiteSettings.objects.first()
        if not settings_obj:
            settings_obj = SiteSettings.objects.create()
        
        serializer = SiteSettingsSerializer(settings_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserWriteSerializer

    def perform_create(self, serializer):
        # Force all public registrations to have the 'student' role
        serializer.save(role='student')

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

from payments.models import Transaction
from payments.serializers import TransactionSerializer

from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile:
            profile = Profile.objects.create(user=user)
        
        # Update User fields if provided
        full_name = request.data.get('full_name')
        if full_name:
            name_parts = full_name.split(' ')
            user.first_name = name_parts[0]
            user.last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
        
        mobile_number = request.data.get('mobile_number')
        if mobile_number:
            user.mobile_number = mobile_number
            
        user.save()
        
        # Update Profile data
        profile_serializer = ProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        if profile_serializer.is_valid():
            profile_serializer.save()
            return Response(UserSerializer(user, context={'request': request}).data)
        return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TransactionHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-created_at')

class InstructorApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = InstructorApplicationSerializer
    
    def get_queryset(self):
        if self.request.user.role == 'administrator' or self.request.user.is_superuser:
            return InstructorApplication.objects.all()
        return InstructorApplication.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserManageViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserWriteSerializer
        return UserSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        # User Management is for Staff Only. Students are managed in the Student Portal.
        staff_qs = User.objects.exclude(role='student')
        
        if self.request.user.is_superuser:
            return staff_qs
        
        if self.request.user.role == 'administrator':
            return staff_qs.exclude(is_superuser=True).exclude(id=self.request.user.id)
            
        return User.objects.none()

    def create(self, request, *args, **kwargs):
        if not (request.user.is_superuser or request.user.role == 'administrator'):
            return Response({'error': 'Only Superusers or Administrators can create accounts.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Administrator cannot create other administrators or superusers
        if request.user.role == 'administrator' and request.data.get('role') in ['administrator', 'administrator']:
             if not request.user.is_superuser:
                return Response({'error': 'You do not have permission to create this role.'}, status=status.HTTP_403_FORBIDDEN)

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not request.user.is_superuser:
            if request.user.role != 'administrator':
                return Response({'error': 'Unauthorized'}, status=403)
            # Admin cannot edit superuser
            if instance.is_superuser:
                return Response({'error': 'Cannot edit a Superuser.'}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            
            # Superuser Bypass: Absolute Authority
            is_super = request.user.is_superuser
            is_admin = request.user.role == 'administrator'

            if not is_super:
                if not (is_admin and instance.role == 'student'):
                    return Response(
                        {'error': 'Permission Denied: Only a Superuser can delete Instructors or Staff accounts.'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )

            if instance == request.user:
                return Response({'error': 'Security Restriction: You cannot delete your own active superuser account.'}, status=400)

            # Log deletion
            print(f"CRITICAL FORCE DELETE: Superuser {request.user.username} is deleting user {instance.username} and all associated data.")
            
            # For Superusers, we manually handle the cascade cleanup to prevent SQLite FK failures
            if is_super:
                from lms.models import Course, Enrollment
                from payments.models import Transaction
                
                # Deleting Courses taught by this user (this triggers deep cascades to modules, lessons, etc.)
                Course.objects.filter(instructor=instance).delete()
                
                # Deleting enrollments and transactions associated with this user
                Enrollment.objects.filter(student=instance).delete()
                Transaction.objects.filter(user=instance).delete()

            # Now perform the final deletion of the user record
            instance.delete()
            
            return Response({'message': f'User {instance.username} and all their related records have been permanently removed.'}, status=status.HTTP_200_OK)
            
        except Exception as e:
            error_msg = str(e)
            user_msg = 'Operational Failure: The system encountered a structural error while attempting to remove this user.'
            if request.user.is_superuser:
                user_msg += f" (Technical Details: {error_msg})"
            
            return Response({'error': user_msg}, status=status.HTTP_400_BAD_REQUEST)

class StudentViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        # Only administrators and superusers can access this list
        if not (self.request.user.is_superuser or self.request.user.role == 'administrator'):
            return User.objects.none()
        return User.objects.filter(role='student')

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get('email')
        users = User.objects.filter(email=email)
        
        if not users.exists():
            return Response({'error': 'User with this email not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # In case of multiple users with same email, we take the first one
        user = users.first()
        
        token = default_token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        reset_link = f"http://localhost:5173/reset-password/{uidb64}/{token}"
        
        # Email content
        subject = "Password Reset Requested"
        message = f"""
Hello,

You requested a password reset for your account at LMS Project.
Please click the link below to reset your password:

{reset_link}

If you did not request this, please ignore this email.
"""
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            return Response({'message': 'Reset link sent to your email.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Error sending email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except: user = None
        if user and default_token_generator.check_token(user, token):
            password = request.data.get('password')
            user.set_password(password)
            user.save()
            return Response({'message': 'Success'})
        return Response({'error': 'Invalid'}, status=400)
