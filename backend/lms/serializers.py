import base64
from django.core.files.base import ContentFile
from rest_framework import serializers
from .models import (
    Category, Course, Enrollment, Batch, Module, ModuleWeek, 
    LiveClass, Lesson, Testimonial, ToolTech, CourseRequirement, 
    Project, ProjectToolImage, Wishlist,
    WeekItem, Quiz, QuizQuestion, QuizSubmission, Assignment, AssignmentSubmission
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
    image_base64 = serializers.CharField(required=False, allow_blank=True, allow_null=True, write_only=True)
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

class WeekItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeekItem
        fields = '__all__'

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'

class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = '__all__'

class QuizSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizSubmission
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmission
        fields = '__all__'

class ModuleWeekSerializer(serializers.ModelSerializer):
    live_classes = LiveClassSerializer(many=True, required=False)
    items = WeekItemSerializer(many=True, required=False)
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
            tool.pop('course', None)
            image_base64 = tool.pop('image_base64', None)
            tool_obj = ToolTech.objects.create(course=course, **tool)
            if image_base64 and ';base64,' in image_base64:
                try:
                    format, imgstr = image_base64.split(';base64,') 
                    ext = format.split('/')[-1]
                    tool_obj.image = ContentFile(base64.b64decode(imgstr), name=f"{tool_obj.name}.{ext}")
                    tool_obj.save()
                except Exception as e:
                    pass
        
        # Handle Requirements
        for req in reqs_data:
            req.pop('course', None)
            CourseRequirement.objects.create(course=course, **req)
            
        # Handle Projects
        for proj in projects_data:
            proj.pop('course', None)
            tools_images_list = proj.pop('tools_images_list', [])
            project_obj = Project.objects.create(course=course, **proj)
            for img in tools_images_list:
                img.pop('project', None)
                ProjectToolImage.objects.create(project=project_obj, **img)

        # Handle Modules
        for mod in modules_data:
            weeks_data = mod.pop('weeks', [])
            mod.pop('course', None)
            module_obj = Module.objects.create(course=course, **mod)
            for week in weeks_data:
                lc_data = week.pop('live_classes', [])
                items_data = week.pop('items', [])
                week.pop('module', None)
                week_obj = ModuleWeek.objects.create(module=module_obj, **week)
                for lc in lc_data:
                    lc.pop('week', None)
                    LiveClass.objects.create(week=week_obj, **lc)
                for item in items_data:
                    item.pop('week', None)
                    WeekItem.objects.create(week=week_obj, **item)
                    
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
            existing_tool_ids = [t.id for t in instance.tools.all()]
            incoming_tool_ids = [t.get('id') for t in tools_data if t.get('id')]
            
            for tool_id in existing_tool_ids:
                if tool_id not in incoming_tool_ids:
                    ToolTech.objects.filter(id=tool_id).delete()

            for tool in tools_data:
                tool_id = tool.pop('id', None)
                tool.pop('course', None)
                image_base64 = tool.pop('image_base64', None)
                tool.pop('image', None)
                
                if tool_id and ToolTech.objects.filter(id=tool_id, course=instance).exists():
                    tool_obj = ToolTech.objects.get(id=tool_id)
                    for k, v in tool.items():
                        setattr(tool_obj, k, v)
                    tool_obj.save()
                else:
                    tool_obj = ToolTech.objects.create(course=instance, **tool)
                    
                if image_base64 and ';base64,' in image_base64:
                    try:
                        format, imgstr = image_base64.split(';base64,') 
                        ext = format.split('/')[-1]
                        tool_obj.image = ContentFile(base64.b64decode(imgstr), name=f"{tool_obj.name}.{ext}")
                        tool_obj.save()
                    except Exception as e:
                        pass
        
        # Handle Requirements
        if reqs_data is not None:
            existing_req_ids = [r.id for r in instance.requirements.all()]
            incoming_req_ids = [r.get('id') for r in reqs_data if r.get('id')]
            
            for req_id in existing_req_ids:
                if req_id not in incoming_req_ids:
                    CourseRequirement.objects.filter(id=req_id).delete()

            for req in reqs_data:
                req_id = req.pop('id', None)
                req.pop('course', None)
                
                if req_id and CourseRequirement.objects.filter(id=req_id, course=instance).exists():
                    CourseRequirement.objects.filter(id=req_id).update(**req)
                else:
                    CourseRequirement.objects.create(course=instance, **req)
                
        # Handle Projects
        if projects_data is not None:
            instance.course_projects.all().delete()
            for proj in projects_data:
                proj.pop('course', None)
                tools_images_list = proj.pop('tools_images_list', [])
                project_obj = Project.objects.create(course=instance, **proj)
                for img in tools_images_list:
                    img.pop('project', None)
                    ProjectToolImage.objects.create(project=project_obj, **img)

        # Handle Modules (Update existing, create new, delete missing)
        if modules_data is not None:
            existing_module_ids = [m.id for m in instance.modules.all()]
            incoming_module_ids = [m.get('id') for m in modules_data if m.get('id')]
            
            # Delete modules that are not in the incoming data
            for module_id in existing_module_ids:
                if module_id not in incoming_module_ids:
                    Module.objects.filter(id=module_id).delete()
            
            for mod in modules_data:
                mod_id = mod.pop('id', None)
                mod.pop('weeks', [])
                mod.pop('course', None)
                if mod_id and Module.objects.filter(id=mod_id, course=instance).exists():
                    Module.objects.filter(id=mod_id).update(**mod)
                else:
                    Module.objects.create(course=instance, **mod)

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

class WishlistSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)
    class Meta:
        model = Wishlist
        fields = '__all__'
        read_only_fields = ['user']
