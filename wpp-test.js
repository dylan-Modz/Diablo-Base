const path = require('path')
const readline = require('readline')
const chalk = require('chalk')
const config = require('./dados/config.json')

const sessionDir = path.join(__dirname, 'database', 'dylan-wpp')
let closing = false
let pairingRequested = false
let socket = null

function ask(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(question, answer => {
      rl.close()
      resolve(answer)
    })
  })
}

async function getNumber() {
  const configured = String(config.connectionNumber || '').replace(/\D/g, '')
  if (configured.length >= 10) return configured

  while (true) {
    const answer = await ask(chalk.blue('Digite o número do WhatsApp com DDI: '))
    const number = String(answer || '').replace(/\D/g, '')
    if (number.length >= 10) return number
    console.log(chalk.red('[ NÚMERO ] ') + 'Use DDI + DDD + número. Exemplo: 5599999999999')
  }
}

function formatCode(code) {
  return String(code || '').replace(/\s/g, '').toUpperCase()
}

async function main() {
  const wpp = await import('@dylan/wpp')
  const makeWASocket = wpp.default || wpp.makeWASocket
  const { state, saveCreds } = await wpp.useMultiFileAuthState(sessionDir)

  console.log(chalk.cyanBright('\n╔══════════════════════════════════════╗'))
  console.log(chalk.cyanBright('║        DIABLO + DYLAN WPP TEST       ║'))
  console.log(chalk.cyanBright('╚══════════════════════════════════════╝'))
  console.log(chalk.blue('Biblioteca: ') + chalk.white(`@dylan/wpp ${wpp.WPP_VERSION}`))
  console.log(chalk.blue('Sessão: ') + chalk.white(sessionDir))

  socket = makeWASocket({
    auth: state,
    connect: false,
    pushName: config.NomeDoBot || 'Diablo Base',
    connectTimeoutMs: 20_000,
    queryTimeoutMs: 30_000
  })

  socket.ev.on('creds.update', async update => {
    await saveCreds(update).catch(error => {
      console.log(chalk.red('[ CREDS ] ') + chalk.white(error?.message || error))
    })
  })

  socket.ev.on('handshake.server', () => {
    console.log(chalk.blue('[ HANDSHAKE ] ') + chalk.white('ServerHello recebido e descriptografado.'))
  })

  socket.ev.on('notification', node => {
    const reg = Array.isArray(node?.content)
      ? node.content.find(item => item?.tag === 'link_code_companion_reg')
      : null
    const stage = reg?.attrs?.stage
    if (stage) console.log(chalk.blue('[ PAIRING ] ') + chalk.white(`stage: ${stage}`))
  })

  socket.ev.on('messages.upsert', ({ messages, type }) => {
    console.log(chalk.blue('[ MENSAGEM ] ') + chalk.white(`evento ${type || 'notify'}`))
    console.dir(messages?.[0], { depth: 5, colors: true })
  })

  socket.ev.on('connection.error', error => {
    console.log(chalk.red('[ DYLAN WPP ] ') + chalk.white(error?.stack || error?.message || error))
  })

  socket.ev.on('connection.update', async update => {
    const connection = update?.connection

    if (connection === 'connecting') {
      console.log(chalk.blue('[ CONEXÃO ] ') + chalk.white('Conectando...'))
      return
    }

    if (connection === 'open') {
      console.log(chalk.green('[ CONEXÃO ] ') + chalk.white('Noise/WebSocket aberto com sucesso.'))

      if (!state.creds.registered && !pairingRequested) {
        pairingRequested = true
        try {
          const number = await getNumber()
          console.log(chalk.blue('[ PAIRING ] ') + chalk.white(`Solicitando código para ${number}...`))
          const code = await socket.requestPairingCode(number)
          console.log('\n' + chalk.cyanBright.bold('Código de pareamento: ') + chalk.white.bold(formatCode(code)))
          console.log(chalk.gray('WhatsApp > Aparelhos conectados > Conectar um aparelho > Conectar com número de telefone.\n'))
        } catch (error) {
          pairingRequested = false
          console.log(chalk.red('[ PAIRING ] ') + chalk.white(error?.stack || error?.message || error))
        }
      } else if (state.creds.registered) {
        console.log(chalk.green('✓ ') + chalk.white(`${config.NomeDoBot || 'Diablo Base'} registrado.`))
        console.log(chalk.blue('[ USUÁRIO ] ') + chalk.white(JSON.stringify(socket.user || state.creds.me || {})))
      }
      return
    }

    if (connection === 'close') {
      console.log(chalk.red('[ CONEXÃO ] ') + chalk.white(update?.lastDisconnect?.error?.message || 'Conexão fechada.'))
    }
  })

  await socket.connect()
}

async function shutdown() {
  if (closing) return
  closing = true
  try { await socket?.end() } catch {}
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

main().catch(error => {
  console.error(chalk.red('[ FATAL ]'), error)
  process.exitCode = 1
})