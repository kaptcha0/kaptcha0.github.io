import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		author: z.string().optional(),
		subtitle: z.string().optional(),
		description: z.string(),
		published: z.boolean(),
		date: z.date().transform((date) => {
	    // Convert to YYYY-MM-DD string
	    const iso = date.toISOString().split("T")[0]; // "2025-07-11"
	    const [year, month, day] = iso.split("-").map(Number);

	    // Reconstruct Date at local midnight
	    return new Date(year, month - 1, day);
	  }),
		tags: z.array(z.string()),
	}),
});

export const collections = { blog: blogCollection };
