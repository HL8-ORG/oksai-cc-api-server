import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { Organization } from './entities/organization.entity';

@Module({
	imports: [MikroOrmModule.forFeature([Organization])],
	controllers: [OrganizationController],
	providers: [OrganizationService],
	exports: [OrganizationService]
})
export class OrganizationModule {}
