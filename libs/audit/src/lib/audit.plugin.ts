import * as chalk from 'chalk';
import { IOksaisPluginBootstrap, IOksaisPluginDestroy } from '@oksai/plugin';
import { AuditModule } from './audit.module';
import { AuditLog } from './entities/audit-log.entity';

export class AuditPlugin implements IOksaisPluginBootstrap, IOksaisPluginDestroy {
	private logEnabled = true;

	async onPluginBootstrap(): Promise<void> {
		if (this.logEnabled) {
			console.log(chalk.green('✓ Audit Plugin initialized'));
		}
	}

	async onPluginDestroy(): Promise<void> {
		if (this.logEnabled) {
			console.log(chalk.red('✗ Audit Plugin destroyed'));
		}
	}
}
