import { MikroOrmModule } from '@mikro-orm/nestjs';
import { OksaisPlugin } from '@oksai/plugin';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { Organization } from './entities/organization.entity';

@OksaisPlugin({
	imports: [MikroOrmModule.forFeature([Organization])],
	controllers: [OrganizationController],
	providers: [OrganizationService],
	exports: [OrganizationService]
})
export class OrganizationModule {}
