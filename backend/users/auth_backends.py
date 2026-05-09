from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from django.contrib.auth import get_user_model

User = get_user_model()

class MobileOrEmailBackend(ModelBackend):
    """
    Custom authentication backend that allows users to log in using 
    either their Email address or their Mobile Number.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            return None
            
        try:
            # Attempt to find the user by email or mobile number
            # We use Q objects for the OR condition
            user = User.objects.get(Q(email__iexact=username) | Q(mobile_number=username))
        except User.DoesNotExist:
            # Run the default password hasher check to prevent timing attacks
            User().set_password(password)
            return None
        except User.MultipleObjectsReturned:
            # In case of duplicates, get the first active one
            user = User.objects.filter(Q(email__iexact=username) | Q(mobile_number=username)).first()

        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
