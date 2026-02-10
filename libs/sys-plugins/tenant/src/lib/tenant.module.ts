import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { Tenant } from './entities/tenant.entity';

@Module({
	imports: [MikroOrmModule.forFeature([Tenant])],
	controllers: [TenantController],
	providers: [TenantService],
	exports: [TenantService]
})
export class TenantModule {}
