<script lang="ts">
	import '../app.css';
	import Toast from '$lib/components/Toast.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth';

	let theme = 'light';
	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	$: if (mounted) {
		if (typeof window !== 'undefined') {
			if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
				document.documentElement.classList.add('dark');
				theme = 'dark';
			} else {
				document.documentElement.classList.remove('dark');
				theme = 'light';
			}
		}
	}

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		localStorage.theme = theme;
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	async function handleLogout() {
		try {
			const response = await fetch('/api/admin/logout', {
				method: 'POST',
				credentials: 'include'
			});
			if (response.ok) {
				auth.logout();
				window.location.href = '/';
			}
		} catch (error) {
			console.error('Logout failed:', error);
		}
	}
</script>

{#if mounted}
<div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
	<nav class="bg-white dark:bg-gray-800 shadow fixed w-full top-0 z-40">
		<div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
			<div class="flex justify-between h-14 sm:h-16">
				<div class="flex">
					<a href="/" class="flex items-center">
						<span class="text-xl font-bold text-gray-900 dark:text-white">Donation Platform</span>
					</a>
				</div>
				<div class="flex items-center space-x-4">
					{#if $auth.user}
						<a 
							href="/admin/dashboard" 
							class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
						>
							Dashboard
						</a>
						<button 
							on:click={handleLogout}
							class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
						>
							Logout
						</button>
					{:else}
						<a 
							href="/admin/login" 
							class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
						>
							Login
						</a>
						<a 
							href="/admin/signup" 
							class="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
						>
							Sign Up
						</a>
					{/if}
					<button
						on:click={toggleTheme}
						type="button"
						class="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none"
					>
						{#if theme === 'light'}
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
							</svg>
						{:else}
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
							</svg>
						{/if}
					</button>
				</div>
			</div>
		</div>
	</nav>

	<main class="flex-grow pt-14 sm:pt-16">
		<slot />
	</main>

	<Toast />
	<Footer />
</div>
{:else}
<div class="min-h-screen bg-gray-50 dark:bg-gray-900"></div>
{/if}

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
</style> 