export const BROKER_AFFILIATE_LINKS = {
    'pocket-option': {
        name: 'Pocket Option',
        link: 'https://u3.shortink.io/register?utm_campaign=838785&utm_source=affiliate&utm_medium=sr&a=WL4B2hOP0UMPKp&ac=zenmodetrades&code=WELCOME50',
        isActive: true
    },
    'quotex': {
        name: 'Quotex',
        link: 'https://quotex.com/register',
        isActive: false
    },
    'iq-option': {
        name: 'IQ Option',
        link: 'https://iqoption.com/register',
        isActive: false
    },
};

export type BrokerPlatform = keyof typeof BROKER_AFFILIATE_LINKS;

export const getAffiliateLink = (platform: string): string | null => {
    const broker = BROKER_AFFILIATE_LINKS[platform as BrokerPlatform];
    return broker?.isActive ? broker.link : null;
};
