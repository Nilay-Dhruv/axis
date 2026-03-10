def is_admin(user):
    return getattr(user, "role", None) == "admin"


def is_manager(user):
    return getattr(user, "role", None) in ["admin", "manager"]