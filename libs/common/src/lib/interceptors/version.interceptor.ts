import {
	Injectable,
	Inject,
	Optional,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	NotFoundException,
	HttpException,
	HttpStatus
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { VERSION_KEY } from '../decorators/api-version.decorator';

interface VersionInterceptorOptions {
	defaultVersion?: string;
	versionHeader?: string;
	versionQueryKey?: string;
	versionPrefix?: string;
	deprecatedVersions?: string[];
}

/**
 * 版本拦截器选项注入 Token
 *
 * 用于通过 NestJS DI 向 {@link VersionInterceptor} 注入可选配置。
 */
export const VERSION_INTERCEPTOR_OPTIONS = 'VERSION_INTERCEPTOR_OPTIONS';

@Injectable()
export class VersionInterceptor implements NestInterceptor {
	private readonly defaultVersion: string;
	private readonly versionHeader: string;
	private readonly versionQueryKey: string;
	private readonly versionPrefix: string;
	private readonly deprecatedVersions: Set<string>;

	constructor(
		private readonly reflector: Reflector,
		@Optional() @Inject(VERSION_INTERCEPTOR_OPTIONS) options?: VersionInterceptorOptions
	) {
		this.defaultVersion = options?.defaultVersion || 'v1';
		this.versionHeader = options?.versionHeader || 'X-API-Version';
		this.versionQueryKey = options?.versionQueryKey || 'version';
		this.versionPrefix = options?.versionPrefix || '';
		this.deprecatedVersions = new Set(options?.deprecatedVersions || []);
	}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest();

		const clientVersion = this.extractVersion(request);
		const supportedVersions = this.reflector.getAllAndOverride<string[]>(VERSION_KEY, [
			context.getHandler(),
			context.getClass()
		]);

		if (!supportedVersions || supportedVersions.length === 0) {
			return next.handle();
		}

		if (!this.isVersionSupported(clientVersion, supportedVersions)) {
			return throwError(() => new NotFoundException(`不支持的 API 版本: ${clientVersion}`));
		}

		return next.handle().pipe(
			map((data) => this.addVersionHeaders(request, data, clientVersion)),
			catchError((error) => {
				if (error instanceof HttpException) {
					return throwError(() => error);
				}
				return throwError(() => error);
			})
		);
	}

	private extractVersion(request: any): string {
		const headerVersion = request.headers[this.versionHeader.toLowerCase()];
		const queryVersion = request.query[this.versionQueryKey];

		let version = headerVersion || queryVersion || this.defaultVersion;

		if (this.versionPrefix && !version.startsWith(this.versionPrefix)) {
			version = this.versionPrefix + version;
		}

		return version;
	}

	private isVersionSupported(clientVersion: string, supportedVersions: string[]): boolean {
		return supportedVersions.some((version) => {
			if (version === '*') {
				return true;
			}

			if (version === clientVersion) {
				return true;
			}

			const clientNum = parseInt(clientVersion.replace(this.versionPrefix, ''), 10);
			const supportedNum = parseInt(version.replace(this.versionPrefix, ''), 10);

			if (!isNaN(clientNum) && !isNaN(supportedNum) && supportedNum >= clientNum) {
				return true;
			}

			return false;
		});
	}

	private addVersionHeaders(request: any, data: any, version: string): any {
		const response = request.res;
		if (response) {
			response.setHeader('X-API-Version', version);

			if (this.deprecatedVersions.has(version)) {
				response.setHeader('X-API-Deprecated', `API 版本 ${version} 已弃用，请升级到最新版本`);
				response.setHeader('Deprecation', true);
			}

			response.setHeader('X-Supported-Versions', Array.from(this.deprecatedVersions).concat(version).join(', '));
		}

		return data;
	}
}
