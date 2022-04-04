import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { UserRole } from './user-role.enum';

const RolesGuard = (role: UserRole): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      return user?.role.includes(role);
    }
  }

  return mixin(RoleGuardMixin);
};

export default RolesGuard;
