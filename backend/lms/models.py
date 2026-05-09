from django.db import models
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories')

    def __str__(self):
        return self.name

class Course(models.Model):
    COURSE_TYPE_CHOICES = (
        ('live', 'Live'),
        ('pre_recorded', 'Pre-Recorded'),
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True, null=True)
    description = models.TextField()
    course_type = models.CharField(max_length=20, choices=COURSE_TYPE_CHOICES, default='live')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='courses')
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses_taught')
    teaching_assistants = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='ta_courses')
    moderators = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='moderated_courses')
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Media
    thumbnail = models.ImageField(upload_to='courses/thumbnails/', blank=True, null=True)
    cover_image = models.ImageField(upload_to='courses/covers/', blank=True, null=True)
    demo_video_url = models.URLField(blank=True, null=True)
    
    # Rich Content
    curriculum_summary = models.TextField(blank=True, null=True)
    prerequisites = models.TextField(blank=True, null=True)
    tools_list = models.TextField(blank=True, null=True, help_text="List of tools/tech stack")
    target_audience = models.TextField(blank=True, null=True)
    job_market_info = models.TextField(blank=True, null=True)
    project_showcase = models.TextField(blank=True, null=True)
    
    # Resources
    handbook = models.FileField(upload_to='courses/resources/', blank=True, null=True)
    
    # Batch Information
    batch_no = models.CharField(max_length=50, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    schedule_days = models.CharField(max_length=255, blank=True, null=True)
    support_class_schedule = models.CharField(max_length=255, blank=True, null=True)
    class_time = models.TimeField(blank=True, null=True)
    total_seats = models.IntegerField(default=50)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def enrolled_count(self):
        return self.enrollments.count()

    @property
    def seats_left(self):
        return max(0, self.total_seats - self.enrolled_count)

    def __str__(self):
        return self.title

class Batch(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='batches')
    batch_number = models.IntegerField()
    total_seats = models.IntegerField(default=50)
    enrolled_count = models.IntegerField(default=0)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    schedule_days = models.CharField(max_length=255, help_text="e.g. Sat, Mon, Wed")
    class_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.course.title} - Batch {self.batch_number}"

class ToolTech(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='tools')
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='courses/tools/')

    def __str__(self):
        return f"{self.name} - {self.course.title}"

class CourseRequirement(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='requirements')
    description = models.TextField()
    image = models.ImageField(upload_to='courses/requirements/', blank=True, null=True)

    def __str__(self):
        return f"Req for {self.course.title}"

class Project(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='course_projects')
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='courses/projects/')
    description = models.TextField()
    tools_images = models.JSONField(default=list, help_text="List of tool image URLs or references") # Since multiple images, I'll use a related model if needed, but JSON is quick for now. Or better: another model.
    
    def __str__(self):
        return self.name

class ProjectToolImage(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tools_images_list')
    image = models.ImageField(upload_to='courses/projects/tools/')

class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    batch = models.ForeignKey(Batch, on_delete=models.SET_NULL, related_name='batch_modules', null=True, blank=True)
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='module_instructions')
    name = models.CharField(max_length=255)
    duration_weeks = models.IntegerField(default=1)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.name} ({self.course.title})"

class ModuleWeek(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='weeks')
    week_number = models.IntegerField()
    topic_title = models.CharField(max_length=255)
    quiz_count = models.IntegerField(default=0)
    assignment_count = models.IntegerField(default=0)
    is_disabled = models.BooleanField(default=False)
    extra_features = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Week {self.week_number} - {self.topic_title}"

class LiveClass(models.Model):
    week = models.ForeignKey(ModuleWeek, on_delete=models.CASCADE, related_name='live_classes')
    title = models.CharField(max_length=255)
    topics = models.TextField() # Text field with proper control (Markdown/HTML)

    def __str__(self):
        return self.title

class Lesson(models.Model):
    # Keep existing Lesson for backwards compatibility if needed, but the new structure is ModuleWeek -> LiveClass
    CONTENT_TYPE_CHOICES = (
        ('video', 'Video'),
        ('pdf', 'PDF'),
        ('text', 'Text Content'),
        ('quiz', 'Quiz'),
        ('assignment', 'Assignment'),
    )
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    week = models.ForeignKey(ModuleWeek, on_delete=models.CASCADE, related_name='lessons', null=True, blank=True)
    title = models.CharField(max_length=255)
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPE_CHOICES, default='video')
    video_url = models.URLField(blank=True, null=True)
    pdf_file = models.FileField(upload_to='lessons/pdfs/', blank=True, null=True)
    text_content = models.TextField(blank=True, null=True)
    is_free_preview = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

class Enrollment(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    batch = models.ForeignKey(Batch, on_delete=models.SET_NULL, null=True, blank=True, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    progress = models.IntegerField(default=0) # Percentage

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} enrolled in {self.course.title}"

class Testimonial(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='testimonials', null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='testimonials')
    content = models.TextField()
    rating = models.IntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.user.username}"
