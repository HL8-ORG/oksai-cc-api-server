import * as chalk from 'chalk';
import { IOksaisPluginBootstrap, IOksaisPluginDestroy } from '@oksai/plugin';

export class UserPlugin implements IOksaisPluginBootstrap, IOksaisPluginDestroy {
	private logEnabled = true;

	async onPluginBootstrap(): Promise<void> {
		if (this.logEnabled) {
			console.log(chalk.green('✓ User Plugin initialized'));
		}
	}

	async onPluginDestroy(): Promise<void> {
		if (this.logEnabled) {
			console.log(chalk.red('✗ User Plugin destroyed'));
		}
	}
}
