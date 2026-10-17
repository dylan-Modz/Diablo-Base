//==============================================================\\
//                         DIABLO BASE
//                       Dev: Dylan Modz
//                      Stone WPP
//==============================================================\\

'use strict'

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const chalk = require('chalk')
const { banner1, banner2 } = require('./dados/lib/index.js')
const { NomeDoBot } = require('./dados/config.json')

const PASTA_SESSAO = path.join(__dirname, 'database', 'stone-session')
let stoneAtual = null
let salvarCredenciais = null
let DisconnectReason = {}
let encerrando = false
let reconectando = false
let tentativas = 0
let pedindoCodigo = false
let numeroPareamento = String(process.env.PAIRING_NUMBER || '').replace(/\D/g, '')

function perguntar(pergunta) {
  if (!process.stdin.isTTY) {
    throw new Error('Defina PAIRING_NUMBER com DDI no ambiente para parear sem terminal.')
  }
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(pergunta, resposta => {
      rl.close()
      resolve(resposta)
    })
  })
}

async function obterNumero() {
  while (!numeroPareamento) {
    const resposta = await perguntar(chalk.cyan('Digite o numero do WhatsApp com DDI: '))
    const numero = String(resposta || '').replace(/\D/g, '')
    if (numero.length >= 10) numeroPareamento = numero
    else console.log(chalk.red('[ DIABLO ] Numero invalido. Informe DDI e numero.'))
  }
  if (numeroPareamento.length < 10) throw new Error('PAIRING_NUMBER invalido: inclua o DDI.')
  return numeroPareamento
}

async function pedirCodigo(stone, registrado) {
  if (registrado || pedindoCodigo || encerrando || stone !== stoneAtual) return
  pedindoCodigo = true
  try {
    const numero = await obterNumero()
    if (encerrando || stone !== stoneAtual) return
    const resultado = await stone.requestPairingCode(numero)
    const codigo = String(resultado || '').replace(/[-\s]/g, '')
    console.log(chalk.cyan('[ DIABLO ] Codigo de pareamento: ') +
      chalk.white.bold(codigo.match(/.{1,4}/g)?.join('-') || codigo))
    console.log(chalk.white('WhatsApp > Aparelhos conectados > Conectar com numero de telefone.'))
  } catch (erro) {
    pedindoCodigo = false
    console.error(chalk.red('[ PAREAMENTO ] '), erro?.message || erro)
  }
}

function comandos() {
  return require('./diablo.js')
}

function agendarReconexao() {
  if (encerrando || reconectando) return
  reconectando = true
  const tempo = Math.min(30000, 1000 * 2 ** Math.min(tentativas++, 5))
  console.log(chalk.yellow('[ CONEXAO ] Tentando reconectar...'))
  setTimeout(async () => {
    reconectando = false
    if (encerrando) return
    try {
      await iniciarStone()
    } catch (erro) {
      console.error(chalk.red('[ RECONEXAO ] '), erro?.message || erro)
      agendarReconexao()
    }
  }, tempo)
}

async function iniciarStone() {
  const { default: createStone, useMultiFileAuthState, DisconnectReason: causas } =
    await import('@stone-wpp/ofc')
  DisconnectReason = causas || {}
  const { state, saveCreds } = await useMultiFileAuthState(PASTA_SESSAO)
  const stone = createStone({
    auth: state,
    syncFullHistory: false,
    markOnlineOnConnect: true
  })
  stoneAtual = stone
  salvarCredenciais = saveCreds
  pedindoCodigo = false

  stone.ev.on('creds.update', saveCreds)

  stone.ev.on('connection.update', ({ connection, lastDisconnect, qr } = {}) => {
    if (stone !== stoneAtual || encerrando) return
    if (qr && !state.creds.registered) {
      void pedirCodigo(stone, state.creds.registered)
    }
    if (connection === 'open') {
      tentativas = 0
      pedindoCodigo = true
      console.log('\n' + banner1)
      console.log(banner2)
      console.log(chalk.green('✓ ') +
        chalk.white((NomeDoBot || 'Diablo Base') + ' conectado com Stone WPP!'))
    } else if (connection === 'close') {
      const codigo = lastDisconnect?.error?.output?.statusCode
      if (codigo === DisconnectReason.loggedOut || codigo === 401) {
        console.error(chalk.red('[ CONEXAO ] WhatsApp desvinculado.'))
        console.error(chalk.yellow('Faca backup da sessao antes de parear novamente.'))
        return
      }
      agendarReconexao()
    }
  })

  stone.ev.on('messages.upsert', async ({ messages, type } = {}) => {
    if (encerrando || stone !== stoneAtual || type !== 'notify') return
    for (const info of messages || []) {
      if (!info?.message) continue
      try {
        await comandos()(stone, info, 'message')
      } catch (erro) {
        console.error(chalk.red('[ MENSAGEM ] '), erro?.stack || erro)
      }
    }
  })

  stone.ev.on('group-participants.update', async evento => {
    if (encerrando || stone !== stoneAtual) return
    try {
      await comandos()(stone, {
        groupJid: evento.id,
        action: evento.action,
        participants: evento.participants
      }, 'group')
    } catch (erro) {
      console.error(chalk.red('[ GRUPO ] '), erro?.stack || erro)
    }
  })
}

for (const relativo of [
  'diablo.js',
  'dados/lib/index.js',
  'dados/lib/main.js',
  'dados/lib/menus.js',
  'dados/lib/global.js',
  'dados/lib/stone-mensagens.js'
]) {
  const arquivo = path.join(__dirname, relativo)
  if (!fs.existsSync(arquivo)) continue
  fs.watchFile(arquivo, { interval: 1000 }, () => {
    for (const nome of ['./diablo.js', './dados/lib/index.js', './dados/lib/stone-mensagens.js']) {
      try { delete require.cache[require.resolve(nome)] } catch {}
    }
    console.log(chalk.cyan('[ ATUALIZADO ] ') + relativo)
  })
}

async function fechar() {
  if (encerrando) return
  encerrando = true
  try { await salvarCredenciais?.() } catch {}
  try { await stoneAtual?.end(undefined) } catch {}
  process.exit(0)
}

process.on('SIGINT', fechar)
process.on('SIGTERM', fechar)

iniciarStone().catch(erro => {
  console.error(chalk.red('[ STONE ] '), erro?.stack || erro)
  agendarReconexao()
})
