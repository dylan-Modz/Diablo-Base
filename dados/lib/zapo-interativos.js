'use strict'

// Compatibilidade dos menus interativos da Diablo Base com zapo-js.
// Sem alterar arquivos internos da biblioteca instalada por npm.
const path = require('path')
const { buildMediaMessageContent } = require(
  path.join(path.dirname(require.resolve('zapo-js')), 'client', 'messaging', 'messages.js')
)

function stringifyInteractiveParams(value) {
    if (typeof value === 'string')
        return value;
    if (value === undefined || value === null)
        return '{}';
    return JSON.stringify(value);
}
function normalizeInteractiveButton(button) {
    if (!button || typeof button !== 'object') {
        throw new Error('interactive button must be an object');
    }
    if (button.name) {
        const raw = button.buttonParamsJson ?? button.buttonParamsJSON ?? button.paramsJson ?? button.params ?? {};
        return {
            name: String(button.name),
            buttonParamsJson: stringifyInteractiveParams(raw)
        };
    }
    const type = String(button.type ?? 'reply').toLowerCase();
    const displayText = String(button.displayText ?? button.text ?? button.title ?? 'Selecionar');
    if (type === 'reply' || type === 'quick_reply' || type === 'quick') {
        return {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: displayText, id: String(button.id ?? button.value ?? '') })
        };
    }
    if (type === 'url' || type === 'link' || type === 'cta_url' || type === 'newsletter' || type === 'channel') {
        const url = String(button.url ?? button.link ?? '');
        return {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
                display_text: displayText,
                url,
                ...(button.merchantUrl === false ? {} : { merchant_url: String(button.merchantUrl ?? url) })
            })
        };
    }
    if (type === 'call' || type === 'cta_call') {
        return {
            name: 'cta_call',
            buttonParamsJson: JSON.stringify({ display_text: displayText, phone_number: String(button.phoneNumber ?? button.number ?? button.id ?? '') })
        };
    }
    if (type === 'copy' || type === 'cta_copy') {
        return {
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({ display_text: displayText, copy_code: String(button.copyCode ?? button.code ?? button.id ?? '') })
        };
    }
    if (type === 'list' || type === 'single_select' || type === 'select') {
        return {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
                title: String(button.title ?? button.text ?? 'Menu'),
                sections: Array.isArray(button.sections) ? button.sections : []
            })
        };
    }
    if (type === 'catalog' || type === 'cta_catalog') {
        return {
            name: 'cta_catalog',
            buttonParamsJson: JSON.stringify({
                ...(button.displayText || button.text ? { display_text: displayText } : {}),
                ...(button.businessPhoneNumber ? { business_phone_number: String(button.businessPhoneNumber) } : {})
            })
        };
    }
    if (type === 'location' || type === 'send_location') {
        return {
            name: 'send_location',
            buttonParamsJson: JSON.stringify({ display_text: displayText })
        };
    }
    const params = button.params ?? button.buttonParamsJson ?? button.buttonParamsJSON ?? {};
    return { name: type, buttonParamsJson: stringifyInteractiveParams(params) };
}
function normalizeInteractiveButtons(buttons) {
    return (Array.isArray(buttons) ? buttons : []).map(normalizeInteractiveButton);
}
function normalizeListSections(sections) {
    return (Array.isArray(sections) ? sections : []).map((section) => ({
        title: section?.title == null ? undefined : String(section.title),
        rows: (Array.isArray(section?.rows) ? section.rows : []).map((row) => ({
            title: String(row?.title ?? ''),
            description: row?.description == null ? undefined : String(row.description),
            rowId: String(row?.rowId ?? row?.id ?? '')
        }))
    }));
}
function buildLegacyListMessage(input) {
    if (!input || typeof input !== 'object')
        throw new Error('list input must be an object');
    return {
        title: input.title == null ? undefined : String(input.title),
        description: String(input.description ?? input.text ?? input.body ?? ''),
        buttonText: String(input.buttonText ?? input.button ?? 'Selecionar'),
        listType: input.listType ?? 1,
        sections: normalizeListSections(input.sections),
        footerText: input.footer == null ? (input.footerText == null ? undefined : String(input.footerText)) : String(input.footer)
    };
}
async function buildInteractiveHeader(coordinator, input) {
    const header = {
        ...(input.title == null ? {} : { title: String(input.title) }),
        ...(input.subtitle == null ? {} : { subtitle: String(input.subtitle) }),
        hasMediaAttachment: false
    };
    if (input.imageMessage) {
        header.imageMessage = input.imageMessage;
        header.hasMediaAttachment = true;
    }
    else if (input.image !== undefined) {
        const mimetype = String(input.imageMimetype ?? input.mimetype ?? 'image/jpeg');
        // Use the exact same media builder used by message.send(). This keeps
        // thumbnail/dimensions and every upload field compatible with Zapo.
        const built = await (0, buildMediaMessageContent)(coordinator.mediaUploadOptions, {
            type: 'image',
            media: input.image,
            mimetype
        });
        if (!built?.message?.imageMessage)
            throw new Error('failed to build interactive image header');
        header.imageMessage = built.message.imageMessage;
        header.hasMediaAttachment = true;
    }
    else if (input.videoMessage) {
        header.videoMessage = input.videoMessage;
        header.hasMediaAttachment = true;
    }
    else if (input.video !== undefined) {
        const mimetype = String(input.videoMimetype ?? input.mimetype ?? 'video/mp4');
        // IMPORTANT: gifPlayback must go through Zapo's normal media pipeline.
        // That switches the crypto/upload domain from "video" to "gif", creates
        // the streaming sidecar and probes the media, exactly like Diablo V8.
        const built = await (0, buildMediaMessageContent)(coordinator.mediaUploadOptions, {
            type: 'video',
            media: input.video,
            mimetype,
            ...(input.gifPlayback === true ? { gifPlayback: true } : {})
        });
        if (!built?.message?.videoMessage)
            throw new Error('failed to build interactive video header');
        header.videoMessage = built.message.videoMessage;
        header.hasMediaAttachment = true;
    }
    else if (input.documentMessage) {
        header.documentMessage = input.documentMessage;
        header.hasMediaAttachment = true;
    }
    return header;
}
async function buildInteractiveMessage(coordinator, input) {
    if (!input || typeof input !== 'object')
        throw new Error('interactive input must be an object');
    const header = await buildInteractiveHeader(coordinator, input);
    const bodyText = input.text ?? input.body ?? input.description;
    const footerText = input.footer ?? input.footerText;
    const buttons = normalizeInteractiveButtons(input.buttons ?? input.interactiveButtons);
    const message = {
        header,
        ...(bodyText == null ? {} : { body: { text: String(bodyText) } }),
        ...(footerText == null ? {} : { footer: { text: String(footerText) } }),
        nativeFlowMessage: {
            buttons,
            messageParamsJson: stringifyInteractiveParams(input.messageParamsJson ?? ''),
            messageVersion: input.messageVersion ?? 1
        }
    };
    if (input.contextInfo)
        message.contextInfo = input.contextInfo;
    return message;
}
async function buildCarouselMessage(coordinator, input) {
    if (!input || typeof input !== 'object')
        throw new Error('carousel input must be an object');
    const cards = Array.isArray(input.cards) ? input.cards : [];
    if (cards.length === 0)
        throw new Error('carousel requires at least one card');
    const builtCards = [];
    for (const card of cards) {
        builtCards.push(await buildInteractiveMessage(coordinator, card));
    }
    const header = await buildInteractiveHeader(coordinator, input);
    const bodyText = input.text ?? input.body ?? input.description;
    const footerText = input.footer ?? input.footerText;
    const message = {
        header,
        ...(bodyText == null ? {} : { body: { text: String(bodyText) } }),
        ...(footerText == null ? {} : { footer: { text: String(footerText) } }),
        carouselMessage: {
            cards: builtCards,
            messageVersion: input.messageVersion ?? 1,
            carouselCardType: input.carouselCardType ?? 1
        }
    };
    if (input.contextInfo)
        message.contextInfo = input.contextInfo;
    return message;
}


