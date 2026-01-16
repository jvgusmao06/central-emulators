#include "../include/chip8.h"
#include <stdio.h>

#define INI_DATA 0x200

void chip8_init(chip8 *c){
    c->PC = INI_DATA;

    c->delay_timer = 60;
    c->sound_timer = 60;
}

void chip_cycle(chip8 *c, memory *m){
    uint16_t opcode = (m->data[c->PC] << 8) | m->data[c->PC + 1];

    c->PC += 2;

    uint8_t x = (opcode & 0x0F00) >> 8;
    uint8_t y   = (opcode & 0x00F0) >> 4;
    uint8_t nn  = (opcode & 0x00FF);
    uint16_t nnn = (opcode & 0x0FFF);

    switch(opcode & 0xF000){
        case 0x000:{ // 0xxx
            switch(opcode & 0x00FF){
                case 0x00E0:{ // 0xE0
                    for(int i = 0; i < 64; i++){
                        for(int j = 0; j < 32; j++){
                            c->display[i][j] = 0;
                        }
                    }
                }break;

                case 0x00EE:{ // 0xEE
                    c->SP--;
                    c->PC = c->stack[c->SP];
                }break;
            }
        }break;

        case 0x1000:{
            c->PC = nnn;
        }break;

        case 0x2000:{
            c->stack[c->SP] = c->PC;
            c->SP++;
            c->PC = nnn;
        }break;

        case 0x3000:{
            if(c->V[x] == nn){
                c->PC += 2;
            }
        }break;

        case 0x4000:{
            if(c->V[x] != nn){
                c->PC += 2;
            }
        }break;

        case 0x5000: {
            if(c->V[x] == c->V[y]){
                c->PC += 2;
            }
        }break;

        case 0x6000: {
            c->V[x] = nn;
        }break;

        case 0x7000: {
            c->V[x] += nn;
        }break;

        case 0x8000: {
            switch(opcode & 0x000F){
                case 0x0000: {
                    c->V[x] = c->V[y];
                }break;

                case 0x0001: {
                    c->V[x] |= c->V[y];
                }break;

                case 0x0002: {
                    c->V[x] &= c->V[y];
                }break;

                case 0x0003: {
                    c->V[x] ^= c->V[y];
                }break;

                case 0x0004:{
                    uint16_t soma = c->V[x] + c->V[y];
                    if(soma > 255){
                        c->V[15] = 1;
                    }
                    else{
                        c->V[15] = 0;
                    }
                    c->V[x] = soma;
                }break;

                case 0x0005: {
                    if(c->V[y] <= c->V[x]){
                    c->V[15] = 1;
                    }
                    c->V[x] -= c->V[y];
                }break;

                case 0x0006: {
                    c->V[15] = c->V[x] & 0x0001;
                    c->V[x] >>= 1;
                }break;

                case 0x0007: {
                    if(c->V[y] > c->V[x]){
                        c->V[15] = 1;
                    }
                    else{
                        c->V[15] = 0;
                    }
                    c->V[x] = c->V[y] - c->V[x];
                }break;

                case 0x000E: {
                    c->V[15] = (c->V[x] >> 7) & 0x1;
                    c->V[x] <<= 1;
                }break;
            }
        }break;

        case 0x9000: {
        if (c->V[x] != c->V[y]){
            c->PC += 2;
        }
        }break;

        case 0xA000: {
            c->I = nnn;
        }break;

        case 0xB000: {
            c->PC = nnn + c->V[0];
        }break;

        case 0xC000: {
            // Não sei fazer o random
        }break;

        case 0xD000: {
            // Não sei fazer desenhar
        }break;

        case 0xE000: {
            switch(opcode & 0x00FF){
                case 0x009E: {

                }break;

                case 0x00A1: {

                }break;
            }
        }break;

        case 0xF000: {
            switch(0x00FF){
                case 0x0007: {
                    
                }
            }
        }break;
    }

}