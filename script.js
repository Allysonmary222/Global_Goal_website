// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    CORS_PROXY: 'https://api.allorigins.win/raw?url=',
    REFRESH_INTERVAL: 300000, // 5 minutes
    MAX_ARTICLES: 50,
};

const RSS_FEEDS = {
    // Brazil
    globo_esporte: {
        url: 'https://ge.globo.com/rss/',
        name: 'Globo Esporte',
        icon: '🇧🇷',
        country: 'Brazil',
        language: 'Portuguese'
    },
    lance: {
        url: 'https://www.lance.com.br/feed/',
        name: 'Lance!',
        icon: '🇧🇷',
        country: 'Brazil',
        language: 'Portuguese'
    },
    uol_esporte: {
        url: 'https://esporte.uol.com.br/feed/',
        name: 'UOL Esporte',
        icon: '🇧🇷',
        country: 'Brazil',
        language: 'Portuguese'
    },
    // Portugal
    ojogo: {
        url: 'https://www.ojogo.pt/feed/',
        name: 'O Jogo',
        icon: '🇵🇹',
        country: 'Portugal',
        language: 'Portuguese'
    },
    record: {
        url: 'https://www.record.pt/rss/',
        name: 'Record',
        icon: '🇵🇹',
        country: 'Portugal',
        language: 'Portuguese'
    },
    abola: {
        url: 'https://www.abola.pt/rss/',
        name: 'A Bola',
        icon: '🇵🇹',
        country: 'Portugal',
        language: 'Portuguese'
    },
    // China
    sina_sports: {
        url: 'https://sports.sina.com.cn/',
        name: 'Sina Sports',
        icon: '🇨🇳',
        country: 'China',
        language: 'Chinese'
    },
    '163_sports': {
        url: 'https://sports.163.com/',
        name: '163 Sports',
        icon: '🇨🇳',
        country: 'China',
        language: 'Chinese'
    },
    // UK
    bbc_sport: {
        url: 'https://feeds.bbci.co.uk/sport/football/rss.xml',
        name: 'BBC Sport',
        icon: '🇬🇧',
        country: 'UK',
        language: 'English'
    },
    sky_sports: {
        url: 'https://www.skysports.com/rss/12040',
        name: 'Sky Sports',
        icon: '🇬🇧',
        country: 'UK',
        language: 'English'
    },
    // Spain
    marca: {
        url: 'https://www.marca.com/rss/',
        name: 'Marca',
        icon: '🇪🇸',
        country: 'Spain',
        language: 'Spanish'
    },
    as: {
        url: 'https://as.com/rss/',
        name: 'AS',
        icon: '🇪🇸',
        country: 'Spain',
        language: 'Spanish'
    },
    // Italy
    gazzetta: {
        url: 'https://www.gazzetta.it/feed/',
        name: 'La Gazzetta',
        icon: '🇮🇹',
        country: 'Italy',
        language: 'Italian'
    },
    // France
    lequipe: {
        url: 'https://www.lequipe.fr/rss/',
        name: "L'Équipe",
        icon: '🇫🇷',
        country: 'France',
        language: 'French'
    },
    // Germany
    kicker: {
        url: 'https://www.kicker.de/rss/',
        name: 'Kicker',
        icon: '🇩🇪',
        country: 'Germany',
        language: 'German'
    },
    // Argentina
    ole: {
        url: 'https://www.ole.com.ar/rss/',
        name: 'Olé',
        icon: '🇦🇷',
        country: 'Argentina',
        language: 'Spanish'
    },
    // Global
    goal: {
        url: 'https://www.goal.com/en-ng/news',
        name: 'Goal',
        icon: '⚽',
        country: 'Global',
        language: 'English'
    },
    espn: {
        url: 'https://www.espn.com/espn/rss/soccer/news',
        name: 'ESPN FC',
        icon: '📺',
        country: 'Global',
        language: 'English'
    }
};

const GOAL_KEYWORDS = [
    'goal', 'gol', '进球', '得分', 'target', 'score',
    '⚽', 'goal!', 'GOAL', 'GOL', '进球!', 'scored',
    'net', 'header', 'penalty', 'free-kick', 'equalizer'
];

// ============================================
// STATE
// ============================================
let allArticles = [];
let currentFilter = 'all';
let isFetching = false;
let sentLinks = new Set();

// ============================================
// DOM REFERENCES
// ============================================
const newsGrid = document.getElementById('newsGrid');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const noResults = document.getElementById('noResults');
const refreshBtn = document.getElementById('refreshBtn');
const
