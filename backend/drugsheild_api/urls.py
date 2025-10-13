"""
URL configuration for drugsheild_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'message': 'DrugSheild API v1.0',
        'endpoints': {
            'authentication': '/api/auth/',
            'health': '/api/health/',
            'admin': '/admin/'
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/auth/', include('authentication.urls')),
    path('api/health/', include('health.urls')),
]
