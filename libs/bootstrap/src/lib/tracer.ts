'use strict';

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPTraceExporter as OTLPTraceExporterGrpc } from '@opentelemetry/exporter-trace-otlp-grpc';
import { NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { MySQL2Instrumentation } from '@opentelemetry/instrumentation-mysql2';
import {
	BatchSpanProcessor,
	ConsoleSpanExporter,
	SimpleSpanProcessor,
	SpanExporter
} from '@opentelemetry/sdk-trace-base';
import { HoneycombOptions, HoneycombSDK } from '@honeycombio/opentelemetry-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const isConsole = false;
const isAuto = true;

let provider: NodeTracerProvider;
let honeycombSDK: HoneycombSDK;

let instrumentations: any[];

let traceExporter: SpanExporter;
let url: string;

if (process.env.OTEL_ENABLED === 'true') {
	if (process.env.NODE_ENV === 'development') {
		diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
	}

	let serviceName: string;

	if (process.env.OTEL_SERVICE_NAME) {
		serviceName = process.env.OTEL_SERVICE_NAME;
	} else {
		let sName = 'OKSAI Platform';

		if (process.env.CLOUD_PROVIDER) {
			const providerName = process.env.CLOUD_PROVIDER;
			console.log('Tracing Cloud Provider: ' + providerName);
			sName = sName + '-' + providerName;
		}

		function formatServiceName(name) {
			let formattedName = name.toLowerCase();
			formattedName = formattedName.replace(/[\s\W-]+/g, '-');
			return formattedName;
		}

		serviceName = formatServiceName(sName);
	}

	console.log('Tracing service name: ' + serviceName);

	provider = new NodeTracerProvider({
		resource: new Resource({
			[SemanticResourceAttributes.SERVICE_NAME]: serviceName
		})
	});

	provider.register();

	url = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;

	if (!process.env.OTEL_PROVIDER || process.env.OTEL_PROVIDER === 'jaeger') {
		const isGrpc = process.env.OTEL_EXPORTER_OTLP_PROTOCOL === 'grpc';

		if (!url) url = isGrpc ? 'grpc://localhost:14250' : 'http://localhost:14268/api/traces';

		const exporterOptions = {
			url: url,
			serviceName: serviceName
		};

		if (!isGrpc) {
			traceExporter = new OTLPTraceExporter(exporterOptions);
		} else {
			traceExporter = new OTLPTraceExporterGrpc(exporterOptions);
		}

		console.log('Tracing Enabled with Jaeger');
	}

	if (process.env.OTEL_PROVIDER === 'aspecto') {
		if (!url) url = 'https://otelcol.aspecto.io/v1/traces';

		const exporterOptions = {
			url: url,
			serviceName: serviceName,
			headers: {
				Authorization: process.env.ASPECTO_API_KEY
			}
		};

		traceExporter = new OTLPTraceExporter(exporterOptions);

		console.log('Tracing Enabled with Aspecto');
	}

	if (process.env.OTEL_PROVIDER === 'signoz') {
		if (!url) url = 'https://ingest.us.signoz.cloud:443/v1/traces';

		const exporterOptions = {
			url: url,
			serviceName: serviceName
		};

		traceExporter = new OTLPTraceExporter(exporterOptions);

		console.log('Tracing Enabled with Signoz');
	}

	if (process.env.OTEL_PROVIDER === 'honeycomb') {
		if (!url) url = 'https://api.honeycomb.io/v1/traces';

		console.log('Using Honeycomb API Key: ' + process.env.HONEYCOMB_API_KEY);

		const exporterOptions = {
			url: url,
			serviceName: serviceName,
			headers: {
				'x-honeycomb-team': process.env.HONEYCOMB_API_KEY
			}
		};

		traceExporter = new OTLPTraceExporter(exporterOptions);

		console.log('Tracing Enabled with Honeycomb');
	}

	if (process.env.OTEL_PROVIDER === 'zipkin') {
		if (!url) url = 'http://localhost:9411/api/v2/spans';

		const exporterOptions = {
			url: url,
			serviceName: serviceName
		};

		traceExporter = new ZipkinExporter(exporterOptions);

		console.log('Tracing Enabled with Zipkin running on URL: ' + url);
	}

	console.log('Tracing URL: ' + url);

	console.log('Tracing Headers: ' + process.env.OTEL_EXPORTER_OTLP_HEADERS);

	let spanProcessor;

	if (process.env.NODE_ENV === 'development') {
		spanProcessor = new SimpleSpanProcessor(traceExporter);
	} else {
		spanProcessor = new BatchSpanProcessor(traceExporter);
	}

	let instrumentationNames: string[];

	if (isAuto) {
		const autoInst = getNodeAutoInstrumentations({
			'@opentelemetry/instrumentation-fs': {
				enabled: false
			},
			'@opentelemetry/instrumentation-net': {
				enabled: false
			},
			'@opentelemetry/instrumentation-dns': {
				enabled: false
			}
		});

		instrumentations = [autoInst];
		instrumentationNames = autoInst.map((i) => i.instrumentationName);
	} else {
		const ins = [];
		const insNames: string[] = [];

		ins.push(new HttpInstrumentation());
		insNames.push('HttpInstrumentation');

		ins.push(new ExpressInstrumentation());
		insNames.push('ExpressInstrumentation');

		ins.push(new NestInstrumentation());
		insNames.push('NestInstrumentation');

		if (process.env.REDIS_ENABLED === 'true') {
			ins.push(new RedisInstrumentation());
			insNames.push('RedisInstrumentation');
		}

		if (process.env.DB_TYPE === 'postgres') {
			ins.push(new PgInstrumentation());
			insNames.push('PgInstrumentation');
		}

		if (process.env.DB_TYPE === 'mysql') {
			ins.push(new MySQL2Instrumentation());
			insNames.push('MySQL2Instrumentation');
		}

		instrumentations = [ins];
		instrumentationNames = insNames;
	}

	console.log('Tracing Enabled Instrumentations:', instrumentationNames.join(', '));

	if (process.env.OTEL_PROVIDER === 'honeycomb') {
		if (process.env.HONEYCOMB_API_KEY) {
			const params: HoneycombOptions = {
				apiKey: process.env.HONEYCOMB_API_KEY,
				serviceName: serviceName,
				instrumentations: instrumentations,
				localVisualizations:
					process.env.NODE_ENV === 'development' ||
					process.env.HONEYCOMB_ENABLE_LOCAL_VISUALIZATIONS === 'true'
			};

			if (isConsole) {
				params.traceExporter = new ConsoleSpanExporter();
			} else {
				params.spanProcessor = spanProcessor;
			}

			honeycombSDK = new HoneycombSDK(params);

			console.log('Tracing SDK initialized for Honeycomb');
		} else {
			console.warn('Honeycomb API Key is not set');
		}
	} else {
		const params: Partial<NodeSDKConfiguration> = {
			serviceName: serviceName,
			instrumentations: instrumentations
		};

		if (isConsole) {
			params.traceExporter = new ConsoleSpanExporter();
		} else {
			params.spanProcessor = spanProcessor;
		}

		provider.addSpanProcessor(spanProcessor);

		console.log('Tracing SDK initialized');
	}
}

export default {
	start: () => {
		if (process.env.OTEL_ENABLED === 'true') {
			if (provider) {
				registerInstrumentations({
					instrumentations: instrumentations
				});
			}

			if (honeycombSDK) {
				honeycombSDK.start();
			}
		}
	},
	shutdown: async () => {
		if (process.env.OTEL_ENABLED === 'true') {
			await provider?.shutdown();
			await honeycombSDK?.shutdown();
		}
	}
};
