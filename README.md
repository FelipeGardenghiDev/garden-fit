# ⚡ BodyMonitor

> **App Mobile Pessoal (.apk nativo & PWA) para controle diário de Alimentação & Nutrientes (Tabela TACO), Hidratação Inteligente (2.6L), Redução de Café & Cafeína e Checklist de Remédios & Suplementos.**

[![Capacitor Android](https://img.shields.io/badge/Capacitor-Android%20.APK-3880FF?style=flat-square&logo=capacitor)](https://capacitorjs.com/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Build Android APK](https://github.com/FelipeGardenghiDev/body-monitor/actions/workflows/build-apk.yml/badge.svg)](https://github.com/FelipeGardenghiDev/body-monitor/actions/workflows/build-apk.yml)

---

## 📱 Visão Geral do App

O **BodyMonitor** foi concebido sob medida para o objetivo pessoal de **perda de gordura e definição (de 75 kg para 65 kg)** com **1,74m de altura**.

O app remove distrações e foca estritamente nos quatro pilares mais críticos da rotina diária:
1. **Alimentação & Nutrientes Faltantes** (déficit calórico saudável com meta de 150g de proteína).
2. **Hidratação Inteligente** (meta precisa de 2.625 ml/dia com base no peso corporal).
3. **Controle e Redução de Café & Cafeína** (contador de xícaras, alertas de limite e cálculo de mg de cafeína).
4. **Checklist Diário de Remédios e Suplementos** (horários, dosagens e marcação de confirmação com horário de tomada).

---

## 🎯 Perfil Personalizado & Metas Iniciais

| Parâmetro | Configuração Inicial | Objetivo |
| :--- | :--- | :--- |
| **Altura** | 1,74 m (174 cm) | Constante |
| **Peso Atual** | 75,0 kg | Ponto de partida |
| **Meta de Peso** | 65,0 kg | **-10,0 kg** de gordura |
| **Déficit Calórico** | ~1.850 kcal/dia | Perda de gordura sustentável sem perder massa magra |
| **Meta Proteica** | 150 g/dia (2.0g por kg) | Preservação de massa muscular |
| **Meta de Água** | 2.625 ml/dia | $75\text{ kg} \times 35\text{ ml}$ |
| **Limite de Café** | 3 xícaras/dia (~240mg cafeína) | Redução gradual de consumo excessivo |

---

## 🚀 Funcionalidades Principais

### 1. 🍽️ Nutrientes & "O Que Está Faltando Hoje"
- **Monitor de Gaps Nutricionais em Tempo Real:** Um card no topo indica exatamente quantas **calorias, proteínas, carboidratos e gorduras ainda faltam** ingerir para bater as metas do dia.
- **Tabela TACO/IBGE Integrada:** Banco de dados brasileiro com mais de 35 alimentos comuns (pão francês, ovo cozido/mexido, tapioca, cuscuz, peito de frango, patinho bovino, queijo minas, arroz, feijão, aveia, whey protein).
- **Multiplicadores de Porção:** 0.5x, 1x, 1.5x, 2x ou 3x a porção de referência.
- **Alimentos Personalizados:** Cadastro rápido de marmitas, receitas ou suplementos específicos com cálculo calórico instantâneo.
- **Divisão por Refeições:** Café da Manhã, Almoço, Lanche da Tarde e Jantar.

### 2. 💧 Hidratação & ☕ Monitor de Café
- **Hidratação Calculada por Peso:** Meta de 2.6L com botões rápidos de 1 toque:
  - `+200ml` (Copo americano)
  - `+300ml` (Copo cheio)
  - `+500ml` (Garrafinha)
  - `+1.000ml` (Squeeze grande)
- **Efeito Confetti:** Comemoração animada na tela ao completar os 2.6L do dia.
- **Monitor de Café para Redução de Consumo:**
  - Contador rápido de xícaras com botão de incremento e decremento.
  - Estimativa de cafeína consumida (~80mg por xícara).
  - Horário da última xícara registrada (ex: *"Último café às 15:40"*).
  - Alertas visuais automáticos:
    - 🟢 **Verde:** Consumo moderado dentro da meta.
    - 🟡 **Amarelo:** Limite atingido (ex: 3 xícaras).
    - 🔴 **Vermelho:** Alerta de excesso (ex: 4+ xícaras).

### 3. 💊 Checklist Diário de Remédios & Suplementos
- **Checklist com Toque Fácil:** Checkboxes largos com feedback visual.
- **Registro do Horário Tomado:** Ao marcar o remédio, o app registra automaticamente a hora em que foi consumido (ex: *"Tomado às 08:14"*).
- **Cadastro de Medicamentos:** Adicione remédios ou suplementos com nome, dosagem (ex: "1 cápsula", "50mg") e horário previsto (ex: "08:00 - Jejum").
- **Botão "Resetar para Amanhã":** Desmarca todos os itens de uma vez para iniciar um novo dia sem perder as configurações dos remédios cadastrados.

### 4. ⚖️ Meta 65kg & Backup de Dados
- **Barra de Progresso Visual:** Mostra a porcentagem exata percorrida de 75 kg rumo aos 65 kg e quantos quilos faltam.
- **Histórico de Pesagens:** Registre pesagens periódicas para acompanhar o ritmo da perda de peso.
- **Backup e Restauração 1-Click (JSON):**
  - **Exportar Backup:** Baixa um arquivo `.json` com todos os seus dados (refeições, histórico de peso, remédios, configurações).
  - **Importar Backup:** Restaura instantaneamente o histórico em qualquer outro celular ou navegador.

---

## 💾 Como os Dados São Armazenados no APK? Já Está Funcionando?

**Sim, está 100% funcionando!**

### Como funciona internamente:
Quando o app é executado no Android como um aplicativo nativo (`.apk`), o Capacitor utiliza o motor nativo do **Android WebView (Chromium Sandboxed Storage)**. 
- O `localStorage` e `IndexedDB` são persistidos diretamente no sistema de arquivos do Android dentro da pasta privada e protegida do aplicativo:
  ```
  /data/data/dev.gardenghi.bodymonitor/app_webview/Default/Local Storage/
  ```
- **Persistência Permanente:** Os dados permanecem gravados mesmo se você fechar o app, forçar o encerramento no gerenciador de tarefas do Android ou reiniciar o smartphone.
- **Privacidade Total:** Os dados nunca saem do seu aparelho; nenhum servidor externo tem acesso aos seus registros de saúde ou rotina.
- **Segurança Adicional:** Foi incluído o recurso de **Backup em 1 Clique (Exportar/Importar JSON)** na aba "Meta 65kg", permitindo que você salve uma cópia de segurança dos seus dados sempre que desejar.

---

## 🧪 Como Testar Agora no PC e no Celular via Wi-Fi

O servidor de desenvolvimento do Vite já está configurado e rodando:

### 1. No Computador (Navegador):
Abra no navegador:
```
http://localhost:5174/
```
*(Dica: Abra as Ferramentas do Desenvolvedor com `F12` e ative o "Device Mode" com `Ctrl+Shift+M` para simular a tela do celular).*

### 2. No Celular (Conectado no mesmo Wi-Fi de casa):
Abra o navegador do celular (Chrome ou Safari) e acesse:
```
http://192.168.102.114:5174/
```
Você verá o app funcionando em tempo real com animações fluidas e layout mobile nativo.

---

## 📦 Como Gerar e Baixar o `.apk` para o Celular

### Opção 1: Download Automático via GitHub Actions (Recomendado) 🚀
1. Acesse a aba **[Actions do repositório](https://github.com/FelipeGardenghiDev/body-monitor/actions)**.
2. O workflow **Build Android APK** compila o aplicativo na nuvem.
3. No final da execução, em **Artifacts**, faça o download do pacote contendo o **`app-debug.apk`**.
4. Transfira o `.apk` para o celular e instale com 1 toque.

### Opção 2: Gerar Localmente via Android Studio
```bash
# 1. Compilar os arquivos da interface
npm run build

# 2. Sincronizar os assets nativos do Android
npx cap sync android

# 3. Abrir o projeto no Android Studio e compilar o APK
npx cap open android
```

---

## 🛠️ Stack Tecnológica

* **Interface:** React 19 + TypeScript + Vite 8
* **Estilização:** Tailwind CSS v4 (Dark Theme & Safe Areas móveis)
* **Mobile Runtime:** Capacitor 7 Android
* **Ícones:** Lucide React
* **Efeitos Visuais:** Canvas Confetti
* **Linter:** Oxlint (0 erros, 0 warnings)
* **Armazenamento:** LocalStorage Sandboxed no Android WebView + Export/Import JSON

---

## 📄 Licença

Uso pessoal exclusivo — Felipe Gardenghi.
