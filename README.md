# 🍁 Diablo Base — Stone WPP

Base gratuita para bots de WhatsApp criada por **Dylan Modz**. Agora usa a biblioteca **[@stone-wpp/ofc](https://github.com/dylan-Modz/stone-wpp-ofc)**. Os comandos continuam no `diablo.js`.

## Instalação

Requisitos: Node.js 20+, Git e um ambiente com processo Node.js persistente (VPS, Termux ou hospedagem Node adequada).

    git clone https://github.com/dylan-Modz/Diablo-Base.git
    cd Diablo-Base
    npm install
    npm start

No Termux: `pkg update -y && pkg install nodejs-lts git -y`. Algumas dependências nativas da Stone podem exigir compilação e nem todo Android tem binários compatíveis.

## Pareamento

Na primeira execução informe o número com DDI no terminal, ou configure `PAIRING_NUMBER=5599999999999` (seu número completo) no ambiente para iniciar sem terminal.

Abra WhatsApp → Aparelhos conectados → Conectar com número de telefone e digite o código exibido.

A nova sessão fica em `database/stone-session/`. **Jamais suba credenciais ou essa pasta para o GitHub.**

> Migração: o formato de sessão anterior não é compatível. Faça backup da sessão antiga antes de parear novamente; não apague a pasta de sessão antiga sem backup.

## Atualizar uma instalação anterior

    git pull
    rm -rf node_modules
    npm install
    npm run check
    npm start

`node_modules` foi removido do controle de versão e está ignorado pelo `.gitignore`. A instalação das dependências é feita pelo npm. Não apague `database/` depois que a sessão da Stone estiver funcionando.

## Estrutura

- `connect.js`: conexão, pareamento, reconexão e eventos nativos da Stone
- `diablo.js`: comandos, grupos e configurações
- `dados/lib/stone-mensagens.js`: envio de mídias, reações, downloads e menu interativo usando Stone
- `dados/config.json`: nome, prefixo e dono do bot
- `dados/api.json`: integração com [Tokito APIs](https://tokito-apis.com.br)

O menu de categorias utiliza os botões interativos da Stone com imagem ou vídeo, sem o carrossel da implementação anterior. Faça teste no WhatsApp para verificar a apresentação do menu e as respostas da lista.

Stone WPP: [documentação](https://stone-wpp.vercel.app/) | [npm](https://www.npmjs.com/package/@stone-wpp/ofc)
