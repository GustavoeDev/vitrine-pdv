from rest_framework.permissions import BasePermission


class IsStaffUser(BasePermission):
    message = "Acesso restrito a administradores."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class IsStoreOwner(BasePermission):
    message = "Acesso restrito ao dono da loja."

    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj) -> bool:
        store = getattr(obj, 'store', obj)
        return bool(store and store.user_id == request.user.id)
