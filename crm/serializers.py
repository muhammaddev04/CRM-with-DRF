from rest_framework import serializers
from .models import *
from accounts.serializers import *


class StudentSerializer(serializers.ModelSerializer):
    user=UserSerilaizer(read_only=True)
    user_id=serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True
    )
    class Meta:
        model = Student
        fields = [
            'id',
            'f_name',
            'l_name',
            'birthdate',
            'adress',
            'email',
            'user',
            'phone',
            'user_id'
        ]


class MentorSerializer(serializers.ModelSerializer):
    user=UserSerilaizer(read_only=True)
    user_id=serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True
    )
    class Meta:
        model = Mentor
        fields = [
            'id',
            'f_name',
            'l_name',
            'birthdate',
            'adress',
            'email',
            'user',
            'phone',
            'level',
            'user_id'
        ]


class CourseSerilaizer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'id',
            'name',
            'description',
            'price',
        ]


class GroupSerializer(serializers.ModelSerializer):
    course=CourseSerilaizer(read_only=True)
    course_id=serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        source='course',
        write_only=True
    )
    class Meta:
        model = Group
        fields = [
            'id',
            'name',
            'description',
            'course',
            'start_time',
            'end_time',
            'branch',
            'status',
            'course_id'
        ]


class StudentenrollSerializer(serializers.ModelSerializer):
    group=GroupSerializer(read_only=True)
    student=StudentSerializer(read_only=True)
    group_id=serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        source='group',
        write_only=True
    )
    student_id=serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(),
        source='student',
        write_only=True
    )
    class Meta:
        model = Student_enroll
        fields = [
            'id',
            'student',
            'group',
            'cr_at',
            'status',
            'group_id',
            'student_id'
        ]

        def validate(self, data):
            student = data['student']
            course = data['course']


        
            exists = Student_enroll.objects.filter(
                student=student,
                course=course
            ).exists()


            if exists:
                raise serializers.ValidationError(
                    "Student already has this course"
                )


        
            active_course = Student_enroll.objects.filter(
                student=student,
                status="active"
            ).first()


            if active_course:
                active_course.delete()


            return data


class MentorenrollSerializer(serializers.ModelSerializer):
    group=GroupSerializer(read_only=True)
    mentor=MentorSerializer(read_only=True)
    group_id=serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        source='group',
        write_only=True
    )
    mentor_id=serializers.PrimaryKeyRelatedField(
        queryset=Mentor.objects.all(),
        source='mentor',
        write_only=True
    )
    class Meta:
        model = Mentor_enroll
        fields = [
            'id',
            'mentor',
            'group',
            'cr_at',
            'group_id',
            'mentor_id'
        ]


class TimetableSerializer(serializers.ModelSerializer):
    group=GroupSerializer(read_only=True)
    group_id=serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        source='group',
        write_only=True
    )
    class Meta:
        model = Timetable
        fields = [
            'id',
            'group',
            'startdate',
            'enddate',
            'weekday',
            'type',
            'group_id'
        ]


class ActivitySerializer(serializers.ModelSerializer):
    student=StudentSerializer(read_only=True)
    student_id=serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(),
        source='student',
        write_only=True
    )
    class Meta:
        model = Activity
        fields = [
            'id',
            'student',
            'timetable',
            'comment',
            'student_id'
        ]


    def validate(self,data):
        student = data['student']
        course = data['course']
        weekday = data['weekday']


        
        enrolled = Student_enroll.objects.filter(
            student=student,
            course=course
        ).exists()


        if not enrolled:
            raise serializers.ValidationError(
                "Student is not enrolled in this course"
            )


        timetable = Timetable.objects.filter(
            course=course,
            weekday=weekday
        ).exists()


        if not timetable:
            raise serializers.ValidationError(
                "This day is not in timetable"
            )
        return data


class GradeSerializer(serializers.ModelSerializer):
    group=GroupSerializer(read_only=True)
    student=StudentSerializer(read_only=True)
    group_id=serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        source='group',
        write_only=True
    )
    student_id=serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(),
        source='student',
        write_only=True
    )
    class Meta:
        model = Grade
        fields = [
            'id',
            'student',
            'group',
            'grade',
            'cr_at',
            'student_id',
            'group_id'
        ]



    def validate(self,data):

        student=data['student']
        course=data['course']


        enrolled = Student_enroll.objects.filter(
            student=student,
            course=course
        ).exists()


        if not enrolled:
            raise serializers.ValidationError(
                "Student is not enrolled"
            )


        return data


class GradeexamSerializer(serializers.ModelSerializer):
    group=GroupSerializer(read_only=True)
    student=StudentSerializer(read_only=True)
    group_id=serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        source='group',
        write_only=True
    )
    student_id=serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(),
        source='student',
        write_only=True
    )
    class Meta:
        model = Grade_Exam
        fields = [
            'id',
            'student',
            'group',
            'grade',
            'cr_at',
            'student_id',
            'group_id'
        ]




    def validate(self,data):

        student=data['student']
        course=data['course']
        day=data['day']


        
        enrolled = Student_enroll.objects.filter(
            student=student,
            course=course
        ).exists()


        if not enrolled:
            raise serializers.ValidationError(
                "Student is not enrolled"
            )


       
        exam_day = Timetable.objects.filter(
            course=course,
            day=day,
            type="Exam"
        ).exists()


        if not exam_day:
            raise serializers.ValidationError(
                "This day is not exam day"
            )


        return data