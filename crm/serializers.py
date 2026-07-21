from rest_framework import serializers
from .models import *
from accounts.serializers import *
from django.db.models import Avg, Count, Sum, Max, Min


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
    mentor=MentorSerializer(read_only=True)
    course_id=serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        source='course',
        write_only=True
    )
    mentor_id=serializers.PrimaryKeyRelatedField(
        queryset=Mentor.objects.all(),
        source='mentor',
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
            'course_id',
            'mentor',
            'mentor_id'
        ]


    def validate(self, attrs):
        if attrs['start_time'] > attrs['end_time']:
            raise serializers.ValidationError(
                'End_time must be bigger than start_time'
            )

        return attrs

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
        student = data["student"]
        group = data["group"]
        

        
        exists = Student_enroll.objects.filter(
            student=student,
            group__course=group.course
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
    student = StudentSerializer(read_only=True)

    student_id = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(),
        source='student',
        write_only=True
    )

    timetable = TimetableSerializer(read_only=True)

    timetable_id = serializers.PrimaryKeyRelatedField(
        queryset=Timetable.objects.all(),
        source='timetable',
        write_only=True
    )

    class Meta:
        model = Activity
        fields = [
            'id',
            'student',
            'student_id',
            'timetable',
            'timetable_id',
            'comment'
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

        student = data["student"]
        group = data["group"]

        course = group.course

        enrolled = Student_enroll.objects.filter(
            student=student,
            group__course=course
        ).exists()


        Student_enroll.objects.filter(
            student=student,
            group=group
        ).exists()


        Student_enroll.objects.filter(
            student=student,
            group__course=group.course
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

        student = data["student"]
        group = data["group"]

        course = group.course


        
        enrolled = Student_enroll.objects.filter(
            student=student,
            group__course=course
        ).exists()


        if not enrolled:
            raise serializers.ValidationError(
                "Student is not enrolled"
            )


       
        exam_day = Timetable.objects.filter(
            group=group,
            type="EXAM"
        ).exists()


        if not exam_day:
            raise serializers.ValidationError(
                "This day is not exam day"
            )


        return data   


class StudentDetailSerializer(serializers.ModelSerializer):

    user = UserSerilaizer(read_only=True)

    enrollments = StudentenrollSerializer(
        source="enroll",
        many=True,
        read_only=True
    )

    lesson_grades = GradeSerializer(
        source="grade",
        many=True,
        read_only=True
    )

    exam_grades = GradeexamSerializer(
        source="gradee",
        many=True,
        read_only=True
    )

    activities = ActivitySerializer(
        source="activity",
        many=True,
        read_only=True
    )

    total_groups = serializers.SerializerMethodField()
    active_group = serializers.SerializerMethodField()
    total_courses = serializers.SerializerMethodField()
    total_lesson_grades = serializers.SerializerMethodField()
    total_exam_grades = serializers.SerializerMethodField()
    average_lesson_grade = serializers.SerializerMethodField()
    average_exam_grade = serializers.SerializerMethodField()
    highest_exam_grade = serializers.SerializerMethodField()
    lowest_exam_grade = serializers.SerializerMethodField()
    total_activities = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            "id",
            "f_name",
            "l_name",
            "birthdate",
            "phone",
            "adress",
            "email",
            "user",

            "total_groups",
            "active_group",
            "total_courses",
            "total_lesson_grades",
            "total_exam_grades",
            "average_lesson_grade",
            "average_exam_grade",
            "highest_exam_grade",
            "lowest_exam_grade",
            "total_activities",

            "enrollments",
            "lesson_grades",
            "exam_grades",
            "activities",
        ]

    def get_total_groups(self, obj):
        return obj.enroll.count()

    def get_active_group(self, obj):
        enroll = obj.enroll.filter(status="ACTIVE").first()

        if enroll:
            return GroupSerializer(enroll.group).data

        return None

    def get_total_courses(self, obj):
        return Course.objects.filter(
            group__enrolls__student=obj
        ).distinct().count()

    def get_total_lesson_grades(self, obj):
        return obj.grade.count()

    def get_total_exam_grades(self, obj):
        return obj.gradee.count()

    def get_average_lesson_grade(self, obj):

        grades = obj.grade.all()

        if not grades.exists():
            return 0

        total = sum(int(i.grade) for i in grades)

        return round(total / grades.count(), 2)

    def get_average_exam_grade(self, obj):

        avg = obj.gradee.aggregate(
            Avg("grade")
        )["grade__avg"]

        if avg is None:
            return 0

        return round(avg, 2)

    def get_highest_exam_grade(self, obj):

        exam = obj.gradee.order_by("-grade").first()

        if exam:
            return exam.grade

        return None

    def get_lowest_exam_grade(self, obj):

        exam = obj.gradee.order_by("grade").first()

        if exam:
            return exam.grade

        return None

    def get_total_activities(self, obj):
        return obj.activity.count()