<!-- src/routes/admin/analysis/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    export let data: { admin: any };

    $: if (!$page.data.admin) {
        goto('/admin/login');
    }

    // Add your analysis data and visualization logic here
    let analyticsData = {
        totalDonations: 0,
        totalAmount: 0,
        projectPerformance: [],
        monthlyTrends: []
    };

    onMount(async () => {
        // Fetch analytics data from your API
        try {
            const response = await fetch('/api/admin/analytics');
            if (response.ok) {
                analyticsData = await response.json();
            }
        } catch (error) {
            console.error('Failed to fetch analytics data:', error);
        }
    });
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <nav class="bg-white dark:bg-gray-800 shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex">
                    <div class="flex-shrink-0 flex items-center">
                        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <a
                        href="/admin/dashboard"
                        class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                        Back to Dashboard
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <!-- Summary Cards -->
                <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <!-- Donation Icon -->
                                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                        Total Donations
                                    </dt>
                                    <dd class="flex items-baseline">
                                        <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                                            {analyticsData.totalDonations}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <!-- Amount Icon -->
                                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4M20 12a2 2 0 00-2-2H6a2 2 0 00-2 2m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0V6a2 2 0 00-2-2H6a2 2 0 00-2 2v6" />
                                </svg>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                        Total Amount
                                    </dt>
                                    <dd class="flex items-baseline">
                                        <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                                            ${analyticsData.totalAmount.toLocaleString()}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Project Performance -->
            <div class="mt-8">
                <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Project Performance</h2>
                <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    <!-- Add your project performance visualization here -->
                    <div class="p-6">
                        <p class="text-gray-500 dark:text-gray-400">Project performance visualization will be implemented here</p>
                    </div>
                </div>
            </div>

            <!-- Monthly Trends -->
            <div class="mt-8">
                <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Trends</h2>
                <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    <!-- Add your monthly trends visualization here -->
                    <div class="p-6">
                        <p class="text-gray-500 dark:text-gray-400">Monthly trends visualization will be implemented here</p>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div> 