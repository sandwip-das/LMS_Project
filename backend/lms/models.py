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
    overview = models.TextField(blank=True, null=True)
    curriculum_summary = models.TextField(blank=True, null=True)
    prerequisites = models.TextField(blank=True, null=True)
    tools_list = models.TextField(blank=True, null=True, help_text="List of tools/tech stack")
    target_audience = models.TextField(blank=True, null=True)
    job_market_info = models.TextField(blank=True, null=True)
    project_showcase = models.TextField(blank=True, null=True)

    # Ratings
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    rating_count = models.IntegerField(default=0)
    
    # Resources
    handbook = models.FileField(upload_to='courses/resources/', blank=True, null=True)
    
    # Batch Information
    batch_no = models.CharField(max_length=50, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    schedule_days = models.CharField(max_length=255, blank=True, null=True)
    support_class_schedule = models.CharField(max_length=255, blank=True, null=True)
    class_time = models.TimeField(blank=True, null=True)
    total_seats = models.IntegerField(default=50)
    is_published = models.BooleanField(default=True)
    
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
    image = models.ImageField(upload_to='courses/tools/', blank=True, null=True)

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
    image = models.ImageField(upload_to='courses/projects/', blank=True, null=True)
    description = models.TextField()
    tools_images = models.JSONField(default=list, help_text="List of tool image URLs or references") # Since multiple images, I'll use a related model if needed, but JSON is quick for now. Or better: another model.
    
    def __str__(self):
        return self.name

class ProjectToolImage(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tools_images_list')
    image = models.ImageField(upload_to='courses/projects/tools/', blank=True, null=True)

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
    
    # Time Engine Core
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    duration_days = models.IntegerField(default=7)

    quiz_count = models.IntegerField(default=0)
    assignment_count = models.IntegerField(default=0)
    is_disabled = models.BooleanField(default=False)
    extra_features = models.JSONField(default=dict, blank=True)

    def save(self, *args, **kwargs):
        from datetime import timedelta
        # Calculate end_date if not set
        if self.start_date and self.duration_days and not self.end_date:
            self.end_date = self.start_date + timedelta(days=self.duration_days - 1)
        
        is_updating = self.pk is not None
        old_end_date = None
        if is_updating:
            old_week = ModuleWeek.objects.get(pk=self.pk)
            old_end_date = old_week.end_date
            
        super().save(*args, **kwargs)
        
        # Time Engine: Shift subsequent weeks if end_date changed
        if is_updating and old_end_date and self.end_date and old_end_date != self.end_date:
            diff_days = (self.end_date - old_end_date).days
            if diff_days != 0:
                self.shift_subsequent_weeks()

    def shift_subsequent_weeks(self):
        from datetime import timedelta
        # Get all weeks in the same course that come after this one
        all_modules = self.module.course.modules.order_by('order')
        subsequent_weeks = ModuleWeek.objects.filter(
            module__in=all_modules
        ).exclude(
            module=self.module, week_number__lte=self.week_number
        ).exclude(
            module__order__lt=self.module.order
        ).order_by('module__order', 'week_number')
        
        prev_end = self.end_date
        for next_w in subsequent_weeks:
            if prev_end:
                next_w.start_date = prev_end + timedelta(days=1)
                next_w.end_date = next_w.start_date + timedelta(days=next_w.duration_days - 1)
                # Save without triggering signals recursively
                ModuleWeek.objects.filter(pk=next_w.pk).update(start_date=next_w.start_date, end_date=next_w.end_date)
                prev_end = next_w.end_date

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

class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlists')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.username} saved {self.course.title}"

# --- NEW OPTIMIZED LMS ARCHITECTURE MODELS ---

class WeekItem(models.Model):
    ITEM_TYPE_CHOICES = (
        ('live_class', 'Live Class'),
        ('assignment', 'Assignment'),
        ('quiz', 'Quiz'),
        ('project', 'Project'),
        ('resource', 'Resource'),
    )
    week = models.ForeignKey(ModuleWeek, on_delete=models.CASCADE, related_name='items')
    item_type = models.CharField(max_length=20, choices=ITEM_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    metadata = models.JSONField(default=dict, blank=True, help_text="Flexible payload for type-specific data (e.g. meeting_link for live_class)")
    is_visible = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"[{self.get_item_type_display()}] {self.title}"

class Quiz(models.Model):
    week_item = models.OneToOneField(WeekItem, on_delete=models.CASCADE, related_name='quiz_details')
    open_time = models.DateTimeField(blank=True, null=True)
    close_time = models.DateTimeField(blank=True, null=True)
    passing_score = models.IntegerField(default=50)
    auto_evaluation = models.BooleanField(default=True)

class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    options = models.JSONField(help_text="List of options, e.g. ['A', 'B', 'C', 'D']")
    correct_answer = models.CharField(max_length=255, help_text="Correct option. Hidden from API until close_time.")

class QuizSubmission(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    answers = models.JSONField(help_text="Student answers mapping question ID to selected option")
    score = models.IntegerField(blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

class Assignment(models.Model):
    week_item = models.OneToOneField(WeekItem, on_delete=models.CASCADE, related_name='assignment_details')
    description = models.TextField()
    due_date = models.DateTimeField(blank=True, null=True)
    total_marks = models.IntegerField(default=100)
    allow_late_submission = models.BooleanField(default=False)

class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text_content = models.TextField(blank=True, null=True)
    file_upload = models.FileField(upload_to='assignments/submissions/', blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    marks_obtained = models.IntegerField(blank=True, null=True)
    feedback = models.TextField(blank=True, null=True)
