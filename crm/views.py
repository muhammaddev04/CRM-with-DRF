from django.shortcuts import render
from rest_framework import generics,status,permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from .models import *
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from .permissions import *



class StudentListView(generics.ListAPIView):
    queryset=Student.objects.all()
    serializer_class=StudentSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class StudentDetailView(generics.RetrieveAPIView):
    queryset=Student.objects.all()
    serializer_class=StudentSerializer
    permission_classes=[IsAuthenticated,RolePermission]

class StudentCreateView(generics.CreateAPIView):
    queryset=Student.objects.all()
    serializer_class=StudentSerializer
    permission_classes=[IsAuthenticated,RolePermission]

class StudentUpdateView(generics.UpdateAPIView):
    queryset=Student.objects.all()
    serializer_class=StudentSerializer
    permission_classes=[IsAuthenticated,RolePermission]

class StudentDeleteView(generics.DestroyAPIView):
    queryset=Student.objects.all()
    serializer_class=StudentSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class MentorListView(generics.ListAPIView):
    queryset=Mentor.objects.all()
    serializer_class=MentorSerializer
    permission_classes=[IsAuthenticated,RolePermission]

class MentorDetailView(generics.RetrieveAPIView):
    queryset=Mentor.objects.all()
    serializer_class=MentorSerializer
    permission_classes=[IsAuthenticated,RolePermission]

class MentorCreateView(generics.CreateAPIView):
    queryset=Mentor.objects.all()
    serializer_class=MentorSerializer
    permission_classes=[IsAuthenticated,RolePermission]

class MentorUpdateView(generics.UpdateAPIView):
    queryset=Mentor.objects.all()
    serializer_class=MentorSerializer
    permission_classes=[IsAuthenticated,RolePermission]

class MentorDeleteView(generics.DestroyAPIView):
    queryset=Mentor.objects.all()
    serializer_class=MentorSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class CourseListView(generics.ListAPIView):
    queryset=Course.objects.all()
    serializer_class=CourseSerilaizer
    permission_classes=[IsAuthenticated,RolePermission]

class CourseDetailView(generics.RetrieveAPIView):
    queryset=Course.objects.all()
    serializer_class=CourseSerilaizer
    permission_classes=[IsAuthenticated,RolePermission]


class CourseCreateView(generics.CreateAPIView):
    queryset=Course.objects.all()
    serializer_class=CourseSerilaizer
    permission_classes=[IsAuthenticated,RolePermission]


class CourseUpdateView(generics.UpdateAPIView):
    queryset=Course.objects.all()
    serializer_class=CourseSerilaizer
    permission_classes=[IsAuthenticated,RolePermission]


class CourseDeleteView(generics.DestroyAPIView):
    queryset=Course.objects.all()
    serializer_class=CourseSerilaizer
    permission_classes=[IsAuthenticated,RolePermission]


class GroupListView(generics.ListAPIView):
    queryset=Group.objects.all()
    serializer_class=GroupSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class GroupDetailView(generics.RetrieveAPIView):
    queryset=Group.objects.all()
    serializer_class=GroupSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class GroupCreateView(generics.CreateAPIView):
    queryset=Group.objects.all()
    serializer_class=GroupSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class GroupUpdateView(generics.UpdateAPIView):
    queryset=Group.objects.all()
    serializer_class=GroupSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class GroupDeleteView(generics.DestroyAPIView):
    queryset=Group.objects.all()
    serializer_class=GroupSerializer
    permission_classes=[IsAuthenticated,RolePermission]



class StudentenrollListView(generics.ListAPIView):
    queryset=Student_enroll.objects.all()
    serializer_class=StudentenrollSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class StudentenrollDetailView(generics.RetrieveAPIView):
    queryset=Student_enroll.objects.all()
    serializer_class=StudentenrollSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class StudentenrollCreateView(generics.CreateAPIView):
    queryset=Student_enroll.objects.all()
    serializer_class=StudentenrollSerializer
    permission_classes=[IsAuthenticated,RolePermission]

class StudentenrollUpdateView(generics.UpdateAPIView):
    queryset=Student_enroll.objects.all()
    serializer_class=StudentenrollSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class StudentenrollDelete(generics.DestroyAPIView):
    queryset=Student_enroll.objects.all()
    serializer_class=StudentenrollSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class MentorenrollListVie(generics.ListAPIView):
    queryset=Mentor_enroll.objects.all()
    serializer_class=MentorenrollSerializer
    permission_classes=[IsAuthenticated,RolePermission]
    
