#include <stdint.h>

typedef struct{
    uint8_t V[16];
    uint16_t I;
    uint16_t PC;
    uint16_t stack[16];
    uint8_t SP;
    
    uint8_t delay_timer;
    uint8_t sound_timer;

    uint8_t display[64][32];
} chip8;

typedef struct{
    uint8_t data[4096];
} memory;

void chip8_init(chip8 *c);
void memory_init(memory *m);