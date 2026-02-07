import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';
import { Report } from './entities/report.entity';
import { ReportTemplate } from './entities/report-template.entity';
import { ReportSchedule } from './entities/report-schedule.entity';

@Module({
	imports: [MikroOrmModule.forFeature([Report, ReportTemplate, ReportSchedule])],
	controllers: [ReportingController],
	providers: [ReportingService],
	exports: [ReportingService]
})
export class ReportingModule {}
