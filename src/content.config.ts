import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		author: z.string().optional(),
		description: z.string(),
		published: z.boolean(),
		date: z.date(),
		tags: z.array(z.string()),
		image: z.string().optional(),
	}),
});

export const collections = { blog: blogCollection };
