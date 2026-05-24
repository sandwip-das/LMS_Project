from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, 
    CourseViewSet, 
    EnrollmentViewSet, 
    DashboardSummaryView,
    BatchViewSet,
    ModuleViewSet,
    ModuleWeekViewSet,
    LiveClassViewSet,
    LessonViewSet,
    TestimonialViewSet,
    ToolTechViewSet,
    CourseRequirementViewSet,
    ProjectViewSet,
    WishlistViewSet,
    WeekItemViewSet,
    QuizViewSet,
    QuizQuestionViewSet,
    QuizSubmissionViewSet,
    AssignmentViewSet,
    AssignmentSubmissionViewSet
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'batches', BatchViewSet)
router.register(r'tools', ToolTechViewSet)
router.register(r'requirements', CourseRequirementViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'modules', ModuleViewSet)
router.register(r'module-weeks', ModuleWeekViewSet)
router.register(r'live-classes', LiveClassViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'testimonials', TestimonialViewSet)
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'wishlists', WishlistViewSet, basename='wishlist')
router.register(r'week-items', WeekItemViewSet)
router.register(r'quizzes', QuizViewSet)
router.register(r'quiz-questions', QuizQuestionViewSet)
router.register(r'quiz-submissions', QuizSubmissionViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'assignment-submissions', AssignmentSubmissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard-summary/', DashboardSummaryView.as_view(), name='dashboard_summary'),
]
