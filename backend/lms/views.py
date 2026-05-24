from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Category, Course, Enrollment, Batch, Module, ModuleWeek, 
    LiveClass, Lesson, Testimonial, ToolTech, CourseRequirement, 
    Project, ProjectToolImage, Wishlist,
    WeekItem, Quiz, QuizQuestion, QuizSubmission, Assignment, AssignmentSubmission
)
from .serializers import (
    CategorySerializer, CourseSerializer, EnrollmentSerializer,
    BatchSerializer, ModuleSerializer, ModuleWeekSerializer,
    LiveClassSerializer, LessonSerializer, TestimonialSerializer,
    ToolTechSerializer, CourseRequirementSerializer, ProjectSerializer,
    WishlistSerializer, WeekItemSerializer,
    QuizSerializer, QuizQuestionSerializer, QuizSubmissionSerializer,
    AssignmentSerializer, AssignmentSubmissionSerializer
)

User = get_user_model()

class IsAdminOrSuper(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role in ['administrator', 'moderator'] or request.user.is_superuser))

class IsInstructorStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role in ['administrator', 'moderator', 'instructor', 'teaching_assistant'] or request.user.is_superuser))

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrSuper()]
        return [permissions.AllowAny()]

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'course_type', 'instructor']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'price']

    def get_queryset(self):
        user = self.request.user
        queryset = Course.objects.all()

        # Public listing (not in admin context)
        if not self.request.query_params.get('admin_view'):
            return queryset.filter(is_published=True)

        # Admin context filtering
        if not user.is_authenticated:
            return Course.objects.none()

        if user.is_superuser or user.role == 'administrator':
            return queryset
        elif user.role == 'instructor':
            return queryset.filter(instructor=user)
        elif user.role == 'teaching_assistant':
            return queryset.filter(teaching_assistants=user)
        elif user.role == 'moderator':
            return queryset.filter(moderators=user)
        
        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsInstructorStaff()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course', 'is_active']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsInstructorStaff()]
        return [permissions.AllowAny()]

class ToolTechViewSet(viewsets.ModelViewSet):
    queryset = ToolTech.objects.all()
    serializer_class = ToolTechSerializer
    permission_classes = [IsInstructorStaff]

class CourseRequirementViewSet(viewsets.ModelViewSet):
    queryset = CourseRequirement.objects.all()
    serializer_class = CourseRequirementSerializer
    permission_classes = [IsInstructorStaff]

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsInstructorStaff]

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [IsInstructorStaff]

class ModuleWeekViewSet(viewsets.ModelViewSet):
    queryset = ModuleWeek.objects.all()
    serializer_class = ModuleWeekSerializer
    permission_classes = [IsInstructorStaff]

class LiveClassViewSet(viewsets.ModelViewSet):
    queryset = LiveClass.objects.all()
    serializer_class = LiveClassSerializer
    permission_classes = [IsInstructorStaff]

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsInstructorStaff]

class WeekItemViewSet(viewsets.ModelViewSet):
    queryset = WeekItem.objects.all()
    serializer_class = WeekItemSerializer
    permission_classes = [IsInstructorStaff]

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsInstructorStaff]

class QuizQuestionViewSet(viewsets.ModelViewSet):
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer
    permission_classes = [IsInstructorStaff]

class QuizSubmissionViewSet(viewsets.ModelViewSet):
    queryset = QuizSubmission.objects.all()
    serializer_class = QuizSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsInstructorStaff]

class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    queryset = AssignmentSubmission.objects.all()
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Enrollment.objects.filter(student=user)
        elif user.role in ['instructor', 'teaching_assistant']:
            return Enrollment.objects.filter(course__instructor=user) | Enrollment.objects.filter(course__teaching_assistants=user)
        elif user.role in ['administrator', 'moderator'] or user.is_superuser:
            return Enrollment.objects.all()
        return Enrollment.objects.none()

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'student' and not user.is_superuser:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        return Response({
            'total_users': User.objects.count(),
            'total_courses': Course.objects.count(),
            'total_categories': Category.objects.count(),
            'total_enrollments': Enrollment.objects.count(),
            'role_stats': User.objects.values('role').annotate(count=Count('role')),
            'active_batches': Batch.objects.filter(is_active=True).count(),
            'instructor_count': User.objects.filter(role='instructor').count(),
        })

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
