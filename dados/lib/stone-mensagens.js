'use strict'

const fs = require('fs/promises')

function entradaMidia(media) {
  if (Buffer.isBuffer(media) || media instanceof Uint8Array) return Buffer.from(media)
  if (typeof media === 'string') return { url: media }
  if (media && typeof media.pipe === 'function') return { stream: media }
  return media
}

function preparar(input, mentions = []) {
  if (typeof input === 'string') return { text: input, ...(mentions.length ? { mentions } : {}) }
  if (!input || typeof input !== 'object') throw new Error('Conteudo de mensagem invalido')
  const { type, media, target, emoji, ...rest } = input
  if (type === 'reaction') {
    if (!target?.key) throw new Error('Reacao sem chave da mensagem')
    return { react: { text: emoji, key: target.key } }
  }
  if (type === 'revoke') {
    if (!target?.key) throw new Error('Mensagem sem chave para excluir')
    return { delete: target.key }
  }
  if (type === 'text') {
    return { ...rest, text: String(input.text || ' '), ...(mentions.length ? { mentions } : {}) }
  }
  if (['image', 'video', 'audio', 'sticker', 'document'].includes(type)) {
    return { ...rest, [type]: entradaMidia(media), ...(mentions.length ? { mentions } : {}) }
  }
  if (input.contactMessage) {
    return { contacts: { displayName: input.contactMessage.displayName || '',
      contacts: [input.contactMessage] } }
  }
  return { ...input, ...(mentions.length ? { mentions } : {}) }
}

function separar(opcoes = {}) {
  const { quote, quoted, mentions, ...outras } = opcoes
  return {
    options: { ...outras, ...((quoted || quote) ? { quoted: quoted || quote } : {}) },
    mentions: Array.isArray(mentions) ? mentions : []
  }
}

function criarMensageiro(stone) {
  if (typeof stone?.sendMessage !== 'function') throw new Error('Socket Stone sem sendMessage')

  async function enviar(jid, conteudo, opcoes = {}) {
    const { options, mentions } = separar(opcoes)
    return stone.sendMessage(jid, preparar(conteudo, mentions), options)
  }

  async function enviarMenu(jid, entrada, opcoes = {}) {
    const card = entrada?.cards?.[0]
    if (!card) throw new Error('O menu precisa de um card')
    const conteudo = {
      interactive: true,
      text: card.text || '',
      footer: card.footer || '',
      buttons: card.buttons || [],
      viewOnce: entrada?.viewOnce === true
    }
    if (card.image) {
      conteudo.image = entradaMidia(card.image)
      conteudo.mimetype = card.imageMimetype || 'image/jpeg'
    } else if (card.video) {
      conteudo.video = entradaMidia(card.video)
      conteudo.mimetype = card.videoMimetype || 'video/mp4'
      conteudo.gifPlayback = card.gifPlayback === true
    }
    const { options, mentions } = separar(opcoes)
    if (mentions.length) conteudo.mentions = mentions
    return stone.sendMessage(jid, conteudo, options)
  }

  async function baixarMidia(conteudo, caminho) {
    const { downloadMediaMessage } = await import('@stone-wpp/ofc')
    const mensagem = conteudo?.message ? conteudo :
      { key: { remoteJid: '' }, message: conteudo }
    const buffer = await downloadMediaMessage(mensagem, 'buffer', {})
    await fs.writeFile(caminho, buffer)
    return caminho
  }

  return { enviar, enviarMenu, baixarMidia }
}

module.exports = { criarMensageiro }
