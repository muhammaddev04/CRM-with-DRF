from django.urls import path
from .views import *

urlpatterns = [
   
    path('students/', StudentListView.as_view()),
    path('student/<int:pk>/', StudentDetailView.as_view()),
    path('student-create/', StudentCreateView.as_view()),
    path('student-update/<int:pk>/', StudentUpdateView.as_view()),
    path('student-delete/<int:pk>/', StudentDeleteView.as_view()),
    path('student-detail/<int:pk>/',StudentDetailView.as_view()),

    
    path('mentors/', MentorListView.as_view()),
    path('mentor/<int:pk>/', MentorDetailView.as_view()),
    path('mentor-create/', MentorCreateView.as_view()),
    path('mentor-update/<int:pk>/', MentorUpdateView.as_view()),
    path('mentor-delete/<int:pk>/', MentorDeleteView.as_view()),

    
    path('courses/', CourseListView.as_view()),
    path('course/<int:pk>/', CourseDetailView.as_view()),
    path('course-create/', CourseCreateView.as_view()),
    path('course-update/<int:pk>/', CourseUpdateView.as_view()),
    path('course-delete/<int:pk>/', CourseDeleteView.as_view()),

   
    path('groups/', GroupListView.as_view()),
    path('group/<int:pk>/', GroupDetailView.as_view()),
    path('group-create/', GroupCreateView.as_view()),
    path('group-update/<int:pk>/', GroupUpdateView.as_view()),
    path('group-delete/<int:pk>/', GroupDeleteView.as_view()),

    
    path('student-enrolls/', StudentenrollListView.as_view()),
    path('student-enroll/<int:pk>/', StudentenrollDetailView.as_view()),
    path('student-enroll-create/', StudentenrollCreateView.as_view()),
    path('student-enroll-update/<int:pk>/', StudentenrollUpdateView.as_view()),
    path('student-enroll-delete/<int:pk>/', StudentenrollDelete.as_view()),

    
    path('mentor-enrolls/', MentorenrollListVie.as_view()),
    path('mentor-enroll/<int:pk>/', MentorenrollDetailView.as_view()),
    path('mentor-enroll-create/', MentorenrollCreateView.as_view()),
    path('mentor-enroll-update/<int:pk>/', MentorenrollUpdateView.as_view()),
    path('mentor-enroll-delete/<int:pk>/', MentorenrollDelete.as_view()),

    
    path('timetables/', TimetableListView.as_view()),
    path('timetable/<int:pk>/', TimetableDetailView.as_view()),
    path('timetable-create/', TimetableCreateView.as_view()),
    path('timetable-update/<int:pk>/', TimetableUpdateView.as_view()),
    path('timetable-delete/<int:pk>/', TimetableDeleteView.as_view()),


    path('activities/', ActivityListView.as_view()),
    path('activity/<int:pk>/', ActivityDetailView.as_view()),
    path('activity-create/', ActivityCreateView.as_view()),
    path('activity-update/<int:pk>/', ActivityUpdateView.as_view()),
    path('activity-delete/<int:pk>/', ActivityDeleteView.as_view()),


    path('grades/', GradeListView.as_view()),
    path('grade/<int:pk>/', GradeDeatilView.as_view()),
    path('grade-create/', GradeCreateView.as_view()),
    path('grade-update/<int:pk>/', GradeUpdateView.as_view()),
    path('grade-delete/<int:pk>/', GradeDeleteView.as_view()),

    
    path('grade-exams/', GradeexamListView.as_view()),
    path('grade-exam/<int:pk>/', GradeexamDeatilView.as_view()),
    path('grade-exam-create/', GradeexamCreateView.as_view()),
    path('grade-exam-update/<int:pk>/', GradeexamUpdateView.as_view()),
    path('grade-exam-delete/<int:pk>/', GradeexamDeleteView.as_view()),
]
