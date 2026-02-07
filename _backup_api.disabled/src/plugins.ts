import { environment } from '@oksai/config';

import { ChangelogPlugin } from '@oksai/plugin-changelog';
import { IntegrationAIPlugin } from '@oksai/plugin-integration-ai';
import { IntegrationGithubPlugin } from '@oksai/plugin-integration-github';
import { IntegrationJiraPlugin } from '@oksai/plugin-integration-jira';
import { IntegrationHubstaffPlugin } from '@oksai/plugin-integration-hubstaff';
import { IntegrationMakeComPlugin } from '@oksai/plugin-integration-make-com';
import { IntegrationZapierPlugin } from '@oksai/plugin-integration-zapier';
import { IntegrationActivepiecesPlugin } from '@oksai/plugin-integration-activepieces';
import { IntegrationUpworkPlugin } from '@oksai/plugin-integration-upwork';
import { JitsuAnalyticsPlugin } from '@oksai/plugin-jitsu-analytics';
import { JobProposalPlugin } from '@oksai/plugin-job-proposal';
import { JobSearchPlugin } from '@oksai/plugin-job-search';
import { KnowledgeBasePlugin } from '@oksai/plugin-knowledge-base';
import { ProductReviewsPlugin } from '@oksai/plugin-product-reviews';
import { VideosPlugin } from '@oksai/plugin-videos';
import { RegistryPlugin } from '@oksai/plugin-registry';
import { CamshotPlugin } from '@oksai/plugin-camshot';

import { SentryTracing as SentryPlugin } from './sentry';
import { PosthogAnalytics as PosthogPlugin } from './posthog';
import { SoundshotPlugin } from '@oksai/plugin-soundshot';

const { jitsu, sentry, posthog } = environment;

/**
 * An array of plugins to be included or used in the codebase.
 */
export const plugins = [
	// Includes the SentryPlugin based on the presence of Sentry configuration.
	...(sentry?.dsn ? [SentryPlugin] : []),

	// Includes the PostHogPlugin based on the presence of PostHog configuration.
	...(posthog?.posthogEnabled && posthog?.posthogKey ? [PosthogPlugin] : []),

	// Initializes the Jitsu Analytics Plugin by providing a configuration object.
	JitsuAnalyticsPlugin.init({
		config: {
			host: jitsu.serverHost,
			writeKey: jitsu.serverWriteKey,
			debug: jitsu.debug,
			echoEvents: jitsu.echoEvents
		}
	}),
	// Indicates the inclusion or intention to use the ChangelogPlugin in the codebase.
	ChangelogPlugin,
	// Indicates the inclusion or intention to use the IntegrationActivepiecesPlugin in the codebase.
	IntegrationActivepiecesPlugin,
	// Indicates the inclusion or intention to use the IntegrationAIPlugin in the codebase.
	IntegrationAIPlugin,
	// Indicates the inclusion or intention to use the IntegrationGithubPlugin in the codebase.
	IntegrationGithubPlugin,
	// Indicates the inclusion or intention to use the IntegrationHubstaffPlugin in the codebase.
	IntegrationHubstaffPlugin,
	// Indicates the inclusion or intention to use the IntegrationMakeComPlugin in the codebase.
	IntegrationMakeComPlugin,
	// Indicates the inclusion or intention to use the IntegrationJiraPlugin in the codebase.
	IntegrationJiraPlugin,
	// Indicates the inclusion or intention to use the IntegrationUpworkPlugin in the codebase.
	IntegrationUpworkPlugin,
	// Indicates the inclusion or intention to use the IntegrationZapierPlugin in the codebase.
	IntegrationZapierPlugin,
	// Indicates the inclusion or intention to use the JobProposalPlugin in the codebase.
	JobProposalPlugin,
	// Indicates the inclusion or intention to use the JobSearchPlugin in the codebase.
	JobSearchPlugin,
	// Indicates the inclusion or intention to use the KnowledgeBasePlugin in the codebase.
	KnowledgeBasePlugin,
	// Indicates the inclusion or intention to use the ProductReviewsPlugin in the codebase.
	ProductReviewsPlugin,
	// Indicates the inclusion or intention to use the VideosPlugin in the codebase.
	VideosPlugin,
	// Indicates the inclusion or intention to use the CamshotPlugin in the codebase.
	CamshotPlugin,
	// Indicates the inclusion or intention to use the SoundshotPlugin in the codebase.
	SoundshotPlugin,
	// Indicates the inclusion or intention to use the RegistryPlugin in the codebase.
	RegistryPlugin
];
