import * as expressSession from 'express-session';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';

/**
 * 设置 Redis 客户端并记录关键事件
 *
 * @param options - Redis 连接选项
 * @returns 配置好的 Redis 客户端实例
 */
function createRedisClient(options: any) {
	const redisClient = createClient(options);

	const events = {
		error: 'Redis Session Store Client Error',
		connect: 'Redis Session Store Client Connected',
		ready: 'Redis Session Store Client Ready',
		reconnecting: 'Redis Session Store Client Reconnecting',
		end: 'Redis Session Store Client End'
	};

	Object.entries(events).forEach(([event, message]) => {
		redisClient.on(event, () => {
			console.log(message);
		});
	});

	return redisClient;
}

/**
 * 配置会话存储，优先使用 Redis，否则使用内存存储
 *
 * @param app - Express 应用实例
 */
// export async function configureRedisSession(app: any): Promise<void> {
// 	const isProduction = process.env.NODE_ENV === 'production';
// 	const secret = process.env.EXPRESS_SESSION_SECRET || 'default-secret-change-me';
// 	let redisWorked = false;

// 	console.log('REDIS_ENABLED: ', process.env.REDIS_ENABLED);

// 	if (process.env.REDIS_ENABLED === 'true') {
// 		try {
// 			const { REDIS_URL, REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASSWORD, REDIS_TLS } = process.env;

// 			const url =
// 				REDIS_URL ||
// 				(() => {
// 					const redisProtocol = REDIS_TLS === 'true' ? 'rediss' : 'redis';
// 					const auth = REDIS_USER && REDIS_PASSWORD ? `${REDIS_USER}:${REDIS_PASSWORD}@` : '';
// 					return `${redisProtocol}://${auth}${REDIS_HOST}:${REDIS_PORT}`;
// 				})();

// 			console.log('REDIS_URL: ', url);

// 			const redisClient = createClient({ url });

// 			if (!redisWorked) {
// 				await redisClient.connect();
// 				redisWorked = true;
// 			}

// 			app.use(expressSession({
// 				secret,
// 				saveUninitialized: false,
// 				resave: true,
// 				store: new RedisStore({
// 					client: redisClient,
// 					prefix: 'sess:',
// 					rollback: true,
// 					secret
// 				})
// 			});

// 			console.log('Redis Session Storage configured successfully');
// 		} catch (error) {
// 			console.error('Redis Session Storage Configuration error:', error.message);
// 		}
// }

/**
 * 配置会话存储，优先使用 Redis，否则使用内存存储
 *
 * @param app - Express 应用实例
 */
export async function configureRedisSession(app: any): Promise<void> {
	const isProduction = process.env.NODE_ENV === 'production';
	const secret = process.env.EXPRESS_SESSION_SECRET || 'default-secret-change-me';
	let redisWorked = false;

	console.log('REDIS_ENABLED: ', process.env.REDIS_ENABLED);

	if (process.env.REDIS_ENABLED === 'true') {
		try {
			const { REDIS_URL, REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASSWORD, REDIS_TLS } = process.env;

			const url =
				REDIS_URL ||
				(() => {
					const redisProtocol = REDIS_TLS === 'true' ? 'rediss' : 'redis';
					const auth = REDIS_USER && REDIS_PASSWORD ? `${REDIS_USER}:${REDIS_PASSWORD}@` : '';
					return `${redisProtocol}://${auth}${REDIS_HOST}:${REDIS_PORT}`;
				})();

			console.log('REDIS_URL: ', url);

			const parsedUrl = new URL(url);
			const isTls = parsedUrl.protocol === 'rediss:';
			const username = parsedUrl.username || REDIS_USER;
			const password = parsedUrl.password || REDIS_PASSWORD || undefined;
			const host = parsedUrl.hostname || REDIS_HOST;
			const port = parseInt(parsedUrl.port || REDIS_PORT || '6379', 10);

			const redisConnectionOptions = {
				url,
				username,
				password,
				isolationPoolOptions: {
					min: 1,
					max: 100
				},
				socket: {
					tls: isTls,
					host,
					port,
					passphrase: password,
					keepAlive: 10_000,
					reconnectStrategy: (retries: number) => Math.min(1000 * Math.pow(2, retries), 5000),
					connectTimeout: 10_000,
					rejectUnauthorized: isProduction
				},
				pingInterval: 30_000,
				ttl: 60 * 60 * 24 * 7
			};

			const redisClient = createRedisClient(redisConnectionOptions);

			try {
				await redisClient.connect();
				console.log('Redis Session Store Client Sessions Ping: ', await redisClient.ping());
			} catch (error) {
				console.error('Failed to connect to Redis:', error);
			}

			const redisStore = new RedisStore({
				client: redisClient,
				prefix: isProduction ? 'oksai-prodsess:' : 'oksai-devsess:'
			});

			app.use(
				expressSession({
					store: redisStore,
					secret,
					resave: false,
					saveUninitialized: true
				})
			);

			redisWorked = true;
		} catch (error) {
			console.error('Failed to initialize Redis session store:', error);
		}
	}

	if (!redisWorked) {
		app.use(
			expressSession({
				secret,
				resave: true,
				saveUninitialized: true
			})
		);
	}
}
