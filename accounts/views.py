from django.shortcuts import render
from rest_framework import generics,status,permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from .models import *
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from crm.permissions import *






class RegisterView(generics.CreateAPIView):
    serializer_class=RegisterSerializer
    permission_classes=[IsAuthenticated,IsAdmin]

