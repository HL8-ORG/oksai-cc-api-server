import * as chalk from 'chalk';
import { IOksaisPluginBootstrap, IOksaisPluginDestroy } from '@oksai/plugin';

export class TenantPlugin implements IOksaisPluginBootstrap, IOksaisPluginDestroy {
	private logEnabled = true;

	async onPluginBootstrap(): Promise<void> {
		if (this.logEnabled) {
			console.log(chalk.green('✓ Tenant Plugin initialized'));
		}

		await this.ensureDefaultTenant();
	}

	async onPluginDestroy(): Promise<void> {
		if (this.logEnabled) {
			console.log(chalk.red('✗ Tenant Plugin destroyed'));
		}
	}

	private async ensureDefaultTenant(): Promise<void> {
		const tenantService = new (await import('./tenant.service')).TenantService({} as any);

		try {
			const defaultTenant = await tenantService.findBySlug('default');

			if (!defaultTenant) {
				console.log(chalk.yellow('⚠ Creating default tenant...'));
				await tenantService.create({
					name: 'Default Tenant',
					slug: 'default',
					status: 'ACTIVE',
					type: 'ORGANIZATION',
					allowSelfRegistration: true,
					maxUsers: 100
				});
				console.log(chalk.green('✓ Default tenant created'));
			}
		} catch (error) {
			console.error(chalk.red('✗ Failed to ensure default tenant'), error);
		}
	}
}
