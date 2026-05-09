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
    ProjectViewSet
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

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard-summary/', DashboardSummaryView.as_view(), name='dashboard_summary'),
]
