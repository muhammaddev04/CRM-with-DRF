from rest_framework import serializers
from .models import *



class UserSerilaizer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['id','username','password']


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['username','password','role']

        extra_kwargs={'password':{'write_only':True}}

    def create(self,validated_date):
        user=User.objects.create_user(
            username=validated_date['username'],
            password=validated_date['password'],
            role=validated_date['role']
        )
        return user

