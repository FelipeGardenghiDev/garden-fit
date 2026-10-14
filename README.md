# 🌿 GardenFit

> **App Mobile (.apk nativo & PWA) para controle diário de Alimentação (Tabela TACO/IBGE & Macros), Hidratação Inteligente e Rotina de Treinos com Timer de Descanso Háptico.**

[![Part of GC Studio](https://img.shields.io/badge/Part%20of-GC%20Studio%20%2F%20Garden%20Apps-06B6D4?style=flat-square)](https://github.com/FelipeGardenghiDev/projeto-homestudio)
[![Build Android APK](https://github.com/FelipeGardenghiDev/garden-fit/actions/workflows/build-apk.yml/badge.svg)](https://github.com/FelipeGardenghiDev/garden-fit/actions/workflows/build-apk.yml)
[![Capacitor Android](https://img.shields.io/badge/Capacitor-Android%20.APK-3880FF?style=flat-square&logo=capacitor)](https://capacitorjs.com/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)

---

## 📱 Visão Geral do App

O **GardenFit** foi desenvolvido para ser o seu companheiro definitivo de bolso no celular. Concebido a partir do protótipo gerado com o **Gemini**, o app foi transformado em uma aplicação mobile completa e nativa com o **Capacitor**, permitindo gerar o arquivo **`.apk`** instalável em qualquer smartphone Android, além de funcionar como PWA offline.

---

## 🥗 1. Alimentação & Macronutrientes (Tabela TACO/IBGE)

* **Base de Dados Brasileira Autêntica:** Mais de 35 alimentos comuns do dia a dia brasileiro (Pão francês, tapioca, cuscuz, peito de frango, patinho bovino, queijo minas, açaí, feijão carioca/preto, arroz, ovos, whey).
* **4 Refeições Diárias:** Café da Manhã, Almoço, Lanche da Tarde e Jantar com horários recomendados e soma independente de macros.
* **Multiplicadores de Porção:** Adicione 0.5x, 1x, 1.5x, 2x ou 3x a porção padrão de referência.
* **Cadastro de Alimentos Customizados:** Adicione receitas caseiras, shakes ou marmitas com cálculo calórico automático.
* **Cálculo Científico de Metas (Mifflin-St Jeor):**
  * Estimativa da Taxa Metabólica Basal (TMB) e Gasto Energético Total (TDEE).
  * Ajuste automático para **Definição / Emagrecimento (-450 kcal)**, **Manutenção** ou **Hipertrofia / Ganho de Massa (+350 kcal)**.
  * Meta de proteína ajustável por kg corporal (ex: 2.0g/kg).

---

## 💧 2. Hidratação Inteligente

* **Meta Calculada por Peso:** Cálculo automático de ingestão hídrica ($35\text{ ml} \times \text{peso corporal em kg}$).
* **Adição Rápida com 1 Toque:** Botões dedicados para +200ml (copo pequeno), +300ml (copo cheio), +500ml (garrafinha) e +1.000ml (squeeze).
* **Animação de Preenchimento:** Visualizador circular de hidratação com feedback visual em tempo real e comemoração em confetes ao bater a meta do dia.

---

## 🏋️‍♂️ 3. Exercícios Físicos & Rotina de Treinos

* **Registro de Atividades:** Musculação (Hipertrofia/Força), Corrida na esteira/rua, Caminhada, Ciclismo, Pular Corda, Natação, Lutas (Boxe/Muay Thai) e Alongamento/Yoga.
* **Cálculo Fisiológico de Queima Calórica (MET):** Estimativa com base no equivalente metabólico da tarefa e peso corporal.
* **Balanço Calórico Líquido:**
  $$\text{Calorias Líquidas} = \text{Calorias Consumidas} - \text{Calorias Queimadas nos Treinos}$$
* **Cronômetro de Descanso entre Séries (Gym Rest Timer):**
  * Presets rápidos de 30s, 45s, 60s, 90s e 120s.
  * Alerta sonoro via Web Audio API e **vibração háptica no celular** (`navigator.vibrate`) quando o tempo de descanso zerar!

---

## 📦 Como Gerar e Baixar o Arquivo `.apk` para o Celular

### Opção A: Download Automático via GitHub Actions (Sem instalar nada no PC!) 🚀
1. Acesse a aba **[Actions do repositório](https://github.com/FelipeGardenghiDev/garden-fit/actions)**.
2. Clique no workflow **Build Android APK** mais recente.
3. No final da página em **Artifacts**, baixe o arquivo comprimido contendo o **`app-debug.apk`**.
4. Envie o `.apk` para o seu celular (via WhatsApp, Telegram ou Google Drive) e toque nele para instalar!

### Opção B: Instalar como PWA no Celular (Sem precisar de APK)
1. Acesse o endereço web do app no navegador do celular (Chrome).
2. Toque no menu de 3 pontinhos do Chrome e selecione **"Adicionar à Tela Inicial"** ou **"Instalar Aplicativo"**.
3. O app criará um ícone nativo na tela do celular e abrirá em tela cheia sem barras de navegador.

### Opção C: Gerar localmente via Android Studio
```bash
# 1. Instalar dependências
npm install

# 2. Compilar assets web
npm run build

# 3. Sincronizar o projeto nativo do Android
npx cap add android
npx cap sync android

# 4. Abrir no Android Studio para gerar o APK
npx cap open android
```

---

## 🛠️ Stack Tecnológica

* **Framework UI:** React 19 + TypeScript + Vite 8
* **Estilização:** Tailwind CSS v4 (Design Mobile Dark & Safe Areas)
* **Mobile Runtime:** Capacitor 7 Android
* **Áudio & Vibração:** Web Audio API + HTML5 Vibration API
* **Persistência:** LocalStorage com sincronização automática e proteção de dados
* **CI/CD:** GitHub Actions com Ubuntu Runner, Java 21 Temurin e Android SDK

---

## 🌿 Ecossistema GC Studio

O **GardenFit** integra a suíte de aplicativos autorais e ferramentas criativas do **GC Studio** (Felipe Gardenghi).  
Conheça outros projetos da suíte:
* 🎬 **[GardenCut](https://github.com/FelipeGardenghiDev/garden-cut):** Editor e estúdio de vídeo não-linear web.
* 🎨 **[Garden Pixel Editor](https://github.com/FelipeGardenghiDev/garden-pixel-editor):** Editor de pixel art e isometria 2:1.
* 🏛️ **[GC Studio Hub](https://github.com/FelipeGardenghiDev/projeto-homestudio):** Central oficial do estúdio.

---

## 📄 Licença
Distribuído sob a licença MIT. Desenvolvido por Felipe Gardenghi.
