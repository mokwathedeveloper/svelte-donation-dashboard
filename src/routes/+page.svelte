<script lang="ts">
    import type { SerializedProject } from '$lib/server/models/project';
    import DonationModal from '$lib/components/DonationModal.svelte';
    
    export let data: { projects: SerializedProject[] };
    
    let showDonationModal = false;
    let selectedProject: SerializedProject | null = null;
    
    function handleDonateClick(project: SerializedProject) {
        selectedProject = project;
        showDonationModal = true;
    }
    
    function handleModalClose() {
        showDonationModal = false;
        selectedProject = null;
    }
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
                Donation Dashboard
            </h1>
            <p class="mt-3 text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
                Support meaningful projects and make a difference
            </p>
        </div>

        <div class="mt-12 grid gap-5 max-w-lg mx-auto sm:grid-cols-2 lg:grid-cols-3 lg:max-w-none">
            {#if data?.projects?.length > 0}
                {#each data.projects as project (project._id)}
                    <div class="flex flex-col rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-102 hover:shadow-xl">
                        <div class="flex-shrink-0">
                            <img 
                                class="h-48 w-full object-cover" 
                                src={project.image || 'https://via.placeholder.com/400x200'} 
                                alt={project.title}
                                loading="lazy"
                            />
                        </div>
                        <div class="flex-1 bg-white dark:bg-gray-800 p-6 flex flex-col justify-between">
                            <div class="flex-1">
                                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                                    {project.title}
                                </h3>
                                <p class="mt-3 text-base text-gray-500 dark:text-gray-400">
                                    {project.description}
                                </p>
                            </div>
                            <div class="mt-6">
                                <div class="relative pt-1">
                                    <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                                        <div 
                                            class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500" 
                                            style="width: {Math.min((project.raised / project.goal * 100), 100)}%"
                                        >
                                        </div>
                                    </div>
                                </div>
                                <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>KES {project.raised.toLocaleString()}</span>
                                    <span>Goal: KES {project.goal.toLocaleString()}</span>
                                </div>
                                <button 
                                    class="mt-4 w-full bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                                    on:click={() => handleDonateClick(project)}
                                >
                                    Donate Now
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            {:else}
                <div class="col-span-full text-center text-gray-500 dark:text-gray-400">
                    No projects available at the moment.
                </div>
            {/if}
        </div>
    </div>
</div>

{#if showDonationModal && selectedProject}
    <DonationModal 
        project={selectedProject} 
        show={showDonationModal} 
        on:close={handleModalClose}
    />
{/if}

<style>
    @keyframes scale {
        0% {
            transform: scale(1);
        }
        100% {
            transform: scale(1.02);
        }
    }

    :global(.hover\:scale-102:hover) {
        transform: scale(1.02);
        transition: transform 0.2s ease-in-out;
    }
</style>
