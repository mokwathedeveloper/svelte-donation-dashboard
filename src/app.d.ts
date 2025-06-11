/// <reference types="@sveltejs/kit" />

declare global {
  namespace App {
    interface Locals {
      authenticated: boolean;
      admin?: {
        id: string;
        username: string;
        superAdmin: boolean;
      };
    }
  }
}

export {}; 