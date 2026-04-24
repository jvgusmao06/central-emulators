# Emulador CHIP-8 com SDL2

Emulador CHIP-8 completo em C com interface gráfica usando SDL2.

## Compilação

### Requisitos
- GCC (ou outro compilador C)
- SDL2 (`libsdl2-dev` no Ubuntu/Debian)
- Make

### Instalação de Dependências (Ubuntu/Debian)
```bash
sudo apt-get install build-essential libsdl2-dev
```

### Compilação Rápida
```bash
make              # Compila o projeto
make run          # Compila e executa
make clean        # Remove arquivos de compilação
make rebuild      # Recompila do zero
make info         # Mostra informações do projeto
```

### Compilação Manual
```bash
gcc -o exe/chip8 src/main.c src/chip8.c -I./include $(pkg-config --cflags --libs sdl2) -lm
```

## Execução

```bash
cd exe
./chip8
```

## Controles (Teclado CHIP-8)

```
Original:  Remapeado:
1 2 3 C    1 2 3 4
4 5 6 D    Q W E R
7 8 9 E    A S D F
A 0 B F    Z X C V
```

## Estrutura do Projeto

```
Chip-8/
├── Makefile          # Build automation
├── README.md         # Este arquivo
├── docs/
│   └── description.md
├── exe/
│   ├── chip8         # Executável compilado
│   └── PONG.ch8      # ROM do jogo
├── include/
│   └── chip8.h       # Headers
├── src/
│   ├── main.c        # Interface SDL2
│   └── chip8.c       # Implementação da CPU
└── build/            # Diretório de objetos (criado ao compilar)
```

## Referências

- CHIP-8 Specification
- SDL2 Documentation: https://wiki.libsdl.org/SDL2
