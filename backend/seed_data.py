import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from lms.models import Category, Course
from django.contrib.auth import get_user_model

User = get_user_model()

categories_data = {
    "Web & App Development": ["MERN Stack", "Python/Django", "Flutter", "PHP/Laravel", "Java/Spring boot"],
    "Artificial Intelligence": ["Machine Learning & Deep Learning", "AI Agents development", "NLP & LLM with Python"],
    "Data Science": ["Data Science with Python", "Data Analytics", "Power BI"],
    "Web design & CMS": ["UX/UI Design", "UX masterclass", "Webflow", "WordPress"],
    "Business & Marketing": ["Digital Marketing", "Facebook Ads", "SEO"],
    "Networking & Cyber Security": ["Cyber Security for all", "Cyber Security & Ethical Hacking", "Networking (Basic to Pro)", "Road to CCNA"],
    "Soft Skills": ["Essential soft skills for every learner", "Social Networking with LinkedIn", "Communication Skills"],
    "Study Abroad": ["Pre-preparation guidelines", "Language courses (IELTS/TOFEL/PTE)", "Standardized tests (SAT/GRE/GMAT)"],
    "Job skills abroad": ["Languages (German/ Arabic/ Chinese)", "Skill Migration Opportunities"],
    "Job skills for BD": ["Complete soft skills track"]
}

def seed():
    # Make sure we have a superuser or admin to act as instructor
    instructor, created = User.objects.get_or_create(
        username='demo_instructor',
        defaults={'email': 'instructor@example.com', 'role': 'instructor'}
    )
    if created:
        instructor.set_password('1234')
        instructor.save()

    for cat_name, courses in categories_data.items():
        category, _ = Category.objects.get_or_create(name=cat_name, defaults={'description': f'Courses related to {cat_name}'})
        print(f"Category: {category.name}")
        
        for course_title in courses:
            course, created = Course.objects.get_or_create(
                title=course_title,
                category=category,
                instructor=instructor,
                defaults={
                    'description': f'Learn all about {course_title} in this comprehensive course.',
                    'price': 199.99,
                    'course_type': 'live_batch',
                    'slug': course_title.lower().replace(' ', '-').replace('/', '-'),
                    'target_audience': 'Beginners to intermediate level.',
                    'tools_list': 'Various industry standard tools.'
                }
            )
            if created:
                print(f"  - Created Course: {course.title}")

if __name__ == '__main__':
    seed()
    print("Seeding complete.")
