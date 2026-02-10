import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { VisualizationService } from './visualization.service';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { AnalyticsReport } from './entities/analytics-report.entity';
import { AnalyticsMetric } from './entities/analytics-metric.entity';

@Module({
	imports: [MikroOrmModule.forFeature([AnalyticsEvent, AnalyticsReport, AnalyticsMetric])],
	controllers: [AnalyticsController],
	providers: [AnalyticsService, VisualizationService],
	exports: [AnalyticsService, VisualizationService]
})
export class AnalyticsModule {}
