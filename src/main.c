#include <stdio.h>
#include <stdbool.h>
#include <time.h>
#include <SDL2/SDL.h>
#include "../include/chip8.h"

#define PIXEL_SIZE 10
#define MARGIN 30 // Borda preta ao redor da área de jogo, em pixels
#define GAME_W (64 * PIXEL_SIZE)
#define GAME_H (32 * PIXEL_SIZE)

void load_rom(memory *m, const char *path) {
    FILE *file = fopen(path, "rb");
    if (file) {
        // Lê os dados a partir de 0x200
        size_t bytes_read = fread(&m->data[0x200], 1, 4096 - 0x200, file);
        (void)bytes_read;  // Suprime warning se não usado
        fclose(file);
    } else {
        printf("Erro ao abrir a ROM!\n");
    }
}

int main(int argc, char* argv[]) {
    (void)argc;   // Suprime warnings de parâmetros não utilizados
    (void)argv;

    // Seeds the RNG used by opcode CXNN (rand() is deterministic otherwise)
    srand((unsigned int)time(NULL));

    // 1. Inicialize SDL
    if (SDL_Init(SDL_INIT_VIDEO | SDL_INIT_EVENTS) != 0) {
        SDL_Log("Erro ao inicializar SDL: %s", SDL_GetError());
        return -1;
    }

    // 2. Creates a window 640 x 320
    SDL_Window* window = SDL_CreateWindow("Meu Emulador CHIP-8",
        SDL_WINDOWPOS_CENTERED_DISPLAY(0), SDL_WINDOWPOS_CENTERED_DISPLAY(0),
        GAME_W + 2 * MARGIN, GAME_H + 2 * MARGIN, SDL_WINDOW_SHOWN);
    if (!window) {
        SDL_Log("Erro ao criar janela: %s", SDL_GetError());
        SDL_Quit();
        return -1;
    }

    // 3. Creates the Renderer
    SDL_Renderer* renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);

    // 4. Inicialize CHIP-8 structure
    chip8 c;
    memory m;
    chip8_init(&c, &m);

    // Call the game ROM
    load_rom(&m, "Pong.ch8");

    bool quit = false;
    SDL_Event e;

    uint64_t last_timer_time = SDL_GetTicks();

    // Main Loop
    while (!quit) {
        while (SDL_PollEvent(&e)) {
            if (e.type == SDL_QUIT) quit = true;

            if (e.type == SDL_KEYDOWN || e.type == SDL_KEYUP) {
                uint8_t state = (e.type == SDL_KEYDOWN) ? 1 : 0;
                switch (e.key.keysym.sym) {
                    case SDLK_1: c.key[0x1] = state; break;
                    case SDLK_2: c.key[0x2] = state; break;
                    case SDLK_3: c.key[0x3] = state; break;
                    case SDLK_4: c.key[0xC] = state; break;
                    case SDLK_q: c.key[0x4] = state; break;
                    case SDLK_w: c.key[0x5] = state; break;
                    case SDLK_e: c.key[0x6] = state; break;
                    case SDLK_r: c.key[0xD] = state; break;
                    case SDLK_a: c.key[0x7] = state; break;
                    case SDLK_s: c.key[0x8] = state; break;
                    case SDLK_d: c.key[0x9] = state; break;
                    case SDLK_f: c.key[0xE] = state; break;
                    case SDLK_z: c.key[0xA] = state; break;
                    case SDLK_x: c.key[0x0] = state; break;
                    case SDLK_c: c.key[0xB] = state; break;
                    case SDLK_v: c.key[0xF] = state; break;
                }
            }
        }

        uint64_t current_time = SDL_GetTicks();
        if (current_time - last_timer_time >= 16) { // Aproximadamente 60Hz
            
            // 1. Executa a CPU (8 a 10 ciclos por frame é o ideal para Pong)
            for(int i = 0; i < 10; i++) {
                chip_cycle(&c, &m);
            }

            // 2. Atualiza Timers
            if (c.delay_timer > 0) c.delay_timer--;
            if (c.sound_timer > 0) c.sound_timer--;

            // 3. Desenha APENAS aqui dentro para evitar flickering excessivo
            SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);
            SDL_RenderClear(renderer);
            SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);

            for (int y = 0; y < 32; y++) {
                for (int x = 0; x < 64; x++) {
                    if (c.display[x][y]) {
                        SDL_Rect rect = {MARGIN + x * PIXEL_SIZE, MARGIN + y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE};
                        SDL_RenderFillRect(renderer, &rect);
                    }
                }
            }
            SDL_RenderPresent(renderer);

            last_timer_time = current_time;
        }

        SDL_Delay(1); // Evita que o programa use 100% de um núcleo da CPU à toa
    }

    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}