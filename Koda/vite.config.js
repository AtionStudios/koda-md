import { defineConfig } from 'vite';

export default defineConfig({
  // Utilizar caminhos relativos garante que os arquivos js/css funcionem
  // em qualquer sub-rota do Github Pages sem precisar fixar o nome do repositorio.
  base: './', 
});
