# 0day.sh

Landing page de uma empresa de CyberSec. A ideia foi fugir do visual
genérico de site de "consultoria de TI" e construir algo com cara de terminal:
fundo escuro, tipografia monoespaçada, detalhes em vermelho e bastante
interação de scroll.

<p align="center">
  <img src="./assets/1.gif" width="100%" alt="Abertura e seção principal">
</p>

<p align="center">
  <img src="./assets/2.gif" width="100%" alt="Serviços, casos e contato">
</p>

## Sobre

O site apresenta os serviços (red team, teste de invasão, pesquisa de 0day e
inteligência de ameaças), explica como o trabalho funciona em três passos e
mostra alguns casos anonimizados. O texto é todo em português direto, sem
juridiquês. A proposta é que qualquer pessoa entenda, não só quem é da área.

Alguns detalhes que valem o clique:

- Tela de boot ao abrir (dá pra pular)
- Cursor customizado que reage aos elementos
- Terminal "ao vivo" digitando sozinho na primeira sessão
- Contadores que animam ao entrar na tela e textos com parallax

## Stack

- React 18
- Vite
- Tailwind CSS
- Framer Motion

## Rodando

```bash
npm install
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```
