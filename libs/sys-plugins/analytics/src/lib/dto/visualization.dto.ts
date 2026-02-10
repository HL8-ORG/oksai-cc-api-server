import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class ChartDataDto {
	@IsString()
	label!: string;

	@IsNumber()
	value!: number;

	@IsOptional()
	timestamp?: string;
}

export class ChartSeriesDto {
	@IsString()
	name!: string;

	data!: ChartDataDto[];

	@IsOptional()
	color?: string;
}

export class ChartConfigDto {
	chartType!: 'line' | 'bar' | 'pie' | 'area';

	title!: string;

	xAxisLabel!: string;

	yAxisLabel!: string;

	series!: ChartSeriesDto[];
}

export class TrendAnalysisDto {
	metricName!: string;

	timeDimension!: 'hourly' | 'daily' | 'weekly' | 'monthly';

	@IsOptional()
	startDate?: string;

	@IsOptional()
	endDate?: string;

	@IsOptional()
	dimension?: string;

	@IsOptional()
	tags?: string[];
}

export class ComparisonAnalysisDto {
	metrics!: string[];

	timeRange!: {
		start: string;
		end: string;
	};

	comparisonBy!: 'dimension' | 'tag' | 'all';

	@IsOptional()
	dimensionValues?: string[];
}

export class VisualizationDto {
	type!: 'chart' | 'table' | 'kpi';

	@IsOptional()
	chart?: ChartConfigDto;

	@IsOptional()
	trend?: TrendAnalysisDto;

	@IsOptional()
	comparison?: ComparisonAnalysisDto;

	@IsOptional()
	kpis?: string[];
}
