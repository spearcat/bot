import type { AppBskyActorDefs, ComAtprotoLabelDefs } from "@atproto/api";
import type {
	Bot,
	BotGetUserLikesOptions,
	BotGetUserListsOptions,
	BotGetUserPostsOptions,
} from "../bot/Bot.js";
import type { List } from "./List.js";
import type { Post } from "./post/Post.js";

/**
 * Data used to construct a Profile class.
 */
export interface ProfileData {
	/** The user's DID. */
	did: string;

	/** The user's handle. */
	handle: string;

	/** The user's display name. */
	displayName?: string | undefined;

	/** The user's profile description. */
	description?: string | undefined;

	/** The user's avatar URL. */
	avatar?: string | undefined;

	/** The user's banner URL. */
	banner?: string | undefined;

	/** The number of followers the user has. */
	followerCount?: number | undefined;

	/** The number of users the user is following. */
	followingCount?: number | undefined;

	/** The number of posts the user has made. */
	postsCount?: number | undefined;

	/** Labels on the user's profile. */
	labels?: Array<ComAtprotoLabelDefs.Label> | undefined;

	/** The time when the user's profile was indexed by the App View. */
	indexedAt?: Date | undefined;

	/** The AT URI of the follow relationship between the bot and the user. */
	followUri?: string | undefined;

	/** The AT URI of the follow relationship between the bot and the user. */
	followedByUri?: string | undefined;

	/** Whether the user is muted by the bot. */
	isMuted?: boolean | undefined;

	/** The AT URI of the block relationship between the bot and the user. */
	blockUri?: string | undefined;

	/** Whether the bot is blocked by the user. */
	isBlockedBy?: boolean | undefined;

	/** Whether the user account is a labeler. */
	isLabeler?: boolean | undefined;

	/** The user's preference for who can initiate a chat conversation. */
	incomingChatPreference?: IncomingChatPreference | undefined;
}

/**
 * A Bluesky user profile.
 */
export class Profile {
	/** The user's DID. */
	did: string;

	/** The user's handle. */
	handle: string;

	/** The user's display name. */
	displayName?: string;

	/** The user's profile description . */
	description?: string;

	/** The user's avatar URL. */
	avatar?: string;

	/** The user's banner URL. */
	banner?: string;

	/** The number of followers the user has. */
	followerCount?: number;

	/** The number of users the user is following. */
	followingCount?: number;

	/** The number of posts the user has made. */
	postsCount?: number;

	/** Labels on the user's profile. */
	labels: Array<ComAtprotoLabelDefs.Label>;

	/** The time when the user's profile was indexed by the App View. */
	indexedAt?: Date;

	/**
	 * The AT URI of the follow relationship between the bot and the user.
	 * Undefined if the bot is not following the user.
	 */
	followUri?: string;

	/**
	 * The AT URI of the follow relationship between the bot and the user.
	 * Undefined if the user is not following the bot.
	 */
	followedByUri?: string;

	/** Whether the user is muted by the bot. */
	isMuted?: boolean;

	/**
	 * The AT URI of the block relationship between the bot and the user.
	 * Undefined if the user is not blocking the bot.
	 */
	blockUri?: string;

	/** Whether the bot is blocked by the user. */
	blockedBy?: boolean;

	/** Whether the user account is a labeler. */
	isLabeler?: boolean;

	/** The user's preference for who can initiate a chat conversation. */
	incomingChatPreference?: IncomingChatPreference;

	/** Whether the bot is following the user. */
	get isFollowing() {
		return this.followUri != undefined;
	}

	/** Whether the user is following the bot */
	get followedBy() {
		return this.followedByUri != undefined;
	}

	/** Whether the bot is blocking the user */
	get isBlocking() {
		return this.blockUri != undefined;
	}

	/** Whether the user is being followed and is following the bot */
	get isMutual() {
		return this.isFollowing && this.followedBy;
	}

	/**
	 * @param data Profile data.
	 * @param bot The active Bot instance.
	 */
	constructor(
		// dprint-ignore
		{ did, handle, displayName, description, avatar, banner, followerCount, followingCount, postsCount, labels, indexedAt, followUri, followedByUri, isMuted, blockUri, isBlockedBy, isLabeler, incomingChatPreference }: ProfileData,
		protected bot: Bot,
	) {
		this.did = did;
		this.handle = handle;
		if (displayName) this.displayName = displayName;
		if (description) this.description = description;
		if (avatar) this.avatar = avatar;
		if (banner) this.banner = banner;
		if (followerCount != undefined) this.followerCount = followerCount;
		if (followingCount != undefined) this.followingCount = followingCount;
		if (postsCount != undefined) this.postsCount = postsCount;
		this.labels = labels ?? [];
		if (indexedAt) this.indexedAt = indexedAt;
		if (followUri != undefined) this.followUri = followUri;
		if (followedByUri != undefined) this.followedByUri = followedByUri;
		if (isMuted != undefined) this.isMuted = isMuted;
		if (blockUri != undefined) this.blockUri = blockUri;
		if (isBlockedBy != undefined) this.blockedBy = isBlockedBy;
		if (isLabeler != undefined) this.isLabeler = isLabeler;
		if (incomingChatPreference) this.incomingChatPreference = incomingChatPreference;
	}

	/**
	 * Follow the user.
	 * @returns The AT URI of the follow relationship.
	 */
	async follow(): Promise<string> {
		return this.followUri = (await this.bot.follow(this.did)).uri;
	}

	/**
	 * Unfollow the user.
	 */
	async unfollow(): Promise<void> {
		return this.bot.unfollow(this.did);
	}

	/**
	 * Mute the user.
	 */
	async mute(): Promise<void> {
		return this.bot.mute(this.did);
	}

