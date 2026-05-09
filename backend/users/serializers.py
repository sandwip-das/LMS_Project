from rest_framework import serializers
from .models import User, Profile, InstructorApplication, SiteSettings
import re
from django.core.exceptions import ValidationError

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = '__all__'

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'photo', 'alternative_email', 'alternative_number', 'occupation', 
            'position', 'job_from', 'job_to', 'is_continuing', 'job_description',
            'skill_sector', 'gender', 'age', 'edu_background', 'edu_institute', 
            'bio', 'contact_number', 'address', 'date_of_birth', 'district', 'passing_year'
        ]

def validate_custom_user_id(value):
    # Allow empty value
    if not value:
        return value
    
    if len(value) < 5:
        raise serializers.ValidationError("User ID must be at least 5 characters long.")
    return value

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'profile', 'first_name', 'last_name', 'full_name', 'is_superuser', 'mobile_number', 'user_id_custom', 'date_joined']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

class UserWriteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    full_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    user_id_custom = serializers.CharField(validators=[validate_custom_user_id], required=False, allow_blank=True)
    mobile_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'first_name', 'last_name', 'mobile_number', 'user_id_custom', 'full_name', 'is_superuser', 'date_joined']
        read_only_fields = ['date_joined']

    def validate_mobile_number(self, value):
        if value and not re.match(r'^\+?1?\d{7,15}$', value):
            raise serializers.ValidationError("Invalid mobile number format.")
        return value

    def create(self, validated_data):
        full_name = validated_data.pop('full_name', '')
        if full_name:
            name_parts = full_name.split(' ')
            validated_data['first_name'] = name_parts[0]
            validated_data['last_name'] = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''

        # Map empty strings to None to prevent Unique Constraint errors
        if validated_data.get('mobile_number') == '':
            validated_data['mobile_number'] = None
        if validated_data.get('user_id_custom') == '':
            validated_data['user_id_custom'] = None

        # Automatically set is_staff=True for non-student roles so they appear in Django Admin
        role = validated_data.get('role')
        if role in ['administrator', 'moderator', 'instructor', 'teaching_assistant']:
            validated_data['is_staff'] = True

        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        Profile.objects.get_or_create(user=user)
        return user

    def update(self, instance, validated_data):
        full_name = validated_data.pop('full_name', None)
        if full_name:
            name_parts = full_name.split(' ')
            instance.first_name = name_parts[0]
            instance.last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''

        if validated_data.get('mobile_number') == '':
            validated_data['mobile_number'] = None
        if validated_data.get('user_id_custom') == '':
            validated_data['user_id_custom'] = None

        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        
        # Ensure we don't try to set virtual fields on the model
        validated_data.pop('first_name', None)
        validated_data.pop('last_name', None)
        validated_data.pop('full_name', None)

        # Update is_staff if role changes
        role = validated_data.get('role')
        if role:
            if role in ['administrator', 'moderator', 'instructor', 'teaching_assistant']:
                instance.is_staff = True
            elif role == 'student':
                instance.is_staff = False

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class InstructorApplicationSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = InstructorApplication
        fields = '__all__'
        read_only_fields = ['user', 'status', 'applied_at']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        token['is_superuser'] = user.is_superuser
        return token
