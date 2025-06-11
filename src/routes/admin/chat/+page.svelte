<!-- src/routes/admin/chat/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    export let data: { admin: any };

    $: if (!$page.data.admin) {
        goto('/admin/login');
    }

    let messages: Array<{
        id: string;
        sender: string;
        content: string;
        timestamp: string;
    }> = [];
    let newMessage = '';
    let loading = false;

    onMount(async () => {
        // Fetch chat history
        try {
            const response = await fetch('/api/admin/chat/history');
            if (response.ok) {
                messages = await response.json();
            }
        } catch (error) {
            console.error('Failed to fetch chat history:', error);
        }
    });

    async function sendMessage() {
        if (!newMessage.trim() || loading) return;

        try {
            loading = true;
            const response = await fetch('/api/admin/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: newMessage
                })
            });

            if (response.ok) {
                const message = await response.json();
                messages = [...messages, message];
                newMessage = '';
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <nav class="bg-white dark:bg-gray-800 shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex">
                    <div class="flex-shrink-0 flex items-center">
                        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Admin Chat</h1>
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
            <div class="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                <!-- Chat Messages -->
                <div class="h-[500px] overflow-y-auto p-4 space-y-4">
                    {#each messages as message}
                        <div class="flex flex-col {message.sender === data.admin.username ? 'items-end' : 'items-start'}">
                            <div class="max-w-[70%] bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                                <div class="text-sm font-medium text-gray-900 dark:text-white">
                                    {message.sender}
                                </div>
                                <div class="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                    {message.content}
                                </div>
                                <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(message.timestamp).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>

                <!-- Message Input -->
                <div class="border-t border-gray-200 dark:border-gray-700 p-4">
                    <form on:submit|preventDefault={sendMessage} class="flex space-x-4">
                        <input
                            type="text"
                            bind:value={newMessage}
                            placeholder="Type your message..."
                            class="flex-1 min-w-0 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {#if loading}
                                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                            {:else}
                                Send
                            {/if}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </main>
</div> 