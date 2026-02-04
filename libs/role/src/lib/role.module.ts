import { MikroOrmModule } from '@mikro-orm/nestjs';
import { OksaisPlugin } from '@oksai/plugin';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

@OksaisPlugin({
	imports: [MikroOrmModule.forFeature([Role, Permission])],
	controllers: [RoleController],
	providers: [RoleService],
	exports: [RoleService]
})
export class RoleModule {}
