from django.contrib import admin
from .models import *

admin.site.register([Student,Mentor,Course,Group,Grade,Grade_Exam,Student_enroll,Mentor_enroll,Activity,Timetable])
