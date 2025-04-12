<script lang="ts">
	import Icon from '@iconify/svelte';

	let theme = $state('light');
	const { class: classes = '' } = $props();

	// Set the initial theme based on localStorage or default to light
	$effect(() => {
		theme = localStorage.getItem('theme') || 'light';
		document.querySelector('body')?.setAttribute('data-theme', theme);
	});

	const changeTheme = () => {
		const body = document.querySelector('body')!;
		const newTheme = theme === 'dark' ? 'light' : 'dark';
		body.setAttribute('data-theme', newTheme);
		localStorage.setItem('theme', newTheme);
		theme = newTheme;
	};
</script>

<!-- TODO: make this button be a slide transition -->
<div class={classes}>
	<button
		onclick={changeTheme}
		class="hover:text-light-accent dark:hover:text-dark-accent hover:cursor-pointer transition-colors"
	>
		{#if theme === 'dark'}
			<Icon icon="lucide:moon" />
		{:else}
			<Icon icon="lucide:sun" />
		{/if}
	</button>
</div>
