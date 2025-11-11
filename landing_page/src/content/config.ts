import { defineCollection, z } from 'astro:content';

const professionsCollection = defineCollection({
	type: 'content',
	schema: z.object({
		id: z.string(),
		name: z.string(),
		slug: z.string().optional(), // Optional since Astro auto-generates from filename
		title: z.string(),
		metaDescription: z.string(),
		h1: z.string(),
		painPoints: z.array(z.string()),
		benefits: z.array(z.string()),
		useCases: z.array(z.string()),
		cta: z.string(),
	}),
});

const useCasesCollection = defineCollection({
	type: 'content',
	schema: z.object({
		id: z.string(),
		name: z.string(),
		slug: z.string().optional(), // Optional since Astro auto-generates from filename
		title: z.string(),
		metaDescription: z.string(),
		h1: z.string(),
		problem: z.string(),
		solution: z.string(),
		benefits: z.array(z.string()),
		howItWorks: z.array(z.string()),
		cta: z.string(),
	}),
});

const blogCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		publishDate: z.coerce.date(),
		author: z.string().optional(),
		tags: z.array(z.string()).optional(),
		draft: z.boolean().default(false),
		image: z.string().optional(),
	}),
});

export const collections = {
	professions: professionsCollection,
	'use-cases': useCasesCollection, // Must match directory name exactly
	blog: blogCollection,
};

