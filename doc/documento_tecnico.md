New-Item -Path "doc" -ItemType Directory -Force; Set-Content -Path "doc\DOCUMENTO_TECNICO.md" -Value '# DOCUMENTO DE ANÁLISE E DESENVOLVIMENTO DE SISTEMAS (DADS)

## 1. CAPA E IDENTIFICAÇÃO DO PROJETO
* **Nome do Sistema:** Sorteador de Pelada
* **Slogan / Breve Descrição:** Monte times equilibrados e controle a artilharia da galera!
* **Autores / Equipe:** [Alessandro Henrique da Silva Santos]
* **Curso / Disciplina:** Projeto Integrador — Front-End e CMS (UC15)
* **Professor Orientador:** Evandro Vasconcelos
* **Data / Semestre:** 2026.1

---

## 2. VISÃO GERAL E CONCEITO (UX)
* **2.1. Problema:** Dificuldade e demora para organizar futebol amador (peladas), gerando desequilíbrio técnico entre os times, discussões sobre escalação e falta de controle dos gols e artilharia dos participantes.
* **2.2. Análise de Similares:**  
  | Sistema Similar | Pontos Fortes | Pontos Fracos / O que o nosso melhora |
  | :--- | :--- | :--- |
  | **Chega de Panela** | Sortear times por habilidades. | Interface poluída e sem controle dedicado de artilharia rápida no mesmo painel. |
  | **AppTite** | Gestão de campeonatos. | Muito complexo para uma pelada simples de fim de semana; exige cadastro de login demorado. |
  | **Sorteador de Pelada (Nosso)** | Rápido, intuitivo, sorteio equilibrado por nota (1 a 5), ranking visual com medalhas e sincronizado via `localStorage`. | Não exige cadastro/login, funciona direto no navegador e possui validação estrita entre lista de jogadores e artilharia. |

* **2.3. Persona e Cenário de Uso:**  
  * **Persona:** Carlos, 28 anos, organizador da pelada de toda semana. Ele precisa de uma ferramenta rápida no celular para cadastrar os confirmados, equilibrar os times por nível técnico e anotar os gols sem perder tempo.
* **2.4. Fluxo do Usuário (User Flow):**  
  `Acessar o Site` ➔ `Cadastrar Jogadores e Níveis` ➔ `Clicar em "Sortear Times"` ➔ `Compartilhar Escalados no WhatsApp` ➔ `Selecionar o Craque e Registrar Gols no Ranking de Artilharia`.

---

## 3. ESPECIFICAÇÃO DE REQUISITOS
* **3.1. Requisitos Funcionais (RF):**
  * `[RF01]` O sistema deve permitir o cadastro de jogadores com atribuição de nível de habilidade (1 a 5 estrelas).
  * `[RF02]` O sistema deve sortear times equilibrando a soma do nível técnico dos jogadores em cada grupo.
  * `[RF03]` O sistema deve permitir o compartilhamento direto da escalação formatada para o WhatsApp.
  * `[RF04]` O sistema deve permitir o registro de gols vinculando **exclusivamente** jogadores previamente cadastrados através de um menu seletivo (`<select>`).
  * `[RF05]` O sistema deve exibir o Ranking de Artilharia ordenado de forma decrescente com destaques visuais para o TOP 3 (ouro, prata e bronze).
  * `[RF06]` O sistema deve permitir a remoção individual de jogadores da lista e de registros da artilharia.

* **3.2. Requisitos Não-Funcionais (RNF):**
  * `[RNF01]` A interface deve ser 100% responsiva (Mobile-First) para boa usabilidade em smartphones.
  * `[RNF02]` Os dados (jogadores e artilharia) devem ser persistidos localmente no navegador via `localStorage`.
  * `[RNF03]` O código HTML5 e CSS3 deve atender integralmente aos padrões de validação da W3C.

---

## 4. INTERFACE E DESIGN SYSTEM (UI)
* **4.1. Protótipo / Wireframe:** Layout centralizado tipo *Card*, com background de campo de futebol e sobreposição escura para contraste visual.
* **4.2. Guia de Estilo:**
  * **Paleta de Cores:**
    * Verde Principal: `#2e7d32`
    * Azul Ação: `#0288d1`
    * WhatsApp Verde: `#25d366`
    * Fundo Card: `#ffffff`
    * Medalhas Artilharia: Ouro (`#ffd700`), Prata (`#c0c0c0`), Bronze (`#cd7f32`).
  * **Tipografia:** Google Fonts — *Poppins* (Títulos e Botões) e *Inter* (Textos e Inputs).



## 5. ARQUITETURA TÉCNICA E IMPLEMENTAÇÃO
* **5.1. Stack Tecnológico:** HTML5 Semântico, CSS3 Moderno (Flexbox, CSS Grid), JavaScript Vanilla (ES6+), FontAwesome Icons, Git e GitHub.
* **5.2. Estrutura do Repositório:**
```text
sorteador-de-pelada-UC15-TI/
├── css/
│   └── styles.css
├── js/
│   └── script.js
├── doc/
│    └──README.MD
│   └── DOCUMENTO_TECNICO.md
├── .NOJEKYLL
└── index.html