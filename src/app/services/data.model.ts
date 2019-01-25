export interface PartialOrganizationResult {
	name: string;
	forks: number;
	forks_count: number;
	id: number;
	open_issues: number;
	open_issues_count: number;
	size: number;
	stargazers_count: number;
	watchers: number;
	watchers_count: number;
}

/**
 * Represents the server response for an organization github API call
 *
 * There are many properties that are being returned. For sorting purposes I am only
 * using properties that have a sortable value (numeric). We might want to revisit this
 * and perhaps do some sort of alphanumeric sorting at some point.
 */
export class OrganizationResult {
	/* For simplicity sake I will be omitting properties that appear to have the same values */
	readonly name: string;
	readonly forks: number;
	// readonly forksCount: number; // I am unsure what's the difference between forks and forks_count
	readonly id: number;
	readonly openIssues: number;
	// readonly openIssuesCount: number; // I am unsure what's the difference between open issues and open_issues_count
	readonly size: number;
	// readonly stargazersCount: number; // These 3 values appear to be the same: stargazers_count, watchers and watchers_count
	readonly watchers: number;
	// readonly watchersCount: number;

	constructor(organizationResult: Partial<PartialOrganizationResult>) {
		this.name = organizationResult.name;
		this.forks = organizationResult.forks;
		// this.forksCount = organizationResult.forks_count;
		this.id = organizationResult.id;
		this.openIssues = organizationResult.open_issues;
		// this.openIssuesCount = organizationResult.open_issues_count;
		this.size = organizationResult.size;
		// this.stargazersCount = organizationResult.stargazers_count;
		this.watchers = organizationResult.watchers;
		// this.watchersCount = organizationResult.watchers_count;
	}
}

export interface PartialCommitResult {
	commit: CommitData;
	html_url: string;
	sha: string;
	url: string;
	author: { login: string };
	committer: { login: string };
}

export interface CommitData {
	url: string;
	author: {
		name: string;
		email: string;
		date: string;
	};
	message: string;
}

export class CommmitResult {
	readonly commitUrl: string;
	readonly url: string;
	readonly author: CommitData['author'];
	readonly message: string;
	readonly authorUsername: string;
	readonly commiterUsername: string;
	readonly sha: string;

	constructor(commitResult: Partial<PartialCommitResult>) {
		this.commitUrl = commitResult.html_url;
		this.url = commitResult.url;
		this.author = commitResult.commit.author;
		this.message = commitResult.commit.message;
		this.authorUsername = !!commitResult.author
			? commitResult.author.login
			: 'unknown';
		this.commiterUsername = !!commitResult.committer
			? commitResult.committer.login
			: 'unknown';
		this.sha = commitResult.sha.substring(0, 6);
	}
}
