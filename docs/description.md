# Descrição técnica do sitema Chip-8

## Especificações:

### Memória
- 4096 palavras de 8 bits
- Grande parte dos programas é escrito na posição 512(0x200) da memória
- Destes 512 bytes, os 256 superiores são reservados para display refresh
- os 96 abaixo são reservados para a call stack, uso interno e outras variáveis

### Registradores
- 16 registradores de 8 bits para dados (V0 a VF)
- VF tem outros usos
- Registrador de endereço (I) possui 12 bits utilizados em diversos opcodes

### Pilha
- Não entendi nada

### Temporizadores
- **Delay Timer** controla o tempo de eventos nos jogos
- **Sound Timer** controla os efeitos sonoros

**Opcodes**
- 35 opcodes
- 16 bits cada um
| Código | Função |
|