function instalarInterativos(client) {
    const message = client?.message;
    if (!message || typeof message.send !== 'function') {
        throw new Error('[DIABLO] A Zapo nao disponibilizou o envio de mensagens.');
    }

    if (typeof message.sendInteractive !== 'function') {
        message.sendInteractive = async function (to, input, options = {}) {
            const interactiveMessage = await buildInteractiveMessage(this, input);
            return this.send(to, { interactiveMessage }, {
                ...options,
                viewOnce: input?.viewOnce === true || options?.viewOnce === true
            });
        };
    }

    if (typeof message.sendButtons !== 'function') {
        message.sendButtons = function (to, input, options = {}) {
            return this.sendInteractive(to, input, options);
        };
    }

    if (typeof message.sendList !== 'function') {
        message.sendList = function (to, input, options = {}) {
            return this.send(to, { listMessage: buildLegacyListMessage(input) }, options);
        };
    }

    if (typeof message.sendCarousel !== 'function') {
        message.sendCarousel = async function (to, input, options = {}) {
            const interactiveMessage = await buildCarouselMessage(this, input);
            return this.send(to, { interactiveMessage }, {
                ...options,
                viewOnce: input?.viewOnce === true || options?.viewOnce === true
            });
        };
    }
}

module.exports = { instalarInterativos }