class MentorenrollDetailView(generics.RetrieveAPIView):
    queryset=Mentor_enroll.objects.all()
    serializer_class=MentorenrollSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class MentorenrollCreateView(generics.CreateAPIView):
    queryset=Mentor_enroll.objects.all()
    serializer_class=MentorenrollSerializer
    permission_classes=[IsAuthenticated,RolePermission]

class MentorenrollUpdateView(generics.UpdateAPIView):
    queryset=Mentor_enroll.objects.all()
    serializer_class=MentorenrollSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class MentorenrollDelete(generics.DestroyAPIView):
    queryset=Mentor_enroll.objects.all()
    serializer_class=MentorenrollSerializer
    permission_classes=[IsAuthenticated,RolePermission]



class TimetableListView(generics.ListAPIView):
    queryset=Timetable.objects.all()
    serializer_class=TimetableSerializer
    permission_classes=[IsAuthenticated,RolePermission]

class TimetableDetailView(generics.RetrieveAPIView):
    queryset=Timetable.objects.all()
    serializer_class=TimetableSerializer
    permission_classes=[IsAuthenticated,RolePermission]

class TimetableCreateView(generics.CreateAPIView):
    queryset=Timetable.objects.all()
    serializer_class=TimetableSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class TimetableUpdateView(generics.UpdateAPIView):
    queryset=Timetable.objects.all()
    serializer_class=TimetableSerializer
    permission_classes=[IsAuthenticated,RolePermission]

class TimetableDeleteView(generics.DestroyAPIView):
    queryset=Timetable.objects.all()
    serializer_class=TimetableSerializer
    permission_classes=[IsAuthenticated,RolePermission]



class ActivityListView(generics.ListAPIView):
    queryset=Activity.objects.all()
    serializer_class=ActivitySerializer
    permission_classes=[IsAuthenticated,RolePermission]


class ActivityDetailView(generics.RetrieveAPIView):
    queryset=Activity.objects.all()
    serializer_class=ActivitySerializer
    permission_classes=[IsAuthenticated,RolePermission]


class ActivityCreateView(generics.CreateAPIView):
    queryset=Activity.objects.all()
    serializer_class=ActivitySerializer
    permission_classes=[IsAuthenticated,RolePermission]

class ActivityUpdateView(generics.UpdateAPIView):
    queryset=Activity.objects.all()
    serializer_class=ActivitySerializer
    permission_classes=[IsAuthenticated,RolePermission]

class ActivityDeleteView(generics.DestroyAPIView):
    queryset=Activity.objects.all()
    serializer_class=ActivitySerializer
    permission_classes=[IsAuthenticated,RolePermission]


class GradeListView(generics.ListAPIView):
    queryset=Grade.objects.all()
    serializer_class=GradeSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class GradeDeatilView(generics.RetrieveAPIView):
    queryset=Grade.objects.all()
    serializer_class=GradeSerializer
    permission_classes=[IsAuthenticated,RolePermission]

class GradeCreateView(generics.CreateAPIView):
    queryset=Grade.objects.all()
    serializer_class=GradeSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class GradeUpdateView(generics.UpdateAPIView):
    queryset=Grade.objects.all()
    serializer_class=GradeSerializer
    permission_classes=[IsAuthenticated,RolePermission]

class GradeDeleteView(generics.DestroyAPIView):
    queryset=Grade.objects.all()
    serializer_class=GradeSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class GradeexamListView(generics.ListAPIView):
    queryset=Grade_Exam.objects.all()
    serializer_class=GradeexamSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class GradeexamDeatilView(generics.RetrieveAPIView):
    queryset=Grade_Exam.objects.all()
    serializer_class=GradeexamSerializer
    permission_classes=[IsAuthenticated,RolePermission]

class GradeexamCreateView(generics.CreateAPIView):
    queryset=Grade_Exam.objects.all()
    serializer_class=GradeexamSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class GradeexamUpdateView(generics.UpdateAPIView):
    queryset=Grade_Exam.objects.all()
    serializer_class=GradeexamSerializer
    permission_classes=[IsAuthenticated,RolePermission]

class GradeexamDeleteView(generics.DestroyAPIView):
    queryset=Grade_Exam.objects.all()
    serializer_class=GradeexamSerializer
    permission_classes=[IsAuthenticated,RolePermission]


class StudentDetailView(generics.RetrieveAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentDetailSerializer
    permission_classes=[IsAuthenticated,RolePermission]


