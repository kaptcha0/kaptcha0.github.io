<script>
	function generateBlobPath(seed, points = 16, radius = 64, variance = 32) {
		const step = (Math.PI * 2) / points;
		let path = '';

		for (let i = 0; i <= points; i++) {
			const angle = i * step * Math.cos(Math.random() * 2 * Math.PI + seed);
			const r = radius + Math.sin(seed + i) * (Math.random() * variance);
			const x = 100 + r * Math.cos(angle) + Math.random() * variance;
			const y = 100 + r * Math.sin(angle) + Math.random() * variance;
			path += `${i === 0 ? 'M' : 'L'}${x},${y} `;
		}

		return path + 'Z';
	}

	function placeBlobs(count = 6, minDistance = 160, maxGap = 200) {
		const blobs = [];
		let attempts = 0;
		const maxAttempts = 500;

		while (blobs.length < count && attempts < maxAttempts) {
			const size = Math.random() * 64 + 128;
			const r = size / 2;
			const x = Math.random() * (100 - (r / window.innerWidth) * 100);
			const y = Math.random() * (100 - (r / window.innerHeight) * 100);

			const overlaps = blobs.some((b) => {
				const dx = b.x - x;
				const dy = b.y - y;
				const distance = Math.sqrt(dx * dx + dy * dy);
				return distance < minDistance;
			});

			if (!overlaps) {
				const seed = Math.random() * 100;
				blobs.push({
					id: crypto.randomUUID(),
					x,
					y,
					size,
					duration: Math.random() * 4 + 8,
					delay: Math.random() * 2,
					moveX: Math.random() * 32 - 16,
					moveY: Math.random() * 32 - 16,
					d1: generateBlobPath(seed),
					d2: generateBlobPath(seed + 8),
				});
			}

			attempts++;
		}

		return blobs;
	}

	let blobs = $state([]);

	let keyframes = $derived(($blobs) => {
		keyframes = $blobs
			.map(
				(blob, i) => `
        @keyframes move-${i} {
          0% {
            transform: translate(-50%, -50%) translate(0px, 0px);
          }
          100% {
            transform: translate(-50%, -50%) translate(${blob.moveX + Math.random() * blob.moveX}px, ${blob.moveY + Math.random() * blob.moveY}px);
          }
        }
      `
			)
			.join('\n');
	});

	$effect(() => {
		blobs = placeBlobs(16, 16); // Try with 6–8 blobs for coverage
	});
</script>

<div
	class="bg-light-shade dark:bg-dark-shade transition-colors fixed inset-0 -z-10 overflow-hidden pointer-events-none"
>
	{#each blobs as blob, i}
		<svg
			class="absolute animate-[move-blobs-infinite] will-change-transform transition-all text-black dark:text-brand opacity-50 blur-md"
			width={blob.size}
			height={blob.size}
			viewBox="0 0 200 200"
			style="
        top: {blob.y}%;
        left: {blob.x}%;
        transform: translate(-50%, -50%);
        animation-name: move-{i};
        animation-duration: {blob.duration + 2}s;
        animation-delay: {blob.delay}s;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
        animation-direction: alternate;
      "
		>
			<path fill="currentColor" d={blob.d1}>
				<animate
					attributeName="d"
					values="{blob.d1}; {blob.d2}; {blob.d1}"
					dur="{blob.duration}s"
					repeatCount="indefinite"
					begin="{blob.delay}s"
				></animate>
			</path>
		</svg>
	{/each}
</div>

{@html `<style>${keyframes}</style>`}
