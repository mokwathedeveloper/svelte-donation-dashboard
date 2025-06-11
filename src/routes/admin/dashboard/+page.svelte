<!-- src/routes/admin/dashboard/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import type { SerializedProject } from '$lib/server/models/project';
    import { showSuccessToast, showErrorToast } from '$lib/utils/toast';
    import { page } from '$app/stores';

    export let data: { projects: SerializedProject[], donations: any[], admin: any };
    let projects = data.projects;
    let donations = data.donations;
    let loading = false;
    let activeTab: 'projects' | 'donations' = 'projects';
    let editingProject: SerializedProject | null = null;
    let newProject = {
        title: '',
        description: '',
        goal: 0,
        image: ''
    };
    let showNewProjectForm = false;
    let showPasswordModal = false;
    let passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };

    $: if (!$page.data.admin) {
        goto('/admin/login');
    }

    async function handleCreateProject() {
        if (loading) return;
        try {
            loading = true;
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProject)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create project');
            }

            const createdProject = await response.json();
            projects = [createdProject, ...projects];
            showNewProjectForm = false;
            newProject = { title: '', description: '', goal: 0, image: '' };
            showSuccessToast('Project created successfully');
        } catch (error) {
            console.error('Create project error:', error);
            showErrorToast(error instanceof Error ? error.message : 'Failed to create project');
        } finally {
            loading = false;
        }
    }

    async function handleUpdateProject() {
        if (!editingProject || loading) return;

        try {
            loading = true;
            const response = await fetch(`/api/projects/${editingProject._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingProject)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update project');
            }

            const updatedProject = await response.json();
            projects = projects.map(p => p._id === updatedProject._id ? updatedProject : p);
            editingProject = null;
            showSuccessToast('Project updated successfully');
        } catch (error) {
            console.error('Update project error:', error);
            showErrorToast(error instanceof Error ? error.message : 'Failed to update project');
        } finally {
            loading = false;
        }
    }

    async function handleDeleteProject(id: string) {
        if (!confirm('Are you sure you want to delete this project?') || loading) return;

        try {
            loading = true;
            const response = await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete project');
            }

            projects = projects.filter(p => p._id !== id);
            showSuccessToast('Project deleted successfully');
        } catch (error) {
            console.error('Delete project error:', error);
            showErrorToast(error instanceof Error ? error.message : 'Failed to delete project');
        } finally {
            loading = false;
        }
    }

    async function handleLogout() {
        if (loading) return;
        try {
            loading = true;
            await fetch('/api/admin/logout', { method: 'POST' });
            goto('/admin/login');
        } catch (error) {
            showErrorToast('Failed to logout');
        } finally {
            loading = false;
        }
    }

    async function handlePasswordChange() {
        if (loading) return;
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showErrorToast('New passwords do not match');
            return;
        }

        try {
            loading = true;
            const response = await fetch('/api/admin/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to change password');
            }

            showSuccessToast('Password changed successfully');
            showPasswordModal = false;
            passwordData = {
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
        } catch (error) {
            showErrorToast(error instanceof Error ? error.message : 'Failed to change password');
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
                        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <button
                        on:click={() => showPasswordModal = true}
                        class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                        Change Password
                    </button>
                    <button
                        on:click={handleLogout}
                        class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Tab Navigation -->
        <div class="px-4 sm:px-0">
            <div class="border-b border-gray-200 dark:border-gray-700">
                <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        class={`${
                            activeTab === 'projects'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        on:click={() => activeTab = 'projects'}
                    >
                        Projects
                    </button>
                    <button
                        class={`${
                            activeTab === 'donations'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        on:click={() => activeTab = 'donations'}
                    >
                        Donations
                    </button>
                </nav>
            </div>
        </div>

        <!-- Project Management Section -->
        {#if activeTab === 'projects'}
        <div class="px-4 py-6 sm:px-0">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Projects</h2>
                <button
                    on:click={() => showNewProjectForm = true}
                    class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                    New Project
                </button>
            </div>

            {#if loading}
                <div class="text-center py-12">
                    <div class="spinner"></div>
                </div>
            {:else if projects.length === 0}
                <div class="text-center py-12 text-gray-500 dark:text-gray-400">
                    No projects found
                </div>
            {:else}
                <div class="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-3">
                    {#each projects as project}
                        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                            {#if project.image}
                                <img src={project.image} alt={project.title} class="w-full h-48 object-cover" />
                            {/if}
                            <div class="p-4">
                                <h3 class="text-lg font-medium text-gray-900 dark:text-white">{project.title}</h3>
                                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
                                <div class="mt-4">
                                    <p class="text-sm text-gray-600 dark:text-gray-300">
                                        Goal: KES {project.goal.toLocaleString()}
                                    </p>
                                    <p class="text-sm text-gray-600 dark:text-gray-300">
                                        Raised: KES {project.raised.toLocaleString()}
                                    </p>
                                </div>
                                <div class="mt-4 flex justify-end space-x-2">
                                    <button
                                        on:click={() => editingProject = {...project}}
                                        class="px-3 py-1 text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        on:click={() => handleDeleteProject(project._id)}
                                        class="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
        {/if}

        <!-- Donations Section -->
        {#if activeTab === 'donations'}
        <div class="px-4 py-6 sm:px-0">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Donations</h2>
            </div>

            {#if donations.length === 0}
                <div class="text-center py-12 text-gray-500 dark:text-gray-400">
                    No donations found
                </div>
            {:else}
                <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction ID</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {#each donations as donation}
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {donation.projectId.title}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            KES {donation.amount.toLocaleString()}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {donation.phone}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                                            <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${donation.status === 'completed' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                    : donation.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                {donation.status}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {donation.transactionId || '-'}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {new Date(donation.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            {/if}
        </div>
        {/if}
    </main>

    <!-- New Project Modal -->
    {#if showNewProjectForm}
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">New Project</h3>
                <form on:submit|preventDefault={handleCreateProject} class="space-y-4">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                        <input
                            type="text"
                            id="title"
                            bind:value={newProject.title}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                    </div>
                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea
                            id="description"
                            bind:value={newProject.description}
                            rows="3"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label for="goal" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Goal (KES)</label>
                        <input
                            type="number"
                            id="goal"
                            bind:value={newProject.goal}
                            min="0"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                    </div>
                    <div>
                        <label for="image" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                        <input
                            type="url"
                            id="image"
                            bind:value={newProject.image}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button
                            type="button"
                            on:click={() => showNewProjectForm = false}
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    {/if}

    <!-- Password Change Modal -->
    {#if showPasswordModal}
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
                <form on:submit|preventDefault={handlePasswordChange} class="space-y-4">
                    <div>
                        <label for="current-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                        <input
                            type="password"
                            id="current-password"
                            bind:value={passwordData.currentPassword}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                    </div>
                    <div>
                        <label for="new-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                        <input
                            type="password"
                            id="new-password"
                            bind:value={passwordData.newPassword}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            required
                            minlength="6"
                        />
                    </div>
                    <div>
                        <label for="confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirm-password"
                            bind:value={passwordData.confirmPassword}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            required
                            minlength="6"
                        />
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button
                            type="button"
                            on:click={() => showPasswordModal = false}
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                        >
                            Change Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    {/if}

    <!-- Edit Project Modal -->
    {#if editingProject}
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Project</h3>
                <form on:submit|preventDefault={handleUpdateProject} class="space-y-4">
                    <div>
                        <label for="edit-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                        <input
                            type="text"
                            id="edit-title"
                            bind:value={editingProject.title}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                    </div>
                    <div>
                        <label for="edit-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea
                            id="edit-description"
                            bind:value={editingProject.description}
                            rows="3"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label for="edit-goal" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Goal (KES)</label>
                        <input
                            type="number"
                            id="edit-goal"
                            bind:value={editingProject.goal}
                            min="0"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                    </div>
                    <div>
                        <label for="edit-image" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                        <input
                            type="url"
                            id="edit-image"
                            bind:value={editingProject.image}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button
                            type="button"
                            on:click={() => editingProject = null}
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                        >
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    {/if}
</div>

<style>
    .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border-left-color: #0ea5e9;
        animation: spin 1s linear infinite;
        margin: 0 auto;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style> 