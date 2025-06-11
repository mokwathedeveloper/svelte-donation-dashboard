<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import Toast from '$lib/components/Toast.svelte';

	let theme = 'light';
	let mounted = false;

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		if (browser) {
			localStorage.setItem('theme', theme);
			updateThemeClass();
		}
	}

	function updateThemeClass() {
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	onMount(() => {
		if (browser) {
			const savedTheme = localStorage.getItem('theme');
			if (savedTheme) {
				theme = savedTheme;
			} else {
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				theme = prefersDark ? 'dark' : 'light';
				localStorage.setItem('theme', theme);
			}
			updateThemeClass();
			mounted = true;
		}
	});
</script>

{#if mounted}
<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
	<nav class="bg-white dark:bg-gray-800 shadow fixed w-full top-0 z-40">
		<div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
			<div class="flex justify-between h-14 sm:h-16">
				<div class="flex">
					<div class="flex-shrink-0 flex items-center">
						<a href="/" class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
							Donation Platform
						</a>
					</div>
				</div>
				<div class="flex items-center">
					<button
						on:click={toggleTheme}
						class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-sky-500 transition-colors"
						aria-label="Toggle theme"
					>
						{#if theme === 'light'}
							<svg class="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
							</svg>
						{:else}
							<svg class="w-5 h-5 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"></path>
							</svg>
						{/if}
					</button>
				</div>
			</div>
		</div>
	</nav>

	<main class="flex-1 pt-14 sm:pt-16">
		<slot></slot>
	</main>

	<Toast />
</div>
{:else}
<div class="min-h-screen bg-gray-50">
	<main class="flex-1">
		<slot></slot>
	</main>
</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell,
			'Helvetica Neue', sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(.toast) {
		max-width: 24rem;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style> 