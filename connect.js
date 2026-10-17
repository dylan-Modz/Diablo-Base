/*
 * ============================================================
 *                       DIABLO BASE
 * ============================================================
 *
 * Criador: Dylan Modz
 * Biblioteca: Stone WPP
 * API: https://tokito-apis.com.br
 *
 * ============================================================
 */

const path = require('path'), readline = require('readline');
const { chalk, banner1, banner2 } = require('./dados/lib/index.js');
const { NomeDoBot } = require('./dados/config.json');
const Stone = import('@stone-wpp/ofc');

const sessao = path.join(__dirname, 'database', 'stone-session');
const numeroSalvo = process.env.PAIRING_NUMBER || '';

let diabloAtual = null;
let salvarSessao = null;
let reconectando = false;
let encerrando = false;
let tentativas = 0;

const collectNumbers = numero => String(numero || '').replace(/\D/g, '');

const question = texto => new Promise((resolve, reject) => {
if (!process.stdin.isTTY) {
return reject(new Error('Configure PAIRING_NUMBER com DDI na hospedagem.'));
}

const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
});

rl.question(texto, resposta => {
rl.close();
resolve(resposta);
});
});

//=============[ PAREAMENTO ]=============\\

async function startPairing(diablo) {
let numero = collectNumbers(numeroSalvo);

while (numero.length < 11 || numero.length > 15) {
numero = collectNumbers(await question(
chalk.red('Digite o número do WhatsApp que deseja conectar ↴\n') +
chalk.white('--> ')
));

if (numero.length < 11 || numero.length > 15) {
console.log(chalk.red('Número inválido! Digite o número completo com DDI.'));
}
}

await diablo.waitForSocketOpen();

if (encerrando || diablo !== diabloAtual || diablo.authState.creds.registered) return;

const code = await diablo.requestPairingCode(numero);

console.log(
  chalk.blue('\n• Código para conectar a Diablo Base: ') +
  chalk.white.bold(String(code).replace(/[\s-]/g, '').match(/.{1,4}/g)?.join('-') || code)
);

console.log(chalk.cyan(
  '\n• WhatsApp > Aparelhos conectados > Conectar um aparelho\n' +
  '• Selecione Conectar com número de telefone e digite o código acima.\n'
));
}

//=============[ RECONEXÃO ]=============\\

function reconnect() {
if (reconectando || encerrando) return;

reconectando = true;

const tempo = Math.min(30000, 2000 * 2 ** Math.min(tentativas++, 4));

console.log(chalk.yellow('[ DIABLO ] Tentando reconectar...'));

setTimeout(() => {
reconectando = false;

if (encerrando) return;

startConnect().catch(erro => {
console.log(chalk.red('[ ERRO DE CONEXÃO ] ') + String(erro?.message || erro));
reconnect();
});
}, tempo);
}

//=============[ CONEXÃO ]=============\\

async function startConnect() {
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = await Stone;
const { state, saveCreds } = await useMultiFileAuthState(sessao);

const diablo = makeWASocket({
auth: state,
syncFullHistory: false,
keepAliveIntervalMs: 40000,
markOnlineOnConnect: true
});

diabloAtual = diablo;
salvarSessao = saveCreds;

//=============[ EVENTOS ]=============\\

diablo.ev.process(async events => {
if (encerrando || diablo !== diabloAtual) return;

//=============[ EVENTOS DE GRUPOS ]=============\\

if (events['group-participants.update']) {
const evento = events['group-participants.update'];

try {
const startdiablo = require('./diablo.js');
const author = typeof evento.author === 'string'
? evento.author
: evento.author?.jid || '';

await startdiablo(diablo, {
groupJid: evento.id,
action: evento.action,
authorJid: author,
participants: evento.participants,
timestampSeconds: Math.floor(Date.now() / 1000)
}, 'group');

} catch (erro) {
console.log(chalk.red('[ GRUPOS ] ') + String(erro?.stack || erro));
}
}

//=============[ CONEXÃO ]=============\\

if (events['connection.update']) {
const { connection, lastDisconnect } = events['connection.update'];

switch (connection) {

case 'connecting':
console.log(chalk.cyan('[ DIABLO ] Conectando ao WhatsApp...'));
break;

case 'open':
tentativas = 0;
console.log('\n' + banner1);
console.log(banner2);
console.log(chalk.green('〔 ' + (NomeDoBot || 'DIABLO BASE') + ' CONECTADO COM SUCESSO 〕'));
break;

case 'close': {
const motivo = lastDisconnect?.error?.output?.statusCode;

if (motivo === DisconnectReason.loggedOut || motivo === 401) {
console.log(chalk.red('[ DIABLO ] Sessão desconectada do WhatsApp.'));
break;
}

reconnect();
break;
}
}
}

//=============[ MENSAGENS ]=============\\

if (events['messages.upsert']) {
const { messages, type } = events['messages.upsert'];

if (type === 'notify') {
const startdiablo = require('./diablo.js');

for (const info of messages || []) {
if (!info?.message) continue;

try {
await startdiablo(diablo, info, 'message');
} catch (erro) {
console.log(chalk.red('[ MENSAGENS ] ') + String(erro?.stack || erro));
}
}
}
}

//=============[ SALVAR SESSÃO ]=============\\

if (events['creds.update']) {
try {
await saveCreds();
} catch (erro) {
console.log(chalk.red('[ SESSÃO ] ') + String(erro?.message || erro));
}
}

});

//=============[ INICIAR PAREAMENTO ]=============\\

if (!state.creds.registered) {
startPairing(diablo).catch(erro => {
if (diablo !== diabloAtual || encerrando) return;
console.log(chalk.red('[ PAREAMENTO ] ') + String(erro?.message || erro));
});
}
}

//=============[ ENCERRAMENTO ]=============\\

async function fechar() {
if (encerrando) return;
encerrando = true;

try { await salvarSessao?.(); } catch {}
try { await diabloAtual?.end(undefined); } catch {}

process.exit(0);
}

process.on('SIGINT', fechar);
process.on('SIGTERM', fechar);

//=============[ INICIAR BOT ]=============\\

startConnect().catch(erro => {
console.log(chalk.red('[ STONE WPP ] ') + String(erro?.stack || erro));
reconnect();
});
