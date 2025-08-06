from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('generate-quiz/', views.generate_quiz, name='generate_quiz'),
    path('generate-coaching-report/', views.generate_coaching_report, name='generate_coaching_report'),
]