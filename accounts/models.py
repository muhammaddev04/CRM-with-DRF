from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    STATUS_CHOICES=(
        ('admin','Admin'),
        ('mentor','Mentor'),
        ('student','Student')
    )
    role=models.CharField(max_length=20,choices=STATUS_CHOICES,default='student')
