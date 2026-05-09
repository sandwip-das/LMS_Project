from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Profile, InstructorApplication, GuestUser, SiteSettings

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Role', {'fields': ('role', 'mobile_number', 'user_id_custom')}),
    )
    list_display = ('get_full_name', 'username', 'user_id_custom', 'role', 'is_staff', 'is_superuser')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'mobile_number', 'user_id_custom')

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username
    get_full_name.short_description = 'Full Name'

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        # Only allow one instance of settings
        return not SiteSettings.objects.exists()

admin.site.register(User, CustomUserAdmin)
admin.site.register(Profile)
admin.site.register(InstructorApplication)
admin.site.register(GuestUser)
