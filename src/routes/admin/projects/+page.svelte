<script>
  import { onMount } from 'svelte';
  
  let projects = [];
  let isLoading = true;
  let error = '';
  let showCreateForm = false;
  
  // Create project form
  let newProject = {
    title: '',
    description: '',
    goal: '',
    image: ''
  };
  let createLoading = false;
  let createError = '';
  let createSuccess = '';
  
  onMount(async () => {
    await loadProjects();
  });
  
  async function loadProjects() {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        projects = data.projects;
      } else {
        error = 'Failed to load projects';
      }
    } catch (err) {
      error = 'Network error loading projects';
      console.error('Error loading projects:', err);
    } finally {
      isLoading = false;
    }
  }
  
  async function createProject() {
    if (!newProject.title || !newProject.description || !newProject.goal) {
      createError = 'Title, description, and goal are required';
      return;
    }
    
    if (parseFloat(newProject.goal) <= 0) {
      createError = 'Goal must be greater than 0';
      return;
    }
    
    createLoading = true;
    createError = '';
    createSuccess = '';
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newProject.title,
          description: newProject.description,
          goal: parseFloat(newProject.goal),
          image: newProject.image
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        createSuccess = 'Project created successfully!';
        // Reset form
        newProject = { title: '', description: '', goal: '', image: '' };
        showCreateForm = false;
        await loadProjects();
      } else {
        createError = result.error || 'Failed to create project';
      }
    } catch (err) {
      createError = 'Network error creating project';
      console.error('Error creating project:', err);
    } finally {
      createLoading = false;
    }
  }
  
  async function updateProjectStatus(projectId, newStatus) {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        await loadProjects();
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to update project status');
      }
    } catch (err) {
      alert('Network error updating project');
      console.error('Error updating project:', err);
    }
  }
  
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  }
  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function getProgressPercentage(raised, goal) {
    return Math.min((raised / goal) * 100, 100);
  }
</script>

<svelte:head>
  <title>Manage Projects - DonationHub</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8 flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Manage Projects</h1>
      <p class="text-gray-600 dark:text-gray-300 mt-2">
        Create and manage donation projects for the platform
      </p>
    </div>
    
    <button
      on:click={() => showCreateForm = !showCreateForm}
      class="btn btn-primary"
    >
      {showCreateForm ? 'Cancel' : 'Create New Project'}
    </button>
  </div>
  
  {#if createSuccess}
    <div class="mb-6 p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
      <p class="text-success-700 dark:text-success-300 text-sm">{createSuccess}</p>
    </div>
  {/if}
  
  {#if error}
    <div class="card p-6 text-center mb-8">
      <p class="text-danger-600 dark:text-danger-400">{error}</p>
      <button on:click={loadProjects} class="btn btn-primary mt-4">
        Retry
      </button>
    </div>
  {:else}
    <!-- Create Project Form -->
    {#if showCreateForm}
      <div class="card p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create New Project</h2>
        
        {#if createError}
          <div class="mb-4 p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
            <p class="text-danger-700 dark:text-danger-300 text-sm">{createError}</p>
          </div>
        {/if}
        
        <form on:submit|preventDefault={createProject} class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                bind:value={newProject.title}
                placeholder="Enter project title"
                class="input"
                required
                disabled={createLoading}
              />
            </div>
            
            <div>
              <label for="goal" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Funding Goal (KES) *
              </label>
              <input
                type="number"
                id="goal"
                bind:value={newProject.goal}
                placeholder="500000"
                min="1"
                step="1"
                class="input"
                required
                disabled={createLoading}
              />
            </div>
          </div>
          
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Description *
            </label>
            <textarea
              id="description"
              bind:value={newProject.description}
              placeholder="Describe the project, its goals, and how donations will be used..."
              rows="4"
              class="input"
              required
              disabled={createLoading}
            ></textarea>
          </div>
          
          <div>
            <label for="image" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Image URL (Optional)
            </label>
            <input
              type="url"
              id="image"
              bind:value={newProject.image}
              placeholder="https://example.com/image.jpg"
              class="input"
              disabled={createLoading}
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Recommended size: 800x600px. Use services like Unsplash for free images.
            </p>
          </div>
          
          <div class="flex gap-3">
            <button
              type="submit"
              class="btn btn-primary"
              disabled={createLoading}
            >
              {#if createLoading}
                Creating...
              {:else}
                Create Project
              {/if}
            </button>
            
            <button
              type="button"
              on:click={() => showCreateForm = false}
              class="btn btn-secondary"
              disabled={createLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    {/if}
    
    <!-- Projects List -->
    {#if isLoading}
      <div class="flex items-center justify-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    {:else if projects.length > 0}
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {#each projects as project}
          <div class="card p-6">
            {#if project.image}
              <div class="mb-4 rounded-lg overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  class="w-full h-48 object-cover"
                />
              </div>
            {/if}
            
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {project.title}
              </h3>
              <p class="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                {project.description}
              </p>
            </div>
            
            <div class="mb-4">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress
                </span>
                <span class="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {getProgressPercentage(project.raised, project.goal).toFixed(1)}%
                </span>
              </div>
              
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  style="width: {getProgressPercentage(project.raised, project.goal)}%"
                ></div>
              </div>
              
              <div class="flex justify-between items-center mt-2 text-sm">
                <span class="text-gray-600 dark:text-gray-400">
                  Raised: {formatCurrency(project.raised)}
                </span>
                <span class="text-gray-600 dark:text-gray-400">
                  Goal: {formatCurrency(project.goal)}
                </span>
              </div>
            </div>
            
            <div class="mb-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      class:bg-success-100={project.status === 'active'}
                      class:text-success-800={project.status === 'active'}
                      class:dark:bg-success-900={project.status === 'active'}
                      class:dark:text-success-200={project.status === 'active'}
                      class:bg-blue-100={project.status === 'completed'}
                      class:text-blue-800={project.status === 'completed'}
                      class:dark:bg-blue-900={project.status === 'completed'}
                      class:dark:text-blue-200={project.status === 'completed'}
                      class:bg-gray-100={project.status === 'paused'}
                      class:text-gray-800={project.status === 'paused'}
                      class:dark:bg-gray-700={project.status === 'paused'}
                      class:dark:text-gray-300={project.status === 'paused'}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
              
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Created: {formatDate(project.createdAt)}
              </div>
            </div>
            
            <div class="flex gap-2">
              {#if project.status === 'active'}
                <button
                  on:click={() => updateProjectStatus(project._id, 'paused')}
                  class="btn btn-secondary text-xs flex-1"
                >
                  Pause
                </button>
                <button
                  on:click={() => updateProjectStatus(project._id, 'completed')}
                  class="btn btn-success text-xs flex-1"
                >
                  Complete
                </button>
              {:else if project.status === 'paused'}
                <button
                  on:click={() => updateProjectStatus(project._id, 'active')}
                  class="btn btn-primary text-xs flex-1"
                >
                  Activate
                </button>
                <button
                  on:click={() => updateProjectStatus(project._id, 'completed')}
                  class="btn btn-success text-xs flex-1"
                >
                  Complete
                </button>
              {:else}
                <button
                  on:click={() => updateProjectStatus(project._id, 'active')}
                  class="btn btn-primary text-xs flex-1"
                >
                  Reactivate
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="card p-6 text-center">
        <div class="w-24 h-24 mx-auto mb-6 text-gray-400 dark:text-gray-600">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">
          No Projects Yet
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          Create your first donation project to get started.
        </p>
        <button
          on:click={() => showCreateForm = true}
          class="btn btn-primary"
        >
          Create First Project
        </button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
