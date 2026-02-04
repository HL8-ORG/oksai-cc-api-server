import * as chalk from 'chalk';
import { IOksaisPluginBootstrap, IOksaisPluginDestroy } from '@oksai/plugin';
import { AuthModule } from './auth.module';

export class AuthPlugin implements IOksaisPluginBootstrap, IOksaisPluginDestroy {
	private logEnabled = true;

	async onPluginBootstrap(): Promise<void> {
		if (this.logEnabled) {
			console.log(chalk.green('✓ Auth Plugin initialized'));
		}

		// 插件初始化逻辑可以在这里添加
	}

	async onPluginDestroy(): Promise<void> {
		if (this.logEnabled) {
			console.log(chalk.red('✗ Auth Plugin destroyed'));
		}

		// 插件清理逻辑可以在这里添加
	}
}
