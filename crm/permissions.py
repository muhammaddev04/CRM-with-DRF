from rest_framework.permissions import BasePermission


class RolePermission(BasePermission):

    def has_permission(self, request, view):

        if not request.user.is_authenticated:
            return False

        role = request.user.role

        
        if role == 'admin':
            return True

        
        if role == 'teacher':
            return request.method in [
                'GET',
                'POST',
                'PUT',
                'PATCH',
                'DELETE'
            ]

        
        if role == 'student':
            return request.method in [
                'GET'
            ]

        return False


    def has_object_permission(self, request, view, obj):

        role = request.user.role


       
        if role == 'admin':
            return True


        
        if role == 'teacher':

            if request.method in [
                'PUT',
                'PATCH',
                'DELETE'
            ]:

                
                if hasattr(obj, 'group'):
                    return obj.group.mentor.user == request.user

                
                if hasattr(obj, 'mentor'):
                    return obj.mentor.user == request.user

                return False


            return True


        
        if role == 'student':
            return request.method == 'GET'


        return False
    


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.user.role=='admin':
            return True
        return False