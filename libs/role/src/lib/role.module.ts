import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { APP_GUARD } from '@nestjs/core';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { PermissionsGuard } from './guards/permissions.guard';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

@Module({
	imports: [MikroOrmModule.forFeature([Role, Permission])],
	controllers: [RoleController, PermissionController],
	providers: [
		RoleService,
		PermissionService,
		PermissionsGuard,
		{
			provide: APP_GUARD,
			useClass: PermissionsGuard
		}
	],
	exports: [RoleService, PermissionService, PermissionsGuard]
})
export class RoleModule {}
