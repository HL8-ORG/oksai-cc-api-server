import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions, SwaggerCustomOptions } from '@nestjs/swagger';

/**
 * 设置和配置 Swagger 和 Scalar API 文档
 *
 * 使用 DocumentBuilder 创建 Swagger 配置，包括标题、描述、版本和认证信息
 * 生成 Swagger 文档并设置 Swagger UI 和 Scalar UI 端点
 *
 * @param app - NestJS 应用实例
 * @returns Promise<string> Swagger 文档路径
 */
export const setupSwagger = async (
	app: INestApplication,
	{
		title = 'OKSAI Platform API',
		description = 'OKSAI Platform API Documentation',
		version = '1.0',
		swaggerPath = 'api-docs',
		scalarPath = 'docs',
		enableScalar = true,
		contact = {
			name: 'OKSAI Team',
			url: 'https://oksais.io',
			email: 'team@oksais.io'
		},
		license = {
			name: 'AGPL-3.0-only',
			url: 'https://opensource.org/license/agpl-v3'
		},
		externalDocs = {
			description: '查看更多信息',
			url: 'https://docs.oksais.io'
		},
		servers = [
			{
				url: 'http://localhost:3000',
				description: '开发服务器'
			},
			{
				url: 'https://api.oksais.io',
				description: '生产服务器'
			}
		]
	}: {
		title?: string;
		description?: string;
		version?: string;
		swaggerPath?: string;
		scalarPath?: string;
		enableScalar?: boolean;
		contact?: {
			name?: string;
			url?: string;
			email?: string;
		};
		license?: {
			name?: string;
			url?: string;
		};
		externalDocs?: {
			description?: string;
			url?: string;
		};
		servers?: Array<{
			url: string;
			description: string;
		}>;
	} = {}
): Promise<string> => {
	const config = new DocumentBuilder()
		.setTitle(title)
		.setDescription(description)
		.setVersion(version)
		.setContact(contact.name, contact.url, contact.email)
		.setLicense(license.name, license.url)
		.setExternalDoc(externalDocs.description, externalDocs.url)
		.addBearerAuth({
			type: 'http',
			scheme: 'bearer',
			bearerFormat: 'JWT',
			name: 'JWT',
			description: '输入 JWT token',
			in: 'header'
		})
		.addApiKey(
			{
				type: 'apiKey',
				name: 'X-API-Key',
				in: 'header',
				description: 'API 认证密钥'
			},
			'api-key'
		)
		.addOAuth2({
			type: 'oauth2',
			flows: {
				authorizationCode: {
					authorizationUrl: '/oauth/authorize',
					tokenUrl: '/oauth/token',
					scopes: {
						read: '读取权限',
						write: '写入权限',
						admin: '管理员权限'
					}
				}
			}
		})
		.build();

	if (servers && servers.length > 0) {
		config.servers = servers;
	}

	const options: SwaggerDocumentOptions = {
		operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey
	};

	const document = SwaggerModule.createDocument(app, config, options);

	const customOptions: SwaggerCustomOptions = {
		swaggerOptions: {
			persistAuthorization: true,
			docExpansion: 'none',
			filter: true,
			showRequestDuration: true
		},
		customSiteTitle: title
	};

	SwaggerModule.setup(swaggerPath, app, document, customOptions);

	if (enableScalar) {
		await setupScalarUI(app, document, scalarPath, swaggerPath, title, servers);
	}

	return swaggerPath;
};

/**
 * 设置 Scalar UI 文档
 *
 * @param app - NestJS 应用实例
 * @param document - Swagger 文档对象
 * @param scalarPath - Scalar UI 路径
 * @param swaggerPath - Swagger 路径
 * @param title - API 标题
 * @param servers - 服务器列表
 */
async function setupScalarUI(
	app: INestApplication,
	document: any,
	scalarPath: string,
	swaggerPath: string,
	title: string,
	servers: Array<{ url: string; description: string }>
): Promise<void> {
	const scalarConfig = {
		theme: 'default',
		layout: 'modern',
		content: document,
		metaData: {
			title: `${title} - API 文档`,
			description: `${title} 的 API 文档`
		},
		showSidebar: true,
		showToolbar: true,
		persistAuth: true,
		servers: servers
	};

	try {
		const { apiReference } = await eval("import('@scalar/nestjs-api-reference')");

		app.use(`/${scalarPath}`, apiReference(scalarConfig));
	} catch (error) {
		console.warn('加载 @scalar/nestjs-api-reference 失败，使用 CDN 后备方案:', error);

		const httpAdapter = app.getHttpAdapter();
		httpAdapter.get(`/${scalarPath}`, (_req, res) => {
			const html = `
<!doctype html>
<html>
  <head>
    <title>${scalarConfig.metaData.title}</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${scalarConfig.metaData.description}" />

  </head>
  <body>
    <script
      id="api-reference"
      data-url="/${swaggerPath}-json"
      data-configuration='${JSON.stringify({
			theme: scalarConfig.theme,
			layout: scalarConfig.layout,
			metaData: scalarConfig.metaData,
			showSidebar: scalarConfig.showSidebar,
			showToolbar: scalarConfig.showToolbar,
			persistAuth: scalarConfig.persistAuth,
			servers: scalarConfig.servers
		})}'
    ></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;
			res.type('text/html').send(html);
		});
	}
}
