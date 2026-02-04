import { MikroOrmModule } from '@mikro-orm/nestjs';
import { OksaisPlugin } from '@oksai/plugin';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditLog } from './entities/audit-log.entity';

@OksaisPlugin({
	imports: [MikroOrmModule.forFeature([AuditLog])],
	providers: [AuditService],
	controllers: [AuditController],
	exports: [AuditService]
})
export class AuditModule {}