	/**
	 * Unmute the user.
	 */
	async unmute(): Promise<void> {
		return this.bot.unmute(this.did);
	}

	/**
	 * Block the user.
	 * @returns The AT URI of the block relationship.
	 */
	async block(): Promise<string> {
		return this.blockUri = (await this.bot.block(this.did)).uri;
	}

	/**
	 * Unblock the user.
	 */
	async unblock(): Promise<void> {
		return this.bot.unblock(this.did);
	}

	/**
	 * Fetch the user's posts (up to 100 at a time, default 100).
	 * @param options Optional configuration.
	 * @returns The user's posts and a cursor for pagination.
	 */
	async getPosts(
		options: BotGetUserPostsOptions = {},
	): Promise<{ cursor: string | undefined; posts: Array<Post> }> {
		return this.bot.getUserPosts(this.did, { limit: 100, ...options });
	}

	/**
	 * Fetch the user's liked posts (up to 100 at a time, default 100).
	 * @param options Optional configuration.
	 * @returns The user's liked posts and a cursor for pagination.
	 */
	async getLikedPosts(
		options: BotGetUserLikesOptions = {},
	): Promise<{ cursor: string | undefined; posts: Array<Post> }> {
		return this.bot.getUserLikes(this.did, { limit: 100, ...options });
	}

	/**
	 * Fetch the user's lists (up to 100 at a time, default 100).
	 * @param options Optional configuration.
	 * @returns The user's lists and a cursor for pagination.
	 */
	async getLists(
		options: BotGetUserListsOptions = {},
	): Promise<{ cursor: string | undefined; lists: Array<List> }> {
		return this.bot.getUserLists(this.did, { limit: 100, ...options });
	}

	/**
	 * Fetch the labeler associated with the user, if there is any.
	 * Check the {@link isLabeler} property before calling this method!
	 * @returns The labeler associated with the user.
	 */
	async getLabeler() {
		return this.bot.getLabeler(this.did);
	}

	/**
	 * Apply labels to the user's account. Note that this will label the user's profile and all posts they create!
	 * If you only want to label their profile, use the {@link labelProfile} method.
	 * @param labels The labels to apply.
	 * @param comment An optional comment to attach to the label.
	 */
	async labelAccount(labels: Array<string>, comment?: string) {
		return this.bot.label({ reference: { did: this.did }, labels, comment });
	}

	/**
	 * Negate labels previously applied to the user's account.
	 * @param labels The labels to negate.
	 * @param comment An optional comment to attach.
	 */
	async negateAccountLabels(labels: Array<string>, comment?: string) {
		return this.bot.negateLabels({ reference: { did: this.did }, labels, comment });
	}

	/**
	 * Apply labels to the user's profile only. If you wish to apply an account-level label that will also appear on all
	 * posts the user creates, use the {@link labelAccount} method. Note that you need a running Ozone instance to publish labels!
	 * @param labels The labels to apply.
	 * @param comment An optional comment to attach to the label.
	 */
	async labelProfile(labels: Array<string>, comment?: string) {
		const profileRecordResponse = await this.bot.api.com.atproto.repo.getRecord({
			repo: this.did,
			collection: "app.bsky.actor.profile",
			rkey: "self",
		}).catch(() => null);

		if (!profileRecordResponse?.success || !profileRecordResponse.data.cid) {
			throw new Error(`Could not find profile record for user ${this.did}.`);
		}

		const { uri, cid } = profileRecordResponse.data;

		return this.bot.label({ reference: { uri, cid }, labels, comment });
	}

	/**
	 * Negate labels previously applied to the user's profile.
	 * @param labels The labels to negate.
	 * @param comment An optional comment to attach.
	 */
	async negateProfileLabels(labels: Array<string>, comment?: string) {
		const profileRecordResponse = await this.bot.api.com.atproto.repo.getRecord({
			repo: this.did,
			collection: "app.bsky.actor.profile",
			rkey: "self",
		}).catch(() => null);

		if (!profileRecordResponse?.success || !profileRecordResponse.data.cid) {
			throw new Error(`Could not find profile record for user ${this.did}.`);
		}

		const { uri, cid } = profileRecordResponse.data;

		return this.bot.negateLabels({ reference: { uri, cid }, labels, comment });
	}

	/**
	 * Constructs an instance from a ProfileView.
	 * @param view The ProfileView to construct from.
	 * @param bot The active Bot instance.
	 */
	static fromView(
		view: AppBskyActorDefs.ProfileView | AppBskyActorDefs.ProfileViewBasic,
		bot: Bot,
	): Profile {
		return new Profile({
			...view,
			labels: view.labels ?? [],
			indexedAt: view.indexedAt && typeof view.indexedAt === "string"
				? new Date(view.indexedAt)
				: undefined,
			followerCount: typeof view.followersCount === "number"
				? view.followersCount
				: undefined,
			followingCount: typeof view.followsCount === "number" ? view.followsCount : undefined,
			postsCount: typeof view.postsCount === "number" ? view.postsCount : undefined,
			followUri: view.viewer?.following,
			followedByUri: view.viewer?.followedBy,
			isMuted: view.viewer?.muted,
			blockUri: view.viewer?.blocking,
			isBlockedBy: view.viewer?.blockedBy,
			isLabeler: view.associated?.labeler,
			incomingChatPreference: view.associated?.chat?.allowIncoming,
		}, bot);
	}
}

/**
 * A user's preference for who can initiate a chat conversation.
 * @enum
 */
export const IncomingChatPreference = {
	/** Receive messages from everyone. */
	All: "all",

	/** Receive messages from nobody. */
	None: "none",

	/** Receive messages from users the user follows. */
	Following: "following",
};
export type IncomingChatPreference =
	typeof IncomingChatPreference[keyof typeof IncomingChatPreference];
