from rest_framework import serializers
from .models import (
    Category, Course, Enrollment, Batch, Module, ModuleWeek, 
    LiveClass, Lesson, Testimonial, ToolTech, CourseRequirement, 
    Project, ProjectToolImage
)
from users.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
    course_count = serializers.SerializerMethodField()
    class Meta:
        model = Category
        fields = ['id', 'name', 'course_count']
    
    def get_course_count(self, obj):
        return obj.courses.count()

class ToolTechSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToolTech
        fields = '__all__'

class CourseRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseRequirement
        fields = '__all__'

class ProjectToolImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectToolImage
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    tool_images = ProjectToolImageSerializer(many=True, required=False)
    class Meta:
        model = Project
        fields = '__all__'

class LiveClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveClass
        fields = '__all__'

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'

class ModuleWeekSerializer(serializers.ModelSerializer):
    live_classes = LiveClassSerializer(many=True, required=False)
    class Meta:
        model = ModuleWeek
        fields = '__all__'

class ModuleSerializer(serializers.ModelSerializer):
    weeks = ModuleWeekSerializer(many=True, required=False)
    class Meta:
        model = Module
        fields = ['id', 'course', 'batch', 'instructor', 'name', 'duration_weeks', 'order', 'weeks']

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.ReadOnlyField(source='instructor.username')
    category_name = serializers.ReadOnlyField(source='category.name')
    enrolled_count = serializers.SerializerMethodField()
    batches = BatchSerializer(many=True, read_only=True)
    modules = ModuleSerializer(many=True, required=False)
    tools = ToolTechSerializer(many=True, required=False)
    requirements = CourseRequirementSerializer(many=True, required=False)
    course_projects = ProjectSerializer(many=True, required=False)
    
    def get_enrolled_count(self, obj):
        return Enrollment.objects.filter(course=obj).count()

    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['seats_left', 'enrolled_count']
        extra_kwargs = {
            'instructor': {'required': False, 'allow_null': True},
            'category': {'required': False, 'allow_null': True},
            'slug': {'required': False, 'allow_null': True},
            'teaching_assistants': {'required': False},
            'moderators': {'required': False},
        }

    def create(self, validated_data):
        teaching_assistants = validated_data.pop('teaching_assistants', [])
        moderators = validated_data.pop('moderators', [])
        
        # Pop nested data
        modules_data = validated_data.pop('modules', [])
        tools_data = validated_data.pop('tools', [])
        reqs_data = validated_data.pop('requirements', [])
        projects_data = validated_data.pop('course_projects', [])

        course = Course.objects.create(**validated_data)
        
        if teaching_assistants:
            course.teaching_assistants.set(teaching_assistants)
        if moderators:
            course.moderators.set(moderators)

        # Handle Tools
        for tool in tools_data:
            ToolTech.objects.create(course=course, **tool)
        
        # Handle Requirements
        for req in reqs_data:
            CourseRequirement.objects.create(course=course, **req)
            
        # Handle Projects
        for proj in projects_data:
            tools_images_list = proj.pop('tools_images_list', [])
            project_obj = Project.objects.create(course=course, **proj)
            for img in tools_images_list:
                ProjectToolImage.objects.create(project=project_obj, **img)

        # Handle Modules
        for mod in modules_data:
            weeks_data = mod.pop('weeks', [])
            module_obj = Module.objects.create(course=course, **mod)
            for week in weeks_data:
                lc_data = week.pop('live_classes', [])
                week_obj = ModuleWeek.objects.create(module=module_obj, **week)
                for lc in lc_data:
                    LiveClass.objects.create(week=week_obj, **lc)
                    
        return course

    def update(self, instance, validated_data):
        teaching_assistants = validated_data.pop('teaching_assistants', None)
        moderators = validated_data.pop('moderators', None)
        
        # Pop nested data
        modules_data = validated_data.pop('modules', None)
        tools_data = validated_data.pop('tools', None)
        reqs_data = validated_data.pop('requirements', None)
        projects_data = validated_data.pop('course_projects', None)

        # Handle simple fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Staff
        if teaching_assistants is not None:
            instance.teaching_assistants.set(teaching_assistants)
        if moderators is not None:
            instance.moderators.set(moderators)

        # Handle Tools
        if tools_data is not None:
            instance.tools.all().delete()
            for tool in tools_data:
                ToolTech.objects.create(course=instance, **tool)
        
        # Handle Requirements
        if reqs_data is not None:
            instance.requirements.all().delete()
            for req in reqs_data:
                CourseRequirement.objects.create(course=instance, **req)
                
        # Handle Projects
        if projects_data is not None:
            instance.course_projects.all().delete()
            for proj in projects_data:
                tools_images_list = proj.pop('tools_images_list', [])
                project_obj = Project.objects.create(course=instance, **proj)
                for img in tools_images_list:
                    ProjectToolImage.objects.create(project=project_obj, **img)

        # Handle Modules (Preserve existing logic but acknowledge it clears sub-data)
        if modules_data is not None:
            instance.modules.all().delete()
            for mod in modules_data:
                weeks_data = mod.pop('weeks', [])
                module_obj = Module.objects.create(course=instance, **mod)
                for week in weeks_data:
                    lc_data = week.pop('live_classes', [])
                    week_obj = ModuleWeek.objects.create(module=module_obj, **week)
                    for lc in lc_data:
                        LiveClass.objects.create(week=week_obj, **lc)

        return instance

class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')
    student_name = serializers.ReadOnlyField(source='student.username')
    class Meta:
        model = Enrollment
        fields = '__all__'

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'
