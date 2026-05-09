from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PromoCodeViewSet, TransactionViewSet

router = DefaultRouter()
router.register(r'promo-codes', PromoCodeViewSet)
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
]
