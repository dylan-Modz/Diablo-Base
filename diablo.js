//==============================================================\\
//                         DIABLO BASE
//                       Dev: Dylan Modz
//
// Base gratuita feita para iniciantes e para quem quer começar
// a criar e modificar bots de WhatsApp de forma simples.
//
// 🌐 APIs: https://tokito-apis.com.br
// 👉 Canal: Siga o canal "💙 ⟡ 𝕮𝖍𝖆𝖓𝖓𝖊𝖑-𝑻𝑶𝑲𝑰𝑻𝑶-𝑨𝑷𝑰'𝑺 ⟡ 💙 #META 4k" no WhatsApp: https://whatsapp.com/channel/0029VbCAgovIyPtbjBhrIi3u
//
// Pode modificar e usar do seu jeito.
//==============================================================\\


//=============[ COMEÇO DE TUDO ]=============\\

const { fs, os, path, spawn, axios, chalk, linguagem, mess, midia, numero, achar, alvo, baixar } = require('./dados/lib/index.js')
let { NomeDoBot, prefix, ownerName, ownerNumber } = require('./dados/config.json')
const { API_URL, API_KEY_DIABLO } = require('./dados/api.json')


//=============[ SELO VERIFICADO GLOBAL ]=============\\

const ARQ_NECESSARIOS = path.join(__dirname, 'dados', 'necessarios.json')

function lerNecessarios() {
const padrao = { verificado: 1 }
try {
if(!fs.existsSync(ARQ_NECESSARIOS)) {
fs.writeFileSync(ARQ_NECESSARIOS, JSON.stringify(padrao, null, 2))
return { ...padrao }
}
const atual = JSON.parse(fs.readFileSync(ARQ_NECESSARIOS, 'utf8'))
return { ...padrao, ...(atual || {}) }
} catch {
return { ...padrao }
}
}

function salvarNecessarios(data) {
fs.writeFileSync(ARQ_NECESSARIOS, JSON.stringify(data, null, 2))
}

function verificadoLigado(valor) {
return valor === true || Number(valor) === 1 || String(valor).toLowerCase() === 'true'
}

