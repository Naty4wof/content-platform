import {
	type Article,
	type ArticleStatus,
	createDraftArticle,
	isPublishedArticle,
	transitionArticle,
} from "@repo/db";

export type { Article, ArticleStatus };

const ARTICLE_SEED: Article[] = buildArticleSeed();

export interface AdminMetrics {
	totalArticles: number;
	draftCount: number;
	pendingCount: number;
	publishedCount: number;
}

export interface EditorMetrics {
	queueCount: number;
	draftCount: number;
	publishedCount: number;
}

export function listArticles(): Article[] {
	return ARTICLE_SEED;
}

export function listPublishedArticles(): Article[] {
	return ARTICLE_SEED.filter(isPublishedArticle);
}

export function listReviewQueue(): Article[] {
	return ARTICLE_SEED.filter((article) => article.status === "pending");
}

export function getAdminMetrics(): AdminMetrics {
	return {
		totalArticles: ARTICLE_SEED.length,
		draftCount: ARTICLE_SEED.filter((article) => article.status === "draft").length,
		pendingCount: ARTICLE_SEED.filter((article) => article.status === "pending")
			.length,
		publishedCount: ARTICLE_SEED.filter((article) => article.status === "published")
			.length,
	};
}

export function getEditorMetrics(): EditorMetrics {
	return {
		queueCount: listReviewQueue().length,
		draftCount: ARTICLE_SEED.filter((article) => article.status === "draft")
			.length,
		publishedCount: ARTICLE_SEED.filter((article) => article.status === "published")
			.length,
	};
}

function buildArticleSeed(): Article[] {
	const draft = createDraftArticle({
		title: "Monorepo content strategy for Q2",
		summary: "How shared packages accelerate publishing teams.",
		body: "Draft content body",
		authorId: "admin_01",
		tags: ["strategy", "platform"],
	});

	const review = transitionArticle(
		createDraftArticle({
			title: "Editorial quality checklist",
			summary: "A checklist to standardize editorial reviews.",
			body: "Editor checklist body",
			authorId: "admin_02",
			tags: ["editorial", "quality"],
		}),
		"pending",
	);

	const published = transitionArticle(
		transitionArticle(
			createDraftArticle({
				title: "Launch notes for the publishing pipeline",
				summary: "A finished article ready for the client portal.",
				body: "Published article body",
				authorId: "admin_03",
				tags: ["launch", "updates"],
			}),
			"pending",
		),
		"published",
		new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
	);

	return [draft, review, published];
}
