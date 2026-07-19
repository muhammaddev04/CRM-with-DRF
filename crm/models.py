from django.db import models
from rest_framework import serializers
from django.conf import settings


class Student(models.Model):
    f_name=models.CharField(max_length=55)
    l_name=models.CharField(max_length=55)
    birthdate=models.DateField()
    phone=models.CharField(max_length=15)
    adress=models.TextField()
    email=models.EmailField()
    user=models.OneToOneField(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='student')


    def __str__(self):
        return self.f_name
    
class Mentor(models.Model):
    CHOISE=(
        ('JUNIOR','junior'),
        ('MIDDLE','middle'),
        ('SENIOR','senior')
    )
    f_name=models.CharField(max_length=55)
    l_name=models.CharField(max_length=55)
    birthdate=models.DateField()
    phone=models.CharField(max_length=15)
    adress=models.TextField()
    email=models.EmailField()
    level=models.CharField(max_length=55,choices=CHOISE,default='JUNIOR')
    user=models.OneToOneField(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='mentor')


    def __str__(self):
        return self.f_name
    

class Course(models.Model):
    name=models.CharField(max_length=55)
    description=models.TextField()
    price=models.DecimalField(max_digits=12,decimal_places=2)

    def __str__(self):
        return self.name
    

class Group(models.Model):
    name=models.CharField(max_length=55)
    description=models.TextField()
    course=models.ForeignKey(Course,on_delete=models.CASCADE,related_name='group')
    start_time=models.DateField()
    end_time=models.DateField()
    branch=models.CharField(max_length=55)
    status=models.BooleanField(default=False)
    mentor=models.ForeignKey(Mentor,on_delete=models.CASCADE,related_name='group')


    def __str__(self):
        return self.name
    

class Student_enroll(models.Model):
    CHOICE=(
        ('ACTIVE','active'),
        ('FINISHED','finished'),
        ('NO ACTIVE','no active')
    )
    student=models.ForeignKey(Student,on_delete=models.CASCADE,related_name='enroll')
    group=models.ForeignKey(Group,on_delete=models.CASCADE,related_name='enrolls')
    cr_at=models.DateTimeField(auto_now_add=True)
    status=models.CharField(max_length=30,choices=CHOICE,default='no active')

    def __str__(self):
        return f'{self.student}---{self.group}'
    

class Mentor_enroll(models.Model):
    mentor=models.ForeignKey(Mentor,on_delete=models.CASCADE,related_name='enrolll')
    group=models.ForeignKey(Group,on_delete=models.CASCADE,related_name='enrollss')
    cr_at=models.DateTimeField(auto_now_add=True)
    

    def __str__(self):
        return f'{self.mentor}---{self.group}'
    
    


class Timetable(models.Model):
    WEEK_CHOICE=(
        ('DUSHANBE','dushanbe'),
        ('SESHANBE','seshanbe'),
        ('CHORSHANBE','chorshanbe'),
        ('PANJSHANBE','panjshanbe'),
        ('JUMA','juma'),
        ('SHANBE','shanbe'),
        ('YAKSHANBE','yakshanbe'),
    )

    TYPE_CHOICE=(
        ('PRACTICE','practice'),
        ('EXAM','exam'),
    )
    group=models.ForeignKey(Group,on_delete=models.CASCADE,related_name='timetable')
    startdate=models.DateField()
    enddate=models.DateField()
    weekday=models.CharField(max_length=20,choices=WEEK_CHOICE)
    type=models.CharField(max_length=50,choices=TYPE_CHOICE,default='PRACTICE')


    def __str__(self):
        return f'{self.group}---{self.type}'
    

class Activity(models.Model):
    student=models.ForeignKey(Student,on_delete=models.CASCADE,related_name='activity')
    timetable=models.ForeignKey(Timetable,on_delete=models.CASCADE,related_name='activitys')
    comment=models.TextField()



    def __str__(self):
        return f'{self.student}---{self.timetable}'
    

class Grade(models.Model):
    student=models.ForeignKey(Student,on_delete=models.CASCADE,related_name='grade')
    group=models.ForeignKey(Group,on_delete=models.CASCADE,related_name='grades')
    grade=models.PositiveIntegerField()
    cr_at=models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f'{self.grade}'
    

class Grade_Exam(models.Model):
    student=models.ForeignKey(Student,on_delete=models.CASCADE,related_name='gradee')
    group=models.ForeignKey(Group,on_delete=models.CASCADE,related_name='gradess')
    grade=models.PositiveIntegerField()
    cr_at=models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.grade
    
    
    
    

    
    

