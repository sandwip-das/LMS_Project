from django.contrib import admin
from .models import (
    Category, Course, Batch, Module, ModuleWeek, LiveClass, 
    Lesson, Enrollment, Testimonial, ToolTech, CourseRequirement, 
    Project, ProjectToolImage
)

class ProjectToolImageInline(admin.TabularInline):
    model = ProjectToolImage
    extra = 1

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    inlines = [ProjectToolImageInline]

admin.site.register(Category)
admin.site.register(Course)
admin.site.register(Batch)
admin.site.register(Module)
admin.site.register(ModuleWeek)
admin.site.register(LiveClass)
admin.site.register(Lesson)
admin.site.register(Enrollment)
admin.site.register(Testimonial)
admin.site.register(ToolTech)
admin.site.register(CourseRequirement)
