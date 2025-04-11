// API endpoints
const STATS_API = 'https://ecqmg2u8t0.execute-api.us-east-1.amazonaws.com/prod/stats';
const HISTORY_API = 'https://ecqmg2u8t0.execute-api.us-east-1.amazonaws.com/prod/history';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Function to format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
}

// Function to handle fetch with retries
async function fetchWithRetry(url, retries = MAX_RETRIES) {
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return fetchWithRetry(url, retries - 1);
        }
        throw error;
    }
}

// Function to update statistics
async function updateStats() {
    const totalElement = document.getElementById('total-translations');
    const languageElement = document.getElementById('top-language');
    
    totalElement.textContent = 'Loading...';
    languageElement.textContent = 'Loading...';
    
    try {
        const data = await fetchWithRetry(STATS_API);
        totalElement.textContent = data.totalTranslations;
        languageElement.textContent = data.topLanguage.toUpperCase();
    } catch (error) {
        console.error('Error fetching stats:', error);
        totalElement.textContent = 'Error';
        languageElement.textContent = 'Error';
    }
}

// Auto refresh interval (in milliseconds)
const REFRESH_INTERVAL = 30000; // 30 seconds

// Initialize dashboard
function initDashboard() {
    updateStats();
    updateHistory();
    
    // Set up auto-refresh
    setInterval(() => {
        updateStats();
        updateHistory();
    }, REFRESH_INTERVAL);
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initDashboard);

// Function to update translation history
async function updateHistory() {
    const tableBody = document.getElementById('history-table-body');
    tableBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    
    try {
        const data = await fetchWithRetry(HISTORY_API);
        tableBody.innerHTML = '';
        
        if (!data.history || data.history.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">No translation history available</td></tr>';
            return;
        }
        
        // Sort history in descending order by timestamp
        const sortedHistory = data.history.sort((a, b) => b.timestamp - a.timestamp);
        
        sortedHistory.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.original || 'N/A'}</td>
                <td>${item.translated || 'N/A'}</td>
                <td>${(item.target_lang || 'N/A').toUpperCase()}</td>
                <td>${formatTimestamp(item.timestamp)}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        tableBody.innerHTML = '<tr><td colspan="4">Error loading data</td></tr>';
    }
}

// Theme toggle functionality
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeText = document.getElementById('theme-text');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Set initial theme and text
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeText.textContent = savedTheme === 'light' ? 'Dark Mode' : 'Light Mode';
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeText.textContent = newTheme === 'light' ? 'Dark Mode' : 'Light Mode';
    });
}

// Initial load
updateStats();
updateHistory();
initTheme();

// Refresh data every 30 seconds
setInterval(() => {
    updateStats();
    updateHistory();
}, 30000);