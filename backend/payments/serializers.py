from rest_framework import serializers
from .models import PromoCode, Transaction

class PromoCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoCode
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    course_name = serializers.ReadOnlyField(source='course.title')
    promo_code_code = serializers.ReadOnlyField(source='promo_code.code')
    
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['user', 'created_at']
