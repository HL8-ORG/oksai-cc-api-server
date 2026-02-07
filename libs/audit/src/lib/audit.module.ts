import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditLog } from './entities/audit-log.entity';

@Module({
	imports: [MikroOrmModule.forFeature([AuditLog])],
	providers: [AuditService],
	controllers: [AuditController],
	exports: [AuditService]
})
export class AuditModule {}
