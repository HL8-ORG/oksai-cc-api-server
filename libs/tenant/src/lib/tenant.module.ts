import { MikroOrmModule } from '@mikro-orm/nestjs';
import { OksaisPlugin } from '@oksai/plugin';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { Tenant } from './entities/tenant.entity';

@OksaisPlugin({
	imports: [MikroOrmModule.forFeature([Tenant])],
	controllers: [TenantController],
	providers: [TenantService],
	exports: [TenantService]
})
export class TenantModule {}
