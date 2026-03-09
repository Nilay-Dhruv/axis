from .user_schema import RegisterSchema, LoginSchema
from .department_schema import DepartmentCreateSchema, DepartmentUpdateSchema
from .activity_schema import ActivityCreateSchema, ActivityUpdateSchema, ActivityExecuteSchema
from .outcome_schema import (
    OutcomeCreateSchema, OutcomeUpdateSchema,
    SignalCreateSchema, SignalUpdateSchema
)
from .role_schema import RoleCreateSchema, RoleUpdateSchema, RoleAssignSchema, ALL_PERMISSIONS