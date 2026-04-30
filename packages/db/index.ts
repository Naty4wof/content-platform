export const ARTICLE_STATUSES = [
	"draft",
	"pending",
	"published",
] as const;

export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export interface Article {
	id: string;
	slug: string;
	title: string;
	summary: string;
	body: string;
	authorId: string;
	status: ArticleStatus;
	tags: string[];
	createdAt: string;
	updatedAt: string;
	publishedAt: string | null;
}

export interface CreateArticleInput {
	title: string;
	summary: string;
	body: string;
	authorId: string;
	tags?: string[];
	slug?: string;
}

export function createDraftArticle(input: CreateArticleInput): Article {
	const now = new Date().toISOString();
	const slug = input.slug ?? toSlug(input.title);

	return {
		id: crypto.randomUUID(),
		slug,
		title: input.title,
		summary: input.summary,
		body: input.body,
		authorId: input.authorId,
		status: "draft",
		tags: input.tags ?? [],
		createdAt: now,
		updatedAt: now,
		publishedAt: null,
	};
}

export function toSlug(title: string): string {
	return title
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

const ARTICLE_TRANSITIONS: Record<ArticleStatus, ArticleStatus[]> = {
	draft: ["pending"],
	pending: ["draft", "published"],
	published: [],
};

export function canTransitionArticle(
	current: ArticleStatus,
	next: ArticleStatus,
): boolean {
	return ARTICLE_TRANSITIONS[current].includes(next);
}

export function transitionArticle(
	article: Article,
	nextStatus: ArticleStatus,
	now = new Date().toISOString(),
): Article {
	if (!canTransitionArticle(article.status, nextStatus)) {
		throw new Error(
			`Invalid article status transition: ${article.status} -> ${nextStatus}`,
		);
	}

	return {
		...article,
		status: nextStatus,
		updatedAt: now,
		publishedAt: nextStatus === "published" ? now : null,
	};
}

export function isPublishedArticle(article: Article): boolean {
	return article.status === "published";
}
