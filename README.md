<p align="center">
  <img src="https://raw.githubusercontent.com/Yoshirukkj/Download-/main/s4fdiy.jpg" alt="Diablo Base" width="100%">
</p>

# 🍁 Diablo Base

Base gratuita para bots de WhatsApp, criada por **Dylan Modz**. A branch principal está em modo de teste da biblioteca própria **@dylan/wpp**.

Feita principalmente para iniciantes que querem aprender, modificar comandos e criar seu próprio bot de forma simples.

---

## 📦 Instalação

No Termux:

```bash
pkg update -y
pkg upgrade -y
pkg install nodejs git -y
```

Clone a base:

```bash
git clone https://github.com/dylan-Modz/Diablo-Base.git
```

Entre na pasta:

```bash
cd Diablo-Base
```

Instale as dependências:

```bash
npm install
```

Inicie:

```bash
npm start
```

Na primeira inicialização, coloque o número do WhatsApp com DDI e faça o pareamento.

---

## 🌐 Tokito APIs

Alguns comandos da base utilizam a **Tokito APIs**.

https://tokito-apis.com.br

---

## ⚡ Zapo

A Diablo Base foi totalmente migrada para a biblioteca **Zapo**.

**Documentação:**  
https://zapo.to


## 🧪 Teste com @dylan/wpp

A branch principal já inclui o pacote local `@dylan/wpp 0.1.0-alpha.1` para testar conexão e código de pareamento dentro da Diablo Base.

```bash
npm install
npm start
```

Ao iniciar, o teste usa `database/dylan-wpp` para a sessão. Se `connectionNumber` não estiver definido em `dados/config.json`, o terminal pede o número com DDI.

Para apenas conferir se o pacote carregou:

```bash
npm run test:wpp
```

O launcher antigo da base continua disponível separadamente em `npm run start:legacy`.
