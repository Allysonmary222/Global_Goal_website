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
const lastUpdate = document.getElementById('lastUpdate');
const goalBanner = document.getElementById('goalBanner');
const goalCount = document.getElementById('goalCount');
const totalCount = document.getElementById('totalCount');
const goalCountStat = document.getElementById('goalCountStat');
const countryCount = document.getElementById('countryCount');
const sourceCount = document.getElementById('sourceCount');
const filterBtns = document.querySelectorAll('.filter-btn');

// ============================================
// RSS PARSER
// ============================================
function parseRSS(xmlText, sourceKey) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    if (xmlDoc.querySelector('parsererror')) {
        throw new Error('Invalid RSS feed');
    }

    const items = xmlDoc.querySelectorAll('item');
    const articles = [];

    items.forEach(item => {
        const title = item.querySelector('title')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '#';
        const description = item.querySelector('description')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const author = item.querySelector('creator')?.textContent || '';
        
        if (!title && !description) return;

        // Clean description
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = description;
        const cleanSummary = (tempDiv.textContent || tempDiv.innerText || '')
            .replace(/\s+/g, ' ')
            .trim();
        const summary = cleanSummary.length > 400 
            ? cleanSummary.slice(0, 400) + '...' 
            : cleanSummary;

        // Detect if goal-related
        const isGoal = detectGoal(title + ' ' + summary);

        articles.push({
            id: link + Date.now(),
            title: title,
            link: link,
            summary: summary,
            published: pubDate,
            author: author,
            source: RSS_FEEDS[sourceKey].name,
            icon: RSS_FEEDS[sourceKey].icon,
            country: RSS_FEEDS[sourceKey].country,
            language: RSS_FEEDS[sourceKey].language,
            isGoal: isGoal,
            sourceKey: sourceKey
        });
    });

    return articles;
}

// ============================================
// GOAL DETECTION
// ============================================
function detectGoal(text) {
    const lowerText = text.toLowerCase();
    for (const keyword of GOAL_KEYWORDS) {
        if (lowerText.includes(keyword.toLowerCase())) {
            return true;
        }
    }
    return false;
}

// ============================================
// FETCH NEWS
// ============================================
async function fetchFeed(sourceKey) {
    const feed = RSS_FEEDS[sourceKey];
    const url = CONFIG.CORS_PROXY + encodeURIComponent(feed.url);
    
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/rss+xml, application/xml, text/xml'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const xmlText = await response.text();
        return parseRSS(xmlText, sourceKey);
    } catch (error) {
        console.error(`Error fetching ${feed.name}:`, error);
        return [];
    }
}

async function fetchAllNews() {
    if (isFetching) return;
    
    isFetching = true;
    refreshBtn.classList.add('spinning');
    refreshBtn.disabled = true;
    
    loading.classList.remove('hidden');
    newsGrid.innerHTML = '';
    errorMessage.classList.add('hidden');
    noResults.classList.add('hidden');
    goalBanner.classList.add('hidden');

    try {
        const feedKeys = Object.keys(RSS_FEEDS);
        const feedPromises = feedKeys.map(key => fetchFeed(key));
        const results = await Promise.all(feedPromises);
        
        const allArticlesFlat = results.flat();
        const seen = new Set();
        allArticles = allArticlesFlat.filter(article => {
            if (seen.has(article.link)) return false;
            seen.add(article.link);
            return true;
        });

        // Sort by date (newest first)
        allArticles.sort((a, b) => {
            try {
                return new Date(b.published) - new Date(a.published);
            } catch {
                return 0;
            }
        });

        // Limit articles
        if (allArticles.length > CONFIG.MAX_ARTICLES) {
            allArticles = allArticles.slice(0, CONFIG.MAX_ARTICLES);
        }

        // Update stats
        updateStats();

        // Show goal banner if there are goals
        const goalArticles = allArticles.filter(a => a.isGoal);
        if (goalArticles.length > 0) {
            goalBanner.classList.remove('hidden');
            goalCount.textContent = `${goalArticles.length} new goals!`;
        }

        // Update timestamp
        const now = new Date();
        lastUpdate.textContent = `⏰ Updated: ${now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        })}`;

        renderArticles();

    } catch (error) {
        console.error('Error fetching news:', error);
        errorMessage.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
        isFetching = false;
        refreshBtn.classList.remove('spinning');
        refreshBtn.disabled = false;
    }
}

// ============================================
// UPDATE STATS
// ============================================
function updateStats() {
    const total = allArticles.length;
    const goals = allArticles.filter(a => a.isGoal).length;
    const countries = new Set(allArticles.map(a => a.country));
    const sources = new Set(allArticles.map(a => a.source));

    totalCount.textContent = total;
    goalCountStat.textContent = goals;
    countryCount.textContent = countries.size;
    sourceCount.textContent = sources.size;
}

// ============================================
// RENDER ARTICLES
// ============================================
function renderArticles() {
    let filtered = allArticles;

    if (currentFilter !== 'all') {
        filtered = allArticles.filter(a => 
            a.country.toLowerCase() === currentFilter.toLowerCase()
        );
    }

    if (filtered.length === 0) {
        newsGrid.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');

    // Sort: Goals first, then by date
    filtered.sort((a, b) => {
        if (a.isGoal && !b.isGoal) return -1;
        if (!a.isGoal && b.isGoal) return 1;
        try {
            return new Date(b.published) - new Date(a.published);
        } catch {
            return 0;
        }
    });

    newsGrid.innerHTML = filtered.map((article, index) => {
        const date = formatDate(article.published);
        const goalClass = article.isGoal ? 'goal-alert' : '';
        const goalTag = article.isGoal ? '<span class="news-goal-tag">⚽ GOAL!</span>' : '';
        
        return `
            <div class="news-card ${goalClass}" style="animation-delay: ${index * 0.05}s">
                <div class="news-card-header">
                    <span class="news-source-icon">${article.icon}</span>
                    <span class="news-source-name">${article.source}</span>
                    <span class="news-country">${article.country}</span>
                    <span class="news-date">${date}</span>
                </div>
                <div class="news-card-body">
                    <h2 class="news-title">${escapeHtml(article.title)}</h2>
                    <p class="news-summary">${escapeHtml(article.summary)}</p>
                </div>
                <div class="news-card-footer">
                    <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="news-link">
                        Read Full Article
                    </a>
                    ${goalTag}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date)) return 'Just now';
        
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        if (diffMins < 43200) return `${Math.floor(diffMins / 1440)}d ago`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    } catch {
        return 'Just now';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// FILTER HANDLING
// ============================================
function setFilter(filter) {
    currentFilter = filter;
    
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.country === filter);
    });
    
    renderArticles();
}

// ============================================
// REFRESH
// ============================================
function refreshPage() {
    window.location.reload();
}

// ============================================
// EVENT LISTENERS
// ============================================
refreshBtn.addEventListener('click', fetchAllNews);
setInterval(fetchAllNews, CONFIG.REFRESH_INTERVAL);

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    fetchAllNews();
});

window.addEventListener('online', () => {
    console.log('🔄 Back online, refreshing...');
    fetchAllNews();
});

console.log('⚽ Goal Alert Aggregator loaded successfully!');
console.log(`📰 ${Object.keys(RSS_FEEDS).length} news sources configured`);
console.log(`🌍 ${new Set(Object.values(RSS_FEEDS).map(f => f.country)).size} countries covered`);