function criarSeloMeta(nomeExibido = 'Diablo Base') {
const displayName = String(nomeExibido || NomeDoBot || 'Diablo Base')
return {
key: {
participant: '13135550002@s.whatsapp.net',
remoteJid: 'status@broadcast',
fromMe: false,
id: 'DIABLO-VERIFICADO'
},
message: {
contactMessage: {
displayName,
vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${displayName};;;\nFN:${displayName}\nitem1.TEL;waid=13135550002:13135550002\nitem1.X-ABLabel:Verificado\nEND:VCARD`,
contextInfo: {
forwardingScore: 1,
isForwarded: true
}
}
}
}
}

//=============[ ERROS ]=============\\

process.on('uncaughtException', err => {
console.error((new Date()).toUTCString() + ' uncaughtException:', err.message)
console.error(err.stack)
})

//=============[ INÍCIO ]=============\\

async function startdiablo(diablo, info, evento = 'message') {

let necessarios = lerNecessarios()
let isVerificado = verificadoLigado(necessarios.verificado)
const seloEvento = isVerificado ? criarSeloMeta(NomeDoBot || 'Diablo Base') : null

//=============[ EVENTOS DO GRUPO ]=============\\

if(evento === 'group') {
const from = info?.groupJid || ''
const acao = info?.action || ''
if(!from || !['add', 'remove', 'promote', 'demote'].includes(acao)) return

const dirGroup = path.join(__dirname, 'dados', 'grupos', `${String(from).replace(/[\\/]/g, '_')}.json`)
if(!fs.existsSync(dirGroup)) return

let dataGp
try { dataGp = JSON.parse(fs.readFileSync(dirGroup, 'utf8')) } catch { return }
if(!Array.isArray(dataGp) || !dataGp[0]) return

let groupMetadata
try { groupMetadata = await diablo.group.queryGroupMetadata(from) } catch { return }

const groupName = groupMetadata?.subject || dataGp[0]?.name || 'Grupo'
const groupDesc = groupMetadata?.desc || ''
const groupMembers = groupMetadata?.participants || []
const cred = diablo.getCredentials?.() || {}
const botNumber = cred.meJid || ''

const padrao = {
name: groupName,
groupId: from,
x9: false,
antiimg: false,
antiaudio: false,
antisticker: false,
antilink: false,
antilinkgp: false,
soadm: false,
wellcome: [{
bemvindo1: false,
legendabv1: '0',
legendasaiu1: '0',
fundobv: null,
fundobv_tipo: null,
fundosaiu: null,
fundosaiu_tipo: null
}]
}

dataGp[0] = { ...padrao, ...dataGp[0], name: groupName, groupId: from }
if(!Array.isArray(dataGp[0].wellcome)) dataGp[0].wellcome = padrao.wellcome
if(!dataGp[0].wellcome[0]) dataGp[0].wellcome[0] = padrao.wellcome[0]
dataGp[0].wellcome[0] = { ...padrao.wellcome[0], ...dataGp[0].wellcome[0] }
fs.writeFileSync(dirGroup, JSON.stringify(dataGp, null, 2))

//=============[ X9 ]=============\\

if(['promote', 'demote'].includes(acao)) {
if(!dataGp[0].x9) return

const ator = achar(groupMembers, info?.authorJid, info?.author?.jid, info?.author)
const adm = alvo(ator, info?.authorJid || info?.author?.jid || info?.author || '')
const hora = new Date((info?.timestampSeconds || Math.floor(Date.now() / 1000)) * 1000).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

for(const p of info?.participants || []) {
const jid = typeof p === 'string' ? p : (p?.jid || p?.phoneJid || p?.pnJid || p?.lidJid || '')
const membro = achar(groupMembers, jid, p?.jid, p?.phoneJid, p?.pnJid, p?.lidJid)
const user = alvo(membro, jid)
if(!user) continue

const titulo = acao === 'promote' ? '𝐀𝐋𝐄𝐑𝐓𝐀 𝐃𝐄 𝐏𝐑𝐎𝐌𝐎𝐂𝐀𝐎' : '𝐀𝐋𝐄𝐑𝐓𝐀 𝐃𝐄 𝐑𝐄𝐁𝐀𝐈𝐗𝐀𝐌𝐄𝐍𝐓𝐎'
const feito = acao === 'promote' ? 'ᴘʀᴏᴍᴏᴠɪᴅᴏ ᴀ ᴀᴅᴍ.' : 'ʀᴇʙᴀɪxᴀᴅᴏ ᴀ ᴍᴇᴍʙʀᴏ.'
const responsavel = adm ? `@${numero(adm)}` : 'ᴅᴇsᴄᴏɴʜᴇᴄɪᴅᴏ'
const mentions = [user, adm].filter(Boolean)

await diablo.message.send(from, {
type: 'text',
text: `*${titulo}*\n\n*@${numero(user)} ғᴏɪ ${feito}*\n\n*ᴀᴅᴍ ʀᴇsᴘᴏɴsᴀᴠᴇʟ: ${responsavel}*\n\n*ᴅᴀᴛᴀ: ${hora}*`
}, { ...(seloEvento ? { quote: seloEvento } : {}), mentions }).catch(() => {})
}
return
}

//=============[ BEM-VINDO ]=============\\

const isWelkom = dataGp[0].wellcome[0].bemvindo1
if(!isWelkom || !['add', 'remove'].includes(acao)) return

const welcome = (n, gp) => `*ʙᴇᴍ-ᴠɪɴᴅᴏ @${n} ᴀᴏ ${gp}.*`
const bye = (n, gp) => `*@${n} sᴀɪᴜ ᴅᴏ ${gp}.*`

const perfil = async jid => {
try {
const pic = await diablo.profile.getProfilePicture(jid, 'image')
return pic?.url || ''
} catch { return '' }
}

const legenda = (txt, user) => {
const hora = new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })
return String(txt || '')
.replace(/#hora#/gi, hora)
.replace(/#nomedogp#/gi, groupName)
.replace(/#numerodele#/gi, `@${numero(user)}`)
.replace(/#numerobot#/gi, numero(botNumber))
.replace(/#prefixo#/gi, prefix)
.replace(/#descrição#/gi, groupDesc)
.replace(/#descricao#/gi, groupDesc)
}

for(const p of info?.participants || []) {
const jid = typeof p === 'string' ? p : (p?.jid || p?.phoneJid || p?.pnJid || p?.lidJid || '')
const membro = achar(groupMembers, jid, p?.jid, p?.phoneJid, p?.pnJid, p?.lidJid)
const user = alvo(membro, jid) || jid
if(!user) continue

const bv = dataGp[0].wellcome[0]
const custom = acao === 'add' ? bv.legendabv1 : bv.legendasaiu1
const teks = String(custom || '0').trim() !== '0'
? legenda(custom, user)
: acao === 'add' ? welcome(numero(user), groupName) : bye(numero(user), groupName)

const fundo = acao === 'add' ? bv.fundobv : bv.fundosaiu
const tipo = acao === 'add' ? bv.fundobv_tipo : bv.fundosaiu_tipo

if(fundo) {
const media = Buffer.from(fundo, 'base64')

if(tipo === 'video' || tipo === 'gif') {
await diablo.message.send(from, {
type: 'video',
media,
mimetype: 'video/mp4',
caption: teks,
gifPlayback: true
}, { ...(seloEvento ? { quote: seloEvento } : {}), mentions: [user] }).catch(() => {})
continue
}

await diablo.message.send(from, {
type: 'image',
media,
mimetype: tipo === 'png' ? 'image/png' : 'image/jpeg',
caption: teks
}, { ...(seloEvento ? { quote: seloEvento } : {}), mentions: [user] }).catch(() => {})
continue
}

const foto = await perfil(user)
if(foto) {
try {
const media = await baixar(foto)
await diablo.message.send(from, {
type: 'image',
media,
mimetype: 'image/jpeg',
caption: teks
}, { ...(seloEvento ? { quote: seloEvento } : {}), mentions: [user] })
continue
} catch {}
}

await diablo.message.send(from, { type: 'text', text: teks }, { ...(seloEvento ? { quote: seloEvento } : {}), mentions: [user] }).catch(() => {})
}
return
}

//=============[ MENSAGEM ]=============\\

const from = info.key?.remoteJid || ''
const grupo = !!info.key?.isGroup || from.endsWith('@g.us')
const status = !!info.key?.isBroadcast || from.endsWith('@broadcast')
if(!from || !info.message || status) return

//=============[ BODY ]=============\\

function texto(info) {
const rotas = [
'message.conversation',
'message.imageMessage.caption',
'message.videoMessage.caption',
'message.extendedTextMessage.text',
'message.documentWithCaptionMessage.message.documentMessage.caption',
'message.documentMessage.caption',
'message.buttonsResponseMessage.selectedButtonId',
'message.listResponseMessage.singleSelectReply.selectedRowId',
'message.templateButtonReplyMessage.selectedId',
'message.pollCreationMessageV3.name',
'message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage.text',
'message.editedMessage.message.protocolMessage.editedMessage.imageMessage.caption',
'message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson',
'text'
]

for(const rota of rotas) {
const valor = rota.split('.').reduce((obj, chave) => obj?.[chave], info)
if(!valor) continue

if(rota.includes('paramsJson')) {
try { return JSON.parse(valor)?.id || '' } catch { return '' }
}

return String(valor)
}

return ''
}

const body = texto(info)
const Procurar_String = body
const budy2 = body.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const cmd = body.startsWith(prefix)
const args = cmd ? body.slice(prefix.length).trim().split(/[ \t]+/).filter(Boolean) : body.split(/[ \t]+/).filter(Boolean)
let command = cmd ? String(args.shift() || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ç/g, 'c') : null
const q = args.join(' ')
const PR_String = Procurar_String.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const nome = info.pushName || 'Sem nome'
const sender = info.key?.participant || info.key?.remoteJid || ''
const alt = info.key?.participantAlt || info.key?.remoteJidAlt || ''

let selo = isVerificado ? criarSeloMeta(nome) : info

function atualizarSelo(valor) {
isVerificado = !!valor
necessarios.verificado = isVerificado ? 1 : 0
salvarNecessarios(necessarios)
selo = isVerificado ? criarSeloMeta(nome) : info
return selo
}

//=============[ GRUPO ]=============\\

let groupMetadata = null
let groupName = 'Privado'
let groupDesc = ''
let groupMembers = []

if(grupo) {
try {
groupMetadata = await diablo.group.queryGroupMetadata(from)
groupName = groupMetadata?.subject || 'Grupo'
groupDesc = groupMetadata?.desc || ''
groupMembers = groupMetadata?.participants || []
} catch { return }
}

//=============[ JSON DO GRUPO ]=============\\

const dirGroup = path.join(__dirname, 'dados', 'grupos', `${String(from).replace(/[\\/]/g, '_')}.json`)

const data_IDGP = [{
name: groupName,
groupId: from,
x9: false,
antiimg: false,
antiaudio: false,
antisticker: false,
antilink: false,
antilinkgp: false,
soadm: false,
wellcome: [{
bemvindo1: false,

legendabv1: `「👋」 #numerodele#

- *Seja bem-vindo(a) ao grupo!*

『👥』 Grupo: *#nomedogp#*

Ficamos felizes em ter você aqui.
Leia as regras e aproveite o grupo.`,

legendasaiu1: `「👋」 #numerodele#

- *Um membro saiu do grupo...*

『👥』 Grupo: *#nomedogp#*

Agradecemos pela participação.
Esperamos que volte algum dia.`,

fundobv: null,
fundobv_tipo: null,
fundosaiu: null,
fundosaiu_tipo: null
}]
}]

if(grupo && !fs.existsSync(dirGroup)) fs.writeFileSync(dirGroup, JSON.stringify(data_IDGP, null, 2))

let dataGp
if(grupo) {
try { dataGp = JSON.parse(fs.readFileSync(dirGroup, 'utf8')) }
catch { dataGp = data_IDGP; fs.writeFileSync(dirGroup, JSON.stringify(dataGp, null, 2)) }

if(!Array.isArray(dataGp) || !dataGp[0]) dataGp = data_IDGP
const padrao = data_IDGP[0]
dataGp[0] = { ...padrao, ...dataGp[0], name: groupName, groupId: from }
if(!Array.isArray(dataGp[0].wellcome)) dataGp[0].wellcome = padrao.wellcome
if(!dataGp[0].wellcome[0]) dataGp[0].wellcome[0] = padrao.wellcome[0]
dataGp[0].wellcome[0] = { ...padrao.wellcome[0], ...dataGp[0].wellcome[0] }
fs.writeFileSync(dirGroup, JSON.stringify(dataGp, null, 2))
}

function setGp(index) {
if(grupo) fs.writeFileSync(dirGroup, JSON.stringify(index, null, 2))
}

function setCfg(campo, valor) {
const cfg = path.join(__dirname, 'dados', 'config.json')
let data = {}
try { data = JSON.parse(fs.readFileSync(cfg, 'utf8')) } catch {}
data[campo] = valor
fs.writeFileSync(cfg, JSON.stringify(data, null, 2))
}

//=============[ ADMS/DONO/ETC..CONST ]=============\\

const cred = diablo.getCredentials?.() || {}
const botNumber = cred.meJid || ''
const autor = achar(groupMembers, sender, alt)
const bot = achar(groupMembers, botNumber)
const admin = !!(autor?.isAdmin || autor?.isSuperAdmin)
const botadm = !!(bot?.isAdmin || bot?.isSuperAdmin)
const dono = !!info.key?.fromMe || [sender, alt, info.key?.remoteJidAlt].some(jid => numero(jid) === String(ownerNumber || '').replace(/\D/g, '') && ownerNumber)
const isCargo = dono ? 'Mestre' : admin ? 'Administrador' : 'Membro'

//=============[ FUNÇÕES/ATIVAÇÕES ]=============\\

const isx9 = grupo ? dataGp[0].x9 : undefined
const isAntiImg = grupo ? dataGp[0].antiimg : undefined
const isAntiAudio = grupo ? dataGp[0].antiaudio : undefined
const isAntiSticker = grupo ? dataGp[0].antisticker : undefined
const isAntiLink = grupo ? dataGp[0].antilink : undefined
const isAntiLinkGp = grupo ? dataGp[0].antilinkgp : undefined
const So_Adm = grupo ? dataGp[0].soadm : undefined
const isWelkom = grupo ? dataGp[0].wellcome[0].bemvindo1 : undefined

//=============[ FUNÇÕES DE MARCAÇÕES ESSENCIAL ]=============\\

const m = info.message || {}
const cita = m.extendedTextMessage?.contextInfo || m.imageMessage?.contextInfo || m.videoMessage?.contextInfo || m.audioMessage?.contextInfo || m.documentMessage?.contextInfo || m.stickerMessage?.contextInfo || {}
const menc_prt = cita.participantAlt || cita.participant || ''
const menc_jid2 = Array.isArray(cita.mentionedJid) ? [...cita.mentionedJid] : []
const menc_sticker = menc_jid2?.[0] || menc_prt || null
const busca = String(q || '')
const marcou = busca.includes('@')
const menc_os2 = marcou ? (menc_jid2?.[0] || menc_sticker || null) : (menc_prt || menc_sticker)
const menc_jid = menc_os2 || sender
const sender_ou_n = marcou ? (menc_jid2?.[0] || menc_sticker || sender) : (menc_prt || menc_sticker || sender)
const numClean = txt => String(txt || '').replace(/[()+\-\/\s]/g, '') + '@s.whatsapp.net'
const mrc_ou_numero = busca.length > 6 && !marcou ? numClean(busca) : (menc_prt || menc_sticker || sender)
const marc_tds = marcou ? menc_jid : busca.length > 6 && !marcou ? numClean(busca) : (menc_prt || menc_sticker || sender)
const menc_prt_nmr = busca.length > 12 && !marcou ? numClean(busca) : (menc_prt || menc_sticker || sender)

//=============[ REPLYS / MÍDIAS ]=============\\

const reply = async text => diablo.message.send(from, String(text || ' '), { quote: selo })

const imagem = async(id, file, caption = '', quote = selo) => {
const media = /^https?:\/\//i.test(String(file)) ? await baixar(file) : file
return diablo.message.send(id, { type: 'image', media, mimetype: 'image/jpeg', caption }, { quote })
}

const video = async(id, file, caption = '', quote = selo) => {
const media = /^https?:\/\//i.test(String(file)) ? await baixar(file) : file
return diablo.message.send(id, { type: 'video', media, mimetype: 'video/mp4', caption }, { quote })
}

const audio = async(id, file, quote = selo) => {
const media = /^https?:\/\//i.test(String(file)) ? await baixar(file) : file
return diablo.message.send(id, { type: 'audio', media, mimetype: 'audio/mpeg', ptt: false }, { quote })
}

const sticker = async(id, file, quote = selo) => {
const media = /^https?:\/\//i.test(String(file)) ? await baixar(file) : file
return diablo.message.send(id, { type: 'sticker', media, mimetype: 'image/webp' }, { quote })
}

const reagir = async(emoji, id = from) => diablo.message.send(id, { type: 'reaction', emoji, target: info })
const mentions = async(teks = '', mb = [], quote = selo) => diablo.message.send(from, { type: 'text', text: teks.trim() }, { quote, mentions: mb })

const mention = async(teks = '', quote = selo) => {
const lista = [...teks.matchAll(/@(\d{6,20})/g)].map(v => `${v[1]}@s.whatsapp.net`)
return diablo.message.send(from, { type: 'text', text: teks.trim() }, { quote, mentions: lista })
}

const mencimg = async(teks = '', file, mb = [], quote = selo) => {
const media = /^https?:\/\//i.test(String(file)) ? await baixar(file) : file
return diablo.message.send(from, { type: 'image', media, mimetype: 'image/jpeg', caption: teks.trim() }, { quote, mentions: mb })
}

const painel = async(opt = {}) => {
const { reaction = '🎉', caption = mess.error(), grupo: soGrupo = false, adm: soAdm = false, dono: soDono = false } = opt

try {
await reagir(reaction).catch(() => {})
if(soGrupo && !grupo) return reply(mess.onlyGroup())
if(soAdm && !admin && !dono) return reply(mess.onlyAdmins())
if(soDono && !dono) return reply(mess.onlyOwner())

const file = midia('fotomenu')
if(file.type === 'video') return diablo.message.send(from, { type: 'video', media: file.data, mimetype: file.mimetype, caption, gifPlayback: true }, { quote: selo })
if(file.type === 'image') return diablo.message.send(from, { type: 'image', media: file.data, mimetype: file.mimetype, caption }, { quote: selo })
return reply(caption)
} catch(e) {
console.log(e)
return reply(caption)
}
}

//=============[ isQuoted/consts ]=============\\

const content = JSON.stringify(m)
const isImage = !!m.imageMessage
const isVideo = !!m.videoMessage
const isAudio = !!m.audioMessage
const isSticker = !!m.stickerMessage
const isContact = !!m.contactMessage
const isLocation = !!m.locationMessage
const isDocument = !!m.documentMessage
const isMedia = isImage || isVideo || isAudio || isSticker || isDocument

const citado = cita.quotedMessage || null
const citadoTxt = JSON.stringify(citado || {})
const isQuotedMsg = !!citado && (!!citado?.conversation || !!citado?.extendedTextMessage)
const isQuotedImage = citadoTxt.includes('imageMessage')
const isQuotedVideo = citadoTxt.includes('videoMessage')
const isQuotedAudio = citadoTxt.includes('audioMessage')
const isQuotedSticker = citadoTxt.includes('stickerMessage')
const isQuotedDocument = citadoTxt.includes('documentMessage')
const isQuotedContact = citadoTxt.includes('contactMessage')
const isQuotedLocation = citadoTxt.includes('locationMessage')

if(!cmd && info.key?.fromMe) return

//=============[ INTERAÇÃO NO TERMUX ]=============\\

const user = chalk.white.bold(nome?.toUpperCase() || 'DESCONHECIDO')
const number = chalk.white(numero(alt || sender) || sender)
const chatType = grupo ? 'GRUPO' : 'PRIVADO'
const groupInfo = grupo ? `(${groupName})` : '(Privado)'

const typeMap = {
cmd: ['COMANDO', chalk.white(`${prefix}${command}`)],
image: ['MÍDIA', '🖼️ IMAGEM'],
video: ['MÍDIA', '🎞️ VÍDEO'],
audio: ['MÍDIA', '🎧 ÁUDIO'],
sticker: ['MÍDIA', '🔖 FIGURINHA'],
document: ['MÍDIA', '📄 DOCUMENTO'],
contact: ['MÍDIA', '👤 CONTATO'],
location: ['MÍDIA', '📍 LOCALIZAÇÃO']
}

const detected = cmd ? 'cmd' : isImage ? 'image' : isVideo ? 'video' : isAudio ? 'audio' : isSticker ? 'sticker' : isDocument ? 'document' : isContact ? 'contact' : isLocation ? 'location' : null
const msgType = detected ? typeMap[detected][0] : 'MENSAGEM'
const msgContent = detected ? typeMap[detected][1] : chalk.white((body || '').slice(0, 50) + ((body || '').length > 50 ? '...' : ''))

console.log(chalk.cyanBright(`╭──. ݁ ⛧ ₊ ⊹ . ݁ ˖ ❆ິ̸ . ݁──╮
|${grupo ? '👥 MENSAGEM NO GRUPO' : '👤 MENSAGEM NO PRIVADO'}
╰──. ݁ ⛧ ₊ ⊹ . ݁ ˖ ❆ິ̸ . ݁──╯
╭──. ݁ ⛧ ₊ ⊹ . ݁ ˖ ❆ິ̸ . ݁──╮
| 👤 USUÁRIO: ${user}
| 📱 NÚMERO: ${number}
| 💬 CHAT: ${chatType} ${groupInfo}
| 📨 TIPO: ${msgType}
| 📝 CONTEÚDO: ${msgContent}
╰──. ݁ ⛧ ₊ ⊹ 🍁 . ݁ ˖ ❆ິ̸ . ݁──╯`))

//=============[ SISTEMAS ]=============\\

if(grupo && dataGp) {
const user = alvo(autor, sender)
const linkgp = /(?:https?:\/\/)?chat\.whatsapp\.com\/[\w-]+/i.test(body)
const link = !linkgp && /(?:https?:\/\/|www\.)[^\s]+|(?:[a-z0-9-]+\.)+(?:com|net|org|gg|io|me|co|br)(?:\/[^\s]*)?/i.test(body)

const punir = async tipo => {
if(admin || dono || !botadm || !user) return false
await diablo.message.send(from, { type: 'text', text: mess.anti(numero(user), tipo) }, { ...(seloEvento ? { quote: seloEvento } : {}), mentions: [user] }).catch(() => {})
await diablo.message.send(from, { type: 'revoke', target: info }).catch(() => {})
await diablo.group.removeParticipants(from, [user]).catch(() => {})
return true
}

if(isAntiImg && isImage && await punir('ɪᴍᴀɢᴇᴍ')) return
if(isAntiAudio && isAudio && await punir('ᴀᴜᴅɪᴏ')) return
if(isAntiSticker && isSticker && await punir('ғɪɢᴜʀɪɴʜᴀ')) return
if(isAntiLinkGp && linkgp && await punir('ʟɪɴᴋ ᴅᴇ ɢʀᴜᴘᴏ')) return
if(isAntiLink && link && await punir('ʟɪɴᴋ')) return
if(So_Adm && cmd && !admin && !dono) return
}

if(cmd && !command) {
return reply(`╭─ ͡┄┄───────ׅ─ׅ─ׅ──ׂ─ׅ──────⟡
╎⋆.°❌ • ᴄᴏᴍᴀɴᴅᴏ ɪɴᴠᴀ́ʟɪᴅᴏ
╎
╎⋆.°📌 • ᴅɪɢɪᴛᴇ ᴜᴍ ᴄᴏᴍᴀɴᴅᴏ ᴀᴘᴏ́s ᴏ *${prefix}*
╎⋆.°📖 • ᴜsᴇ *${prefix}menu* ᴘᴀʀᴀ ᴠᴇʀ ᴏs ᴄᴏᴍᴀɴᴅᴏs
╰─͡┄┄───────ׂ─ׅ───ׂ─ׅ─ׅ──ׅ───⟡`)
}

if(!cmd) return

//=============[ SWITCH ]=============\\

switch(command) {

//=============[ MENUS ]=============\\

case 'menu':
case 'ajuda':
case 'menulista':
case 'listmenu': {
await reagir('🍁').catch(() => {})

const menuFoto = midia('fotomenu')

const secoesMenu = [
{
title: '🍁 PRINCIPAL',
rows: [
{ title: 'Ping', description: 'Ver velocidade e status do bot', id: `${prefix}ping` },
{ title: 'Criador', description: 'Ver informações do criador', id: `${prefix}criador` }
]
},
{
title: '🍁 CATEGORIAS',
rows: [
{ title: 'Downloads', description: 'Abrir comandos de download', id: `${prefix}menudown` },
{ title: 'Administração', description: 'Abrir comandos de administração', id: `${prefix}menuadm` },
{ title: 'Dono', description: 'Abrir comandos exclusivos do dono', id: `${prefix}menudono` }
]
}
]

const card = {
text: `🍁 *${NomeDoBot || 'Diablo Base'}*
│ ├🍁 USUÁRIO — ${nome}
│ ├🍁 CARGO — ${isCargo}

Selecione uma categoria abaixo:`,
footer: 'Diablo Base',
buttons: [
{
type: 'single_select',
title: 'Abrir Menu',
sections: secoesMenu
}
]
}

if(menuFoto.type === 'image') {
card.image = menuFoto.data
card.imageMimetype = menuFoto.mimetype || 'image/jpeg'
}

if(menuFoto.type === 'video') {
card.video = menuFoto.data
card.videoMimetype = menuFoto.mimetype || 'video/mp4'
card.gifPlayback = true
}

try {
// A Zapo modificada é carregada diretamente da pasta ./zapo pela base.
// Portanto este envio é sempre o Menu List dentro de um card de carrossel.
await diablo.message.sendCarousel(from, {
viewOnce: true,
carouselCardType: 1,
cards: [card]
}, { quote: selo })
} catch(e) {
console.log(chalk.red('[ MENU LIST CARROSSEL ] ') + chalk.white(e?.stack || e?.message || e))
return reply(`❌ *Erro ao enviar o Menu List.*\n\n> ${e?.message || String(e)}`)
}
}
break

case 'menuadm':
case 'adm':
await painel({ reaction: '🎉', caption: linguagem.adms(prefix), adm: true })
break

case 'menudown':
case 'downloads':
await painel({ reaction: '🎧', caption: linguagem.menudown(prefix) })
break

case 'menudono':
await painel({ reaction: '👑', caption: linguagem.menudono(prefix), dono: true })
break

//=============[ PING ]=============\\

case 'ping': {
const inicio = process.hrtime.bigint()
await Promise.resolve()

const latencia = Number(process.hrtime.bigint() - inicio) / 1e6
const atraso = (latencia / 1000).toFixed(4)

const up = Math.floor(process.uptime())
const dias = Math.floor(up / 86400)
const horas = Math.floor((up % 86400) / 3600)
const minutos = Math.floor((up % 3600) / 60)
const segundos = up % 60

const tempo = `${dias}d ${horas}h ${minutos}m ${segundos}s`

const total = (os.totalmem() / 1024 ** 3).toFixed(2)
const usada = ((os.totalmem() - os.freemem()) / 1024 ** 3).toFixed(2)

const cpu = os.loadavg()[0].toFixed(2)

await reply(`╭─ ͡┄┄───────ׅ─ׅ─ׅ──ׂ─ׅ──────⟡
╎⋆.°🏃‍♂️ • ᴠᴇʟᴏᴄɪᴅᴀᴅᴇ: *${latencia.toFixed(2)} ms*
╎⋆.°⚡ • ʟᴀᴛᴇ̂ɴᴄɪᴀ: *${latencia.toFixed(2)} ms*
╎⋆.°⌛ • ᴀᴛʀᴀsᴏ: *${atraso} s*
╎⋆.°🧠 • ʀᴀᴍ: *${usada} GB / ${total} GB*
╎⋆.°💻 • ᴄᴘᴜ ʟᴏᴀᴅ: *${cpu}%*
╎⋆.°🖥️ • ɴᴏᴅᴇ: *${process.version}*
╎⋆.°🕰️ • ᴜᴘᴛɪᴍᴇ: *${tempo}*
╰─͡┄┄───────ׂ─ׅ───ׂ─ׅ─ׅ──ׅ───⟡
> — *${NomeDoBot}*`)
}
break

//=============[ CRIADOR ]=============\\

case 'criador':
case 'dono':
case 'owner': {
const n = String(ownerNumber || '').replace(/\D/g, ''), donoNome = ownerName || 'Dylan Modz'
const vcard = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${donoNome}`, `N:${donoNome};;;;`, `TEL;type=CELL;type=VOICE;waid=${n}:+${n}`, 'END:VCARD'].join('\n')
await diablo.message.send(from, { contactMessage: { displayName: donoNome, vcard } }, { quote: selo })
}
break

//=============[ ADMINISTRAÇÃO ]=============\\

case 'ban':
case 'banir':
case 'kick':
case 'avadakedavra': {
if(!grupo) return reply(mess.onlyGroup())
if(!admin && !dono) return reply(mess.onlyAdmins())
if(!botadm) return reply(mess.onlyBotAdmin())
if((!menc_os2 && busca.length <= 6) || menc_jid2[1]) return reply(mess.semMencao())

const membro = achar(groupMembers, marc_tds, mrc_ou_numero, menc_os2)
if(!membro) return reply(mess.naoEncontrado())

const user = alvo(membro, marc_tds || menc_os2)
await diablo.message.send(from, { type: 'text', text: `*@${numero(user)} ғᴏɪ ʀᴇᴍᴏᴠɪᴅᴏ ᴅᴏ ɢʀᴜᴘᴏ.*` }, { quote: selo, mentions: [user] })
await diablo.group.removeParticipants(from, [user])
}
break

case 'promover':
case 'promote': {
if(!grupo) return reply(mess.onlyGroup())
if(!admin && !dono) return reply(mess.onlyAdmins())
if(!botadm) return reply(mess.onlyBotAdmin())
if((!menc_os2 && busca.length <= 6) || menc_jid2[1]) return reply(mess.semMencao())

const membro = achar(groupMembers, marc_tds, mrc_ou_numero, menc_os2)
if(!membro) return reply(mess.naoEncontrado())

const user = alvo(membro, marc_tds || menc_os2)
await diablo.group.promoteParticipants(from, [user])
await diablo.message.send(from, { type: 'text', text: `*@${numero(user)} ғᴏɪ ᴘʀᴏᴍᴏᴠɪᴅᴏ ᴄᴏᴍ sᴜᴄᴇssᴏ.*` }, { quote: selo, mentions: [user] })
}
break

case 'rebaixar':
case 'demote': {
if(!grupo) return reply(mess.onlyGroup())
if(!admin && !dono) return reply(mess.onlyAdmins())
if(!botadm) return reply(mess.onlyBotAdmin())
if((!menc_os2 && busca.length <= 6) || menc_jid2[1]) return reply(mess.semMencao())

const membro = achar(groupMembers, marc_tds, mrc_ou_numero, menc_os2)
if(!membro) return reply(mess.naoEncontrado())

const user = alvo(membro, marc_tds || menc_os2)
await diablo.group.demoteParticipants(from, [user])
await diablo.message.send(from, { type: 'text', text: `*@${numero(user)} ғᴏɪ ʀᴇʙᴀɪxᴀᴅᴏ ᴄᴏᴍ sᴜᴄᴇssᴏ.*` }, { quote: selo, mentions: [user] })
}
break

//=============[ ATIVAÇÕES ]=============\\

case 'bemvindo':
if(!grupo) return reply(mess.onlyGroup())
if(!admin && !dono) return reply(mess.onlyAdmins())
if(!botadm) return reply(mess.onlyBotAdmin())
dataGp[0].wellcome[0].bemvindo1 = !dataGp[0].wellcome[0].bemvindo1
setGp(dataGp)
reply(dataGp[0].wellcome[0].bemvindo1 ? mess.ativo('ʙᴇᴍ-ᴠɪɴᴅᴏ') : mess.inativo('ʙᴇᴍ-ᴠɪɴᴅᴏ'))
break

case 'legendabv':
if(!grupo) return reply(mess.onlyGroup())
if(!admin && !dono) return reply(mess.onlyAdmins())
if(!isWelkom) return reply(`*ᴀᴛɪᴠᴇ ᴏ ${prefix}bemvindo.*`)
if(!q) return reply(`*ᴇxᴇᴍᴘʟᴏ: ${prefix}legendabv ᴏʟᴀ #numerodele#*`)
dataGp[0].wellcome[0].legendabv1 = q.trim() === '0' ? '0' : q
setGp(dataGp)
reply(q.trim() === '0' ? '*ʟᴇɢᴇɴᴅᴀ ᴅᴇ ᴇɴᴛʀᴀᴅᴀ ᴠᴏʟᴛᴏᴜ ᴘᴀʀᴀ ᴀ ᴘᴀᴅʀᴀᴏ.*' : '*ʟᴇɢᴇɴᴅᴀ ᴅᴇ ᴇɴᴛʀᴀᴅᴀ ᴀᴛᴜᴀʟɪᴢᴀᴅᴀ.*')
break

case 'legendasaiu':
if(!grupo) return reply(mess.onlyGroup())
if(!admin && !dono) return reply(mess.onlyAdmins())
if(!isWelkom) return reply(`*ᴀᴛɪᴠᴇ ᴏ ${prefix}bemvindo.*`)
if(!q) return reply(`*ᴇxᴇᴍᴘʟᴏ: ${prefix}legendasaiu ᴀᴛᴇ ʟᴏɢᴏ #numerodele#*`)
dataGp[0].wellcome[0].legendasaiu1 = q.trim() === '0' ? '0' : q
setGp(dataGp)
reply(q.trim() === '0' ? '*ʟᴇɢᴇɴᴅᴀ ᴅᴇ sᴀɪᴅᴀ ᴠᴏʟᴛᴏᴜ ᴘᴀʀᴀ ᴀ ᴘᴀᴅʀᴀᴏ.*' : '*ʟᴇɢᴇɴᴅᴀ ᴅᴇ sᴀɪᴅᴀ ᴀᴛᴜᴀʟɪᴢᴀᴅᴀ.*')
break

case 'fundobv': {
if(!grupo) return reply(mess.onlyGroup())
if(!admin && !dono) return reply(mess.onlyAdmins())
if(!botadm) return reply(mess.onlyBotAdmin())
if(!isWelkom) return reply(`*ᴀᴛɪᴠᴇ ᴏ ${prefix}bemvindo.*`)

if(q.trim() === '0') {
dataGp[0].wellcome[0].fundobv = null
dataGp[0].wellcome[0].fundobv_tipo = null
setGp(dataGp)
return reply('*ғᴜɴᴅᴏ ᴅᴇ ᴇɴᴛʀᴀᴅᴀ ʀᴇᴍᴏᴠɪᴅᴏ. ᴀɢᴏʀᴀ ᴜsᴀ ᴀ ғᴏᴛᴏ ᴅᴏ ᴍᴇᴍʙʀᴏ.*')
}

const fonte = citado || m
const media = fonte?.viewOnceMessage?.message || fonte?.viewOnceMessageV2?.message || fonte
const videoMsg = media?.videoMessage
const imagemMsg = media?.imageMessage
if(!videoMsg && !imagemMsg) return reply('*ʀᴇsᴘᴏɴᴅᴀ ᴜᴍᴀ ғᴏᴛᴏ, ɢɪғ ᴏᴜ ᴠɪᴅᴇᴏ.*')

const tmp = path.join(__dirname, 'dados', 'media', `.bv-${Date.now()}`)
fs.mkdirSync(path.dirname(tmp), { recursive: true })
try {
await diablo.message.downloadToFile(media, tmp)
const buffer = fs.readFileSync(tmp)
dataGp[0].wellcome[0].fundobv = buffer.toString('base64')
dataGp[0].wellcome[0].fundobv_tipo = imagemMsg ? (String(imagemMsg?.mimetype || '').includes('png') ? 'png' : 'image') : 'gif'
setGp(dataGp)
reply(imagemMsg ? '*ғᴏᴛᴏ ᴅᴇ ᴇɴᴛʀᴀᴅᴀ sᴀʟᴠᴀ.*' : '*ɢɪғ/ᴠɪᴅᴇᴏ ᴅᴇ ᴇɴᴛʀᴀᴅᴀ sᴀʟᴠᴏ.*')
} finally { try { fs.unlinkSync(tmp) } catch {} }
}
break

case 'fundosaiu': {
if(!grupo) return reply(mess.onlyGroup())
if(!admin && !dono) return reply(mess.onlyAdmins())
if(!botadm) return reply(mess.onlyBotAdmin())
if(!isWelkom) return reply(`*ᴀᴛɪᴠᴇ ᴏ ${prefix}bemvindo.*`)

if(q.trim() === '0') {
dataGp[0].wellcome[0].fundosaiu = null
dataGp[0].wellcome[0].fundosaiu_tipo = null
setGp(dataGp)
return reply('*ғᴜɴᴅᴏ ᴅᴇ sᴀɪᴅᴀ ʀᴇᴍᴏᴠɪᴅᴏ. ᴀɢᴏʀᴀ ᴜsᴀ ᴀ ғᴏᴛᴏ ᴅᴏ ᴍᴇᴍʙʀᴏ.*')
}

const fonte = citado || m
const media = fonte?.viewOnceMessage?.message || fonte?.viewOnceMessageV2?.message || fonte
const videoMsg = media?.videoMessage
const imagemMsg = media?.imageMessage
if(!videoMsg && !imagemMsg) return reply('*ʀᴇsᴘᴏɴᴅᴀ ᴜᴍᴀ ғᴏᴛᴏ, ɢɪғ ᴏᴜ ᴠɪᴅᴇᴏ.*')

const tmp = path.join(__dirname, 'dados', 'media', `.saiu-${Date.now()}`)
fs.mkdirSync(path.dirname(tmp), { recursive: true })
try {
await diablo.message.downloadToFile(media, tmp)
const buffer = fs.readFileSync(tmp)
dataGp[0].wellcome[0].fundosaiu = buffer.toString('base64')
dataGp[0].wellcome[0].fundosaiu_tipo = imagemMsg ? (String(imagemMsg?.mimetype || '').includes('png') ? 'png' : 'image') : 'gif'
setGp(dataGp)
reply(imagemMsg ? '*ғᴏᴛᴏ ᴅᴇ sᴀɪᴅᴀ sᴀʟᴠᴀ.*' : '*ɢɪғ/ᴠɪᴅᴇᴏ ᴅᴇ sᴀɪᴅᴀ sᴀʟᴠᴏ.*')
} finally { try { fs.unlinkSync(tmp) } catch {} }
}
break

case 'x9adm':
case 'x9':
if(!grupo) return reply(mess.onlyGroup())
if(!admin && !dono) return reply(mess.onlyAdmins())
if(!botadm) return reply(mess.onlyBotAdmin())
dataGp[0].x9 = !dataGp[0].x9; setGp(dataGp)
reply(dataGp[0].x9 ? mess.ativo('x9 ᴀᴅᴍɪɴ') : mess.inativo('x9 ᴀᴅᴍɪɴ'))
break

case 'antiimg':
case 'antiimagem':
if(!grupo) return reply(mess.onlyGroup())
if(!admin && !dono) return reply(mess.onlyAdmins())
if(!botadm) return reply(mess.onlyBotAdmin())
dataGp[0].antiimg = !dataGp[0].antiimg; setGp(dataGp)
reply(dataGp[0].antiimg ? mess.ativo('ᴀɴᴛɪ ɪᴍᴀɢᴇᴍ') : mess.inativo('ᴀɴᴛɪ ɪᴍᴀɢᴇᴍ'))
break

case 'antiaudio':
if(!grupo) return reply(mess.onlyGroup())
if(!admin && !dono) return reply(mess.onlyAdmins())
if(!botadm) return reply(mess.onlyBotAdmin())
dataGp[0].antiaudio = !dataGp[0].antiaudio; setGp(dataGp)
reply(dataGp[0].antiaudio ? mess.ativo('ᴀɴᴛɪ ᴀᴜᴅɪᴏ') : mess.inativo('ᴀɴᴛɪ ᴀᴜᴅɪᴏ'))
break

case 'antisticker':
case 'antifigu':
case 'antifigurinha':
if(!grupo) return reply(mess.onlyGroup())
if(!admin && !dono) return reply(mess.onlyAdmins())
if(!botadm) return reply(mess.onlyBotAdmin())
dataGp[0].antisticker = !dataGp[0].antisticker; setGp(dataGp)
reply(dataGp[0].antisticker ? mess.ativo('ᴀɴᴛɪ ғɪɢᴜʀɪɴʜᴀ') : mess.inativo('ᴀɴᴛɪ ғɪɢᴜʀɪɴʜᴀ'))
break

case 'antilink':
if(!grupo) return reply(mess.onlyGroup())
if(!admin && !dono) return reply(mess.onlyAdmins())
if(!botadm) return reply(mess.onlyBotAdmin())
dataGp[0].antilink = !dataGp[0].antilink; setGp(dataGp)
reply(dataGp[0].antilink ? mess.ativo('ᴀɴᴛɪ ʟɪɴᴋ') : mess.inativo('ᴀɴᴛɪ ʟɪɴᴋ'))
break

case 'antilinkgp':
case 'antilinkgrupo':
if(!grupo) return reply(mess.onlyGroup())
if(!admin && !dono) return reply(mess.onlyAdmins())
if(!botadm) return reply(mess.onlyBotAdmin())
dataGp[0].antilinkgp = !dataGp[0].antilinkgp; setGp(dataGp)
reply(dataGp[0].antilinkgp ? mess.ativo('ᴀɴᴛɪ ʟɪɴᴋ ɢʀᴜᴘᴏ') : mess.inativo('ᴀɴᴛɪ ʟɪɴᴋ ɢʀᴜᴘᴏ'))
break

case 'soadm':
case 'soadmin':
if(!grupo) return reply(mess.onlyGroup())
if(!admin && !dono) return reply(mess.onlyAdmins())
dataGp[0].soadm = !dataGp[0].soadm; setGp(dataGp)
reply(dataGp[0].soadm ? mess.ativo('sᴏ ᴀᴅᴍ') : mess.inativo('sᴏ ᴀᴅᴍ'))
break

//=============[ DONO ]=============\\

case 'verificado': {
if(!dono) return reply(mess.onlyOwner())
const novoEstado = !isVerificado
atualizarSelo(novoEstado)
await reply(novoEstado
? '*✅ ѕᴇʟᴏ ᴠᴇʀɪғɪᴄᴀᴅᴏ ᴀᴛɪᴠᴀᴅᴏ ᴇᴍ ᴛᴏᴅᴏѕ ᴏѕ ᴇɴᴠɪᴏѕ.*'
: '*❌ ѕᴇʟᴏ ᴠᴇʀɪғɪᴄᴀᴅᴏ ᴅᴇѕᴀᴛɪᴠᴀᴅᴏ. ᴏѕ ᴇɴᴠɪᴏѕ ᴠᴏʟᴛᴀᴍ ᴀ ᴄɪᴛᴀʀ ᴀ ᴍᴇɴѕᴀɢᴇᴍ ᴏʀɪɢɪɴᴀʟ.*')
}
break

case 'prefixo':
case 'setprefix':
if(!dono) return reply(mess.onlyOwner())
if(!q || /\s/.test(q) || q.length > 3) return reply(`*ᴇxᴇᴍᴘʟᴏ: ${prefix}prefixo .*`)
prefix = q; setCfg('prefix', q)
reply(`*ᴘʀᴇғɪxᴏ ᴀʟᴛᴇʀᴀᴅᴏ ᴘᴀʀᴀ: ${q}*`)
break

case 'nomedono':
case 'setdono':
if(!dono) return reply(mess.onlyOwner())
if(!q) return reply(`*ᴇxᴇᴍᴘʟᴏ: ${prefix}nomedono Dylan Modz*`)
ownerName = q; setCfg('ownerName', q)
reply(`*ɴᴏᴍᴇ ᴅᴏ ᴅᴏɴᴏ ᴀʟᴛᴇʀᴀᴅᴏ ᴘᴀʀᴀ: ${q}*`)
break

case 'numerodono':
case 'setnumero': {
if(!dono) return reply(mess.onlyOwner())
const n = q.replace(/\D/g, '')
if(n.length < 10) return reply(`*ᴇxᴇᴍᴘʟᴏ: ${prefix}numerodono 5599999999999*`)
ownerNumber = n; setCfg('ownerNumber', n)
reply('*ɴᴜᴍᴇʀᴏ ᴅᴏ ᴅᴏɴᴏ ᴀʟᴛᴇʀᴀᴅᴏ.*')
}
break

case 'fotomenu': {
if(!dono) return reply(mess.onlyOwner())

const fonte = citado || m
const media = fonte?.viewOnceMessage?.message || fonte?.viewOnceMessageV2?.message || fonte
const videoMsg = media?.videoMessage
const imagemMsg = media?.imageMessage
const pasta = path.join(__dirname, 'dados', 'media')
const arquivos = ['fotomenu.mp4', 'fotomenu.png', 'fotomenu.jpg', 'fotomenu.jpeg'].map(v => path.join(pasta, v))
const limpar = () => arquivos.forEach(v => { if(fs.existsSync(v)) fs.unlinkSync(v) })
fs.mkdirSync(pasta, { recursive: true })

if(videoMsg) {
await reagir('⏳').catch(() => {})
limpar()
await diablo.message.downloadToFile(media, path.join(pasta, 'fotomenu.mp4'))
await reagir('✅').catch(() => {})
return reply('*ᴠɪᴅᴇᴏ ᴅᴏ ᴍᴇɴᴜ sᴀʟᴠᴏ.*')
}

if(imagemMsg) {
await reagir('⏳').catch(() => {})
const ext = String(imagemMsg?.mimetype || '').toLowerCase().includes('png') ? 'png' : 'jpg'
limpar()
await diablo.message.downloadToFile(media, path.join(pasta, `fotomenu.${ext}`))
await reagir('✅').catch(() => {})
return reply('*ғᴏᴛᴏ ᴅᴏ ᴍᴇɴᴜ sᴀʟᴠᴀ.*')
}

reply('*ᴍᴀɴᴅᴇ ᴜᴍᴀ ɪᴍᴀɢᴇᴍ/ᴠɪᴅᴇᴏ ᴄᴏᴍ ᴏ ᴄᴏᴍᴀɴᴅᴏ ᴏᴜ ʀᴇsᴘᴏɴᴅᴀ ᴜᴍᴀ ᴍɪᴅɪᴀ.*')
}
break

case 'reiniciar':
case 'restart':
if(!dono) return reply(mess.onlyOwner())
await reply(mess.reiniciando())
setTimeout(() => {
const filho = spawn(process.argv[0], process.argv.slice(1), { detached: true, stdio: 'inherit' })
filho.unref(); process.exit(0)
}, 700)
break

//=============[ DOWNLOADS ]=============\\

case 'play':
case 'ytplay': {
try {
if(!q) return reply(`*ᴇxᴇᴍᴘʟᴏ: ${prefix + command} vem ca*`)
await reply(mess.wait())

const { data } = await axios.get(
`${API_URL}/api/youtube-play?query=${encodeURIComponent(q)}&q=${encodeURIComponent(q)}&apikey=${encodeURIComponent(API_KEY_DIABLO)}`,
{
timeout: 60000,
headers: {
'User-Agent': 'Mozilla/5.0'
}
}
)

if(!data?.status || !data?.resultado?.download)
return reply('*ɴᴀᴏ ᴇɴᴄᴏɴᴛʀᴇɪ ɴᴇɴʜᴜᴍ ᴀᴜᴅɪᴏ.*')

const res = data.resultado
const musica = res.title || 'Áudio'
const canal = res.canal || 'Desconhecido'
const tempo = res.duration || '0:00'
const capa = res.thumbnail || res.thumb || res.image || null

const texto = `*🎧 | ᴘʟᴀʏ ᴀᴜᴅɪᴏ*

- *🎶 | ᴛɪᴛᴜʟᴏ → ${musica}*
- *📺 | ᴄᴀɴᴀʟ → ${canal}*
- *⏱️ | ᴅᴜʀᴀᴄᴀᴏ → ${tempo}*`

if(capa) {
await imagem(from, capa, texto)
} else {
await reply(texto)
}

await audio(from, res.download)

} catch(e) {
console.log(e)
return reply(mess.error())
}
}
break

case 'tiktok': {
try {
if(!q) return reply(`*${prefix + command} ʟɪɴᴋ ᴅᴏ ᴛɪᴋᴛᴏᴋ*`)
await reply(mess.wait())
await video(from, `${API_URL}/api/tiktok-video?url=${encodeURIComponent(q)}&apikey=${encodeURIComponent(API_KEY_DIABLO)}`)
} catch(e) { console.log(e); return reply(mess.error()) }
}
break

case 'instagram':
case 'insta': {
try {
if(!q) return reply(`*${prefix + command} ʟɪɴᴋ ᴅᴏ ɪɴsᴛᴀɢʀᴀᴍ*`)
await reply(mess.wait())
await video(from, `${API_URL}/api/insta-video?url=${encodeURIComponent(q)}&apikey=${encodeURIComponent(API_KEY_DIABLO)}`)
} catch(e) { console.log(e); return reply(mess.error()) }
}
break

case 'kwai':
case 'kwaivideo': {
try {
if(!q) return reply(`*${prefix + command} ʟɪɴᴋ ᴅᴏ ᴋᴡᴀɪ*`)
await reply(mess.wait())
await video(from, `${API_URL}/api/kwai-video?url=${encodeURIComponent(q)}&apikey=${encodeURIComponent(API_KEY_DIABLO)}`)
} catch(e) { console.log(e); return reply(mess.error()) }
}
break

case 'kwaiaudio': {
try {
if(!q) return reply(`*${prefix + command} ʟɪɴᴋ ᴅᴏ ᴋᴡᴀɪ*`)
await reply(mess.wait())
await audio(from, `${API_URL}/api/kwai-audio?url=${encodeURIComponent(q)}&apikey=${encodeURIComponent(API_KEY_DIABLO)}`)
} catch(e) { console.log(e); return reply(mess.error()) }
}
break

case 'facebook':
case 'fb': {
try {
if(!q) return reply(`*${prefix + command} ʟɪɴᴋ ᴅᴏ ғᴀᴄᴇʙᴏᴏᴋ*`)
await reply(mess.wait())
await video(from, `${API_URL}/api/facebook?url=${encodeURIComponent(q)}&apikey=${encodeURIComponent(API_KEY_DIABLO)}`)
} catch(e) { console.log(e); return reply(mess.error()) }
}
break

}

//=============[ FIM ]=============\\

}

//=============[ ATUALIZAÇÃO ]=============\\

fs.watchFile(require.resolve(__filename), { interval: 1000 }, () => {
fs.unwatchFile(require.resolve(__filename))
console.log(chalk.blue(`Alterações salvas, carregando novamente: '${__filename}'`))
delete require.cache[require.resolve(__filename)]
})

module.exports = startdiablo
