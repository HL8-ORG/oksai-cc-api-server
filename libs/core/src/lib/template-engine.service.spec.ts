import { TemplateEngineService } from './template-engine.service';

describe('TemplateEngineService', () => {
	let service: TemplateEngineService;

	beforeEach(() => {
		service = new TemplateEngineService();
	});

	describe('render', () => {
		it('应该渲染简单模板', () => {
			const template = '你好，{{name}}！';
			const variables = { name: 'John' };

			const result = service.render(template, variables);

			expect(result).toBe('你好，John！');
		});

		it('应该渲染多个变量', () => {
			const template = '姓名：{{name}}，年龄：{{age}}，城市：{{city}}';
			const variables = { name: 'John', age: 25, city: '北京' };

			const result = service.render(template, variables);

			expect(result).toBe('姓名：John，年龄：25，城市：北京');
		});

		it('应该支持嵌套对象', () => {
			const template = '姓名：{{user.name}}，年龄：{{user.age}}';
			const variables = { user: { name: 'John', age: 25 } };

			const result = service.render(template, variables);

			expect(result).toBe('姓名：John，年龄：25');
		});

		it('应该支持数组', () => {
			const template = '城市：{{#each cities}}{{this}} {{/each}}';
			const variables = { cities: ['北京', '上海', '广州'] };

			const result = service.render(template, variables);

			expect(result).toBe('城市：北京 上海 广州 ');
		});

		it('应该支持条件判断（eq）', () => {
			const template = '{{#if (eq status "active")}}活跃{{/if}}';
			const variables = { status: 'active' };

			const result = service.render(template, variables);

			expect(result).toBe('活跃');
		});

		it('应该支持条件判断（ne）', () => {
			const template = '{{#if (ne status "active")}}活跃{{/if}}';
			const variables = { status: 'inactive' };

			const result = service.render(template, variables);

			expect(result).toBe('活跃');
		});

		it('应该支持逻辑运算（and）', () => {
			const template = '{{#if (and condition1 condition2)}}满足条件{{/if}}';
			const variables = { condition1: true, condition2: true };

			const result = service.render(template, variables);

			expect(result).toBe('满足条件');
		});

		it('应该支持逻辑运算（or）', () => {
			const template = '{{#if (or condition1 condition2)}}满足条件{{/if}}';
			const variables = { condition1: false, condition2: true };

			const result = service.render(template, variables);

			expect(result).toBe('满足条件');
		});

		it('应该支持逻辑运算（not）', () => {
			const template = '{{#if (not condition1)}}不满足条件{{/if}}';
			const variables = { condition1: false };

			const result = service.render(template, variables);

			expect(result).toBe('不满足条件');
		});

		it('应该支持默认值助手', () => {
			const template = '姓名：{{default name "匿名"}}';
			const variables = { name: undefined };

			const result = service.render(template, variables);

			expect(result).toBe('姓名：匿名');
		});

		it('应该支持日期格式化', () => {
			const template = '日期：{{date date}}';
			const variables = { date: '2024-01-01T12:00:00.000Z' };

			const result = service.render(template, variables);

			expect(result).toContain('2024');
		});

		it('应该处理无效模板时抛出错误', () => {
			const template = '{{#if';

			expect(() => {
				service.render(template, {});
			}).toThrow('模板渲染失败');
		});
	});

	describe('renderResetPasswordEmail', () => {
		it('应该渲染密码重置邮件模板', () => {
			const resetUrl = 'http://localhost:4200/reset-password?token=abc123&email=test@example.com';
			const userName = 'John Doe';
			const expiresHours = 1;

			const html = service.renderResetPasswordEmail(resetUrl, userName, expiresHours);

			expect(html).toContain('密码重置');
			expect(html).toContain('John Doe');
			expect(html).toContain('token');
			expect(html).toContain('abc123');
			expect(html).toContain('1 小时');
		});

		it('应该包含重置链接', () => {
			const resetUrl = 'http://localhost:4200/reset-password?token=abc123&email=test@example.com';
			const userName = 'John Doe';

			const html = service.renderResetPasswordEmail(resetUrl, userName, 1);

			expect(html).toContain('token');
			expect(html).toContain('abc123');
			expect(html).toContain('email');
			expect(html).toContain('test@example.com');
		});

		it('应该显示过期时间', () => {
			const resetUrl = 'http://localhost:4200/reset-password';
			const userName = 'John Doe';
			const expiresHours = 2;

			const html = service.renderResetPasswordEmail(resetUrl, userName, expiresHours);

			expect(html).toContain('2 小时');
		});

		it('应该包含当前年份', () => {
			const resetUrl = 'http://localhost:4200/reset-password';
			const userName = 'John Doe';
			const currentYear = new Date().getFullYear();

			const html = service.renderResetPasswordEmail(resetUrl, userName, 1);

			expect(html).toContain(currentYear.toString());
		});
	});

	describe('renderWelcomeEmail', () => {
		it('应该渲染欢迎邮件模板', () => {
			const userName = 'John Doe';
			const loginUrl = 'http://localhost:4200/login';

			const html = service.renderWelcomeEmail(userName, loginUrl);

			expect(html).toContain('欢迎加入 OKSAI 平台');
			expect(html).toContain('John Doe');
			expect(html).toContain(loginUrl);
		});

		it('应该包含功能列表', () => {
			const userName = 'John Doe';
			const loginUrl = 'http://localhost:4200/login';

			const html = service.renderWelcomeEmail(userName, loginUrl);

			expect(html).toContain('租户管理');
			expect(html).toContain('组织架构');
			expect(html).toContain('用户认证');
			expect(html).toContain('审计日志');
			expect(html).toContain('社交账号登录');
		});

		it('应该包含登录链接', () => {
			const userName = 'John Doe';
			const loginUrl = 'http://localhost:4200/login';

			const html = service.renderWelcomeEmail(userName, loginUrl);

			expect(html).toContain(loginUrl);
		});

		it('应该显示当前年份', () => {
			const userName = 'John Doe';
			const loginUrl = 'http://localhost:4200/login';
			const currentYear = new Date().getFullYear();

			const html = service.renderWelcomeEmail(userName, loginUrl);

			expect(html).toContain(currentYear.toString());
		});

		it('应该包含平台名称', () => {
			const userName = 'John Doe';
			const loginUrl = 'http://localhost:4200/login';

			const html = service.renderWelcomeEmail(userName, loginUrl);

			expect(html).toContain('OKSAI Platform');
		});
	});
});
