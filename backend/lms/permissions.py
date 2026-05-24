from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'administrator')

class IsModeratorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.role in ['administrator', 'moderator']

class IsInstructorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.role in ['administrator', 'instructor']

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.role == 'student'

class IsEnrolledStudent(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Assumes obj is a Course or has a course attribute
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role in ['administrator', 'moderator', 'instructor']:
            return True
        course = getattr(obj, 'course', None) or obj
        return hasattr(course, 'enrollments') and course.enrollments.filter(student=request.user).exists()
