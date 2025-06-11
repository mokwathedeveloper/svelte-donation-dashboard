<script lang="ts">
  import { fade } from 'svelte/transition';
  import { toastStore } from '$lib/stores/toast';
  import type { Toast } from '$lib/stores/toast';

  $: toasts = $toastStore;

  function remove(id: string) {
    toastStore.remove(id);
  }
</script>

<div class="toast-container">
  {#each toasts as toast (toast.id)}
    <div
      class="toast {toast.type}"
      transition:fade={{ duration: 200 }}
      role="alert"
    >
      <span class="message">{toast.message}</span>
      <button class="close" on:click={() => remove(toast.id)} aria-label="Close toast">
        ×
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 100%;
    width: 350px;
  }

  .toast {
    padding: 1rem;
    border-radius: 0.5rem;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    animation: slide-in 0.2s ease-out;
  }

  .success {
    background-color: #48bb78;
  }

  .error {
    background-color: #f56565;
  }

  .info {
    background-color: #4299e1;
  }

  .message {
    flex: 1;
    font-size: 0.875rem;
  }

  .close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1.25rem;
    padding: 0;
    opacity: 0.8;
    transition: opacity 0.2s;
  }

  .close:hover {
    opacity: 1;
  }

  @keyframes slide-in {
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