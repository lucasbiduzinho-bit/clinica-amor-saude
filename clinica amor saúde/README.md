# Amor Saúde Franca — Landing Page v2 (Editorial Premium)

Landing page premium em estilo **editorial / magazine** para a Clínica Amor Saúde Franca, usando fotos reais da clínica e estética de revista de saúde de alto padrão.

## Diferenças da v1

| Aspecto | v1 (clean tech) | v2 (editorial premium) |
|---|---|---|
| Tipografia | Inter para tudo | Fraunces (serif editorial) + Inter |
| Paleta | Petróleo + dourado | Coral + Petróleo + Dourado (cores reais do logo) |
| Hero | Split com mini cards | Magazine layout com foto da família + caption editorial |
| Imagens | Unsplash | Fotos reais da clínica |
| Layout | Grid simétrico | Assimétrico, com momentos de respiro |
| Tom | Tech / SaaS | Revista / lifestyle de saúde |

## Estrutura

```
amor-saude-franca-lp-v2/
├── index.html
├── vercel.json
├── README.md
└── assets/
    ├── styles.css
    ├── script.js
    └── images/
        ├── logo-full.png         (logo cruz + coração + texto)
        ├── logo-heart.png        (favicon)
        ├── logo-wordmark.png     (logo só texto — footer)
        ├── familia-hero.png      (hero: família sendo recebida)
        ├── recepcao.png          (seção "A clínica")
        ├── consulta-exames.png   (especialidades médicas)
        ├── ultrassom.png         (diagnóstico por imagem)
        └── atendimento-acolhedor.png (humanizado + família)
```

## Seções

1. **Topbar** minimalista com logo real
2. **Hero magazine** — foto grande + caption editorial + meta cards
3. **Marquee** com especialidades rolando (azul petróleo + dourado)
4. **A clínica** — recepção + lema "Cuidado que acolhe, saúde que transforma"
5. **Odontologia premium** — bloco escuro com grid assimétrico (5 serviços + card destacado)
6. **Especialidades médicas** — 4 cards grandes com fotos reais (clínica, imagem, família, lab)
7. **Atendimento humanizado** — split com 3 micro-cards (escuta, comunicação, acompanhamento)
8. **Depoimentos editorial** — 3 cards, centro destacado em coral+teal
9. **FAQ** — split com CTA WhatsApp + accordion
10. **CTA final** — fundo escuro com headline serif + botão dourado
11. **Footer escuro** — logo + horários + contato

## Personalização

### Número do WhatsApp
Edite `assets/script.js`:
```js
const WHATSAPP_NUMBER = "5516999999999";
```

### Cores
Tudo em `assets/styles.css` na seção `:root` — coral, teal, gold são as 3 cores principais.

### Imagens
Já estão em `assets/images/`. Substitua mantendo os mesmos nomes para preservar o layout.

## Deploy no Vercel

1. Push pro GitHub (repo separado deste v1!)
2. Importar no Vercel — **Application Preset: Other**
3. Build/Output: vazio
4. Deploy

Sugestão de nome: `amor-saude-franca` ou `amor-saude-franca-v2`.

## Observações

- Depoimentos são fictícios (claramente marcados) — substitua quando tiver reais com consentimento
- Imagens são geradas via OpenAI Playground — perfeitas para demo. Em produção, considere fotos reais da unidade
- Layout testado em desktop (1080px+), tablet (720-1080px), mobile (<720px)
- O float do WhatsApp tem animação pulse para chamar atenção
