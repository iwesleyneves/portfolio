# Wesley Neves | Full-stack Developer Portfolio

Repositório oficial do meu portfólio profissional ([iwesleyneves.github.io/portfolio](https://iwesleyneves.github.io/portfolio/)). O projeto foi desenvolvido com foco em alta performance, interatividade 3D/WebGL, arquitetura modular em JavaScript puro e experiência do usuário, servindo como vitrine técnica das minhas competências em desenvolvimento Web, Mobile e Ciência de Dados.

---

## Destaques & Componentes Interativos

A interface combina HTML5, CSS3 e JavaScript puro com renderização avançada em **Three.js**, **WebGL2**, **Canvas 2D** e **GSAP (ScrollTrigger)**, integrando componentes interativos adaptados do ecossistema *React Bits*:

*   **Crachá 3D Interativo (`Lanyard`)**: Simulação física em tempo real com Three.js na seção *Home*, com efeito holográfico na superfície, cordão personalizado, interação de arrastar/esticar e clique para girar frente e verso.
*   **Tipografia em Partículas (`ParticleText`)**: Animação em Canvas 2D que forma o nome `"Wesley Neves"` a partir de partículas dinâmicas com repulsão ao cursor, explosão ao clique e adaptação automática de cores entre os temas escuro e claro.
*   **Tipografia Variável por Proximidade (`VariableProximity`)**: Subtítulo e apresentação da *Home* com fonte variável (`Roboto Flex`) que reage suavemente à distância do cursor.
*   **Carrossel Infinito de Tecnologias (`LogoLoop`)**: Faixa contínua interativa com efeito *dock* de ampliação, cores oficiais de cada linguagem no hover e suporte a arraste.
*   **Card de Perfil Holográfico (`ProfileCard`)**: Card 3D na seção *Sobre mim* com inclinação, parallax na foto, brilho especular (`glare`) e reflexo holográfico.
*   **Revelação Dinâmica no Scroll (`ScrollReveal`)**: Textos e títulos das seções revelados palavra por palavra com desfoque e nivelamento progressivo sincronizados com a rolagem via GSAP ScrollTrigger.
*   **Cards 3D com Parallax (`TiltedCard`)**: Aplicados aos cards de *Projetos* e de *Formação Acadêmica*, com camadas flutuantes em diferentes profundidades (`--tc-depth`), reflexo de borda e tooltip que acompanha o cursor.
*   **Pilha 3D de Habilidades (`CardSwap`)**: Deck 3D interativo na seção *Habilidades* (`Desenvolvimento`, `Dados`, `Banco de Dados` e `Ferramentas`) com troca automática, suporte a arraste/impulso (*fling*) e navegação por clique ou teclado.
*   **Pasta de Vidro 3D (`Folder`)**: Pasta interativa com shader WebGL2 de vidro refrativo (`variant: glass`) na seção *Certificados*, contendo todas as 12 certificações que podem ser espiadas, abertas em leque, arrastadas para fora e ampliadas no modal.
*   **Botões com Reflexo Especular (`SpecularButton`)**: Botões com iluminação de borda renderizada via shader WebGL2 que acompanha a proximidade do mouse.
*   **Cursor Mira (`TargetCursor`)**: Retículo giratório customizado que trava magneticamente nos elementos interativos da página.
*   **Modo Claro e Escuro (`Light / Dark Theme`)**: Alternância completa de tema com persistência em `localStorage`, adaptando cores, sombras, partículas, cursor e texturas 3D em tempo real.

---

## Stack Tecnológica

*   **HTML5 Semântico**
*   **CSS3 Modular** (Custom Properties, Flexbox, CSS Grid, Media Queries, Backdrop Filters)
*   **JavaScript (ES6+ Vanilla)**
*   **Three.js & WebGL2 Shaders** (Renderização 3D, física do crachá, refração de vidro e iluminação especular)
*   **GSAP & ScrollTrigger** (Animações de texto vinculadas ao scroll)
*   **Devicon & SVGs Customizados** (Ícones e ilustrações vetoriais exclusivas para os projetos)

---

## Estrutura de Arquivos

```text
.
├── assets/                          # Ativos estáticos do projeto
│   ├── docs/                        # Currículo atualizado em PDF (CurriculoWesleyNeves.pdf)
│   ├── icons/                       # Ícones SVG utilitários e de categorias
│   └── img/                         # Foto de perfil, favicon, texturas do crachá, logos dos projetos e certificados
│       └── certificados/            # Imagens dos 12 certificados exibidos na pasta 3D e modal
├── css/                             # Sistema de estilização modular
│   ├── about.css                    # Estilos da seção 'Sobre mim'
│   ├── animation.css                # Keyframes e transições globais
│   ├── base.css                     # Variáveis de tema (Dark/Light) e resets
│   ├── card-swap.css                # Estilos da pilha 3D de habilidades (CardSwap)
│   ├── certificates.css             # Estilos da seção de certificações
│   ├── contact.css                  # Estilos da seção de contato
│   ├── folder.css                   # Estilos da pasta 3D de vidro (Folder)
│   ├── home.css                     # Estilos da seção inicial (Hero)
│   ├── lanyard.css                  # Posicionamento do canvas 3D do crachá
│   ├── logo-loop.css                # Estilos do carrossel infinito de tecnologias
│   ├── modal.css                    # Visualizador de certificados em tela cheia
│   ├── navbar.css                   # Barra de navegação fixa e menu mobile
│   ├── particle-text.css            # Container do texto em partículas
│   ├── profile-card.css             # Estilos do card holográfico de perfil
│   ├── projects.css                 # Carrossel e vitrine de projetos
│   ├── responsive.css               # Responsividade para desktop, tablet e smartphones
│   ├── scroll-reveal.css            # Estrutura de palavras do ScrollReveal
│   ├── skills.css                   # Estilos base da seção de habilidades
│   ├── specular-button.css          # Estilos dos botões com brilho WebGL2
│   ├── style.css                    # Arquivo mestre de importações CSS
│   ├── target-cursor.css            # Estilos do cursor mira interativo
│   ├── theme.css                    # Botão de tema e ajustes visuais do Modo Claro
│   ├── tilted-card.css              # Estilos dos cards 3D com parallax e glare
│   └── variable-proximity.css       # Fonte variável Roboto Flex para proximidade
├── js/                              # Camada de lógica, física e shaders
│   ├── modules/                     # Módulos independentes
│   │   ├── active-nav.js            # Destaque automático da seção ativa na navbar
│   │   ├── card-swap.js             # Motor físico 3D da pilha de habilidades
│   │   ├── carousels.js             # Controle do carrossel de projetos
│   │   ├── certificate-modal.js     # Controle do modal de certificados
│   │   ├── folder.js                # Pasta 3D interativa com shader WebGL2 de vidro
│   │   ├── hero-3d.js               # Controle de performance da seção Hero
│   │   ├── lanyard.js               # Crachá 3D com física de cordão em Three.js
│   │   ├── logo-loop.js             # Loop contínuo de ícones com efeito dock
│   │   ├── mobile-menu.js           # Controle do menu responsivo mobile
│   │   ├── particle-text.js         # Amostragem e física de partículas em Canvas 2D
│   │   ├── profile-card.js          # Inclinação 3D e efeito holográfico do perfil
│   │   ├── reveal.js                # IntersectionObserver para entrada de elementos
│   │   ├── scroll-reveal.js         # Animação de texto no scroll com GSAP
│   │   ├── specular-button.js       # Shader WebGL2 de iluminação nos botões
│   │   ├── target-cursor.js         # Cursor customizado com trava magnética
│   │   ├── theme.js                 # Gerenciamento de tema Claro/Escuro (localStorage)
│   │   ├── tilted-card.js           # Inclinação 3D, parallax e tooltip nos cards
│   │   └── variable-proximity.js    # Interpolação de eixos de fonte variável por distância
│   └── script.js                    # Orquestração e inicialização de todos os módulos
├── index.html                       # Estrutura principal da aplicação
├── LICENSE                          # Licença MIT
└── README.md                        # Documentação do projeto
```

---

## Execução Local

Como o projeto utiliza texturas WebGL (`Three.js` e `WebGL2`) carregadas com política `CORS`, recomenda-se executá-lo através de um servidor HTTP local:

1. Clone o repositório:
```bash
git clone https://github.com/iwesleyneves/portfolio.git
cd portfolio
```

2. Inicie um servidor local (ex.: extensão **Live Server** do VS Code, Python ou Node.js):
```bash
npx serve .
```

---

## Contato

*   **Portfólio**: [iwesleyneves.github.io/portfolio](https://iwesleyneves.github.io/portfolio/)
*   **LinkedIn**: [linkedin.com/in/iwesleyneves](https://www.linkedin.com/in/iwesleyneves)
*   **GitHub**: [github.com/iwesleyneves](https://github.com/iwesleyneves)
*   **Email**: [wesleyneves675@gmail.com](mailto:wesleyneves675@gmail.com)

---

## Licença

Este projeto é distribuído sob a Licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.
