from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('administrator', 'Administrator'),
        ('moderator', 'Moderator'),
        ('instructor', 'Instructor'),
        ('teaching_assistant', 'Teaching Assistant'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    email = models.EmailField(unique=True)
    mobile_number = models.CharField(max_length=15, unique=True, blank=True, null=True)
    user_id_custom = models.CharField(max_length=50, unique=True, blank=True, null=True) # For custom User ID
    
    def __str__(self):
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.username

class Profile(models.Model):
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('others', 'Others'),
    )
    EDU_CHOICES = (
        ('BSc', 'BSc'), ('MSc', 'MSc'), ('Diploma', 'Diploma'), ('HSC', 'HSC'), ('SSC', 'SSC'),
        ('BBA', 'BBA'), ('MBA', 'MBA'), ('BA', 'BA'), ('MA', 'MA'), ('BSS', 'BSS'), ('MSS', 'MSS'),
        ('MBBS', 'MBBS'), ('BDS', 'BDS'), ('LLB', 'LLB'), ('LLM', 'LLM'), ('PhD', 'PhD'),
        ('MPhil', 'MPhil'), ('Vocational', 'Vocational Training'), ('Professional', 'Professional Certification'), ('Others', 'Others'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    photo = models.ImageField(upload_to='profiles/', blank=True, null=True)
    alternative_email = models.EmailField(blank=True, null=True)
    alternative_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Occupation
    occupation = models.CharField(max_length=255, blank=True, null=True, help_text="Company Name")
    position = models.CharField(max_length=255, blank=True, null=True)
    job_from = models.DateField(blank=True, null=True)
    job_to = models.DateField(blank=True, null=True)
    is_continuing = models.BooleanField(default=False)
    job_description = models.TextField(blank=True, null=True)
    
    skill_sector = models.CharField(max_length=255, blank=True, null=True) 
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    edu_background = models.CharField(max_length=50, choices=EDU_CHOICES, blank=True, null=True) 
    edu_institute = models.CharField(max_length=255, blank=True, null=True)
    passing_year = models.CharField(max_length=4, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} Profile"

class InstructorApplication(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    resume = models.FileField(upload_to='applications/resumes/')
    portfolio_url = models.URLField(blank=True, null=True)
    experience_years = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Application: {self.user.username} - {self.status}"

class GuestUser(models.Model):
    email_or_username = models.CharField(max_length=255, help_text="Email ID, Username, or Social Media Name")
    visited_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.email_or_username

class SiteSettings(models.Model):
    site_name = models.CharField(max_length=100, blank=True, null=True)
    website_title = models.CharField(max_length=200, blank=True, null=True)
    site_logo = models.ImageField(upload_to='site/', blank=True, null=True)
    favicon = models.ImageField(upload_to='site/', blank=True, null=True)
    footer_description = models.TextField(blank=True, null=True)
    copyright_text = models.CharField(max_length=255, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_address = models.TextField(blank=True, null=True)
    facebook_url = models.URLField(blank=True, null=True)
    facebook_icon = models.ImageField(upload_to='site/icons/', blank=True, null=True)
    twitter_url = models.URLField(blank=True, null=True)
    twitter_icon = models.ImageField(upload_to='site/icons/', blank=True, null=True)
    instagram_url = models.URLField(blank=True, null=True)
    instagram_icon = models.ImageField(upload_to='site/icons/', blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    linkedin_icon = models.ImageField(upload_to='site/icons/', blank=True, null=True)
    youtube_url = models.URLField(blank=True, null=True)
    youtube_icon = models.ImageField(upload_to='site/icons/', blank=True, null=True)
    
    hero_badge_text = models.CharField(max_length=255, blank=True, null=True)
    hero_heading = models.CharField(max_length=255, blank=True, null=True)
    hero_highlighted_word = models.CharField(max_length=50, blank=True, null=True, help_text="Word in the heading to highlight")
    hero_subheading = models.TextField(blank=True, null=True)
    hero_image = models.ImageField(upload_to='site/', blank=True, null=True)

    class Meta:
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    def __str__(self):
        return self.site_name

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"
