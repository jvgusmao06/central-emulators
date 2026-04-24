# Makefile para Emulador CHIP-8

# Variáveis
CC := gcc
CFLAGS := -Wall -Wextra -std=c99 -O2
SDLFLAGS := $(shell pkg-config --cflags --libs sdl2)
LDFLAGS := -lm

# Diretórios
SRC_DIR := src
OBJ_DIR := build
BIN_DIR := exe
INC_DIR := include

# Arquivos
SOURCES := $(SRC_DIR)/main.c $(SRC_DIR)/chip8.c
OBJECTS := $(patsubst $(SRC_DIR)/%.c,$(OBJ_DIR)/%.o,$(SOURCES))
TARGET := $(BIN_DIR)/chip8

# Alvo padrão
.PHONY: all clean run rebuild

all: $(TARGET)

# Criação do diretório de objetos
$(OBJ_DIR):
	@mkdir -p $(OBJ_DIR)

# Compilação de objetos
$(OBJ_DIR)/%.o: $(SRC_DIR)/%.c | $(OBJ_DIR)
	$(CC) $(CFLAGS) -I$(INC_DIR) -c $< -o $@

# Linkagem
$(TARGET): $(OBJECTS)
	$(CC) $(CFLAGS) $^ -o $@ $(SDLFLAGS) $(LDFLAGS)
	@echo "✓ Emulador compilado: $(TARGET)"

# Executar o emulador
run: all
	cd $(BIN_DIR) && ./chip8

# Limpar objetos compilados (mantém o executável)
clean:
	@rm -rf $(OBJ_DIR)
	@echo "✓ Arquivos de compilação removidos"

# Limpar tudo (incluindo executável)
distclean: clean
	@rm -f $(TARGET)
	@echo "✓ Executável removido"

# Recompilar do zero
rebuild: distclean all

# Info do projeto
info:
	@echo "=== Emulador CHIP-8 ==="
	@echo "Compilador: $(CC)"
	@echo "Flags: $(CFLAGS)"
	@echo "Executável: $(TARGET)"
	@echo "ROM: $(BIN_DIR)/PONG.ch8"
