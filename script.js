// CONFIGURATION
//const AVAILABLE_TAGS = ['AI', 'Health', 'Finance', 'Science', 'IT'];
const AVAILABLE_TAGS = ["Frontend/UI", "Backend/DevOps", "Science", "AI", "Health", "IT", "Finance", "Career", "Other"]
const CARDS_PER_PAGE = 9; 

// State Variables
let allCardsData = []; 
let filteredCards = []; 
let displayedCount = 0; 
let activeTag = 'All';
let activeDate = null; // null = all time, string = YYYY-MM-DD

document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    setupDateControls();
    createFilterButtons();
    
    // --- DATA LOADING ---
    // Option A: Simulated Data (Generates data for Today/Yesterday automatically)
    //allCardsData = await loadSimulatedData(); 
    
    // Option B: Real Files (Requires local server)
    allCardsData = await loadRealFiles();

    // Remove duplicates
    allCardsData = removeDuplicates(allCardsData);
    
    // Initial Filter Apply
    applyFilters();
    setupInfiniteScroll();
}

// 1. DATE CONTROLS SETUP
function setupDateControls() {
    const dateInput = document.getElementById('date-filter');
    const clearBtn = document.getElementById('clear-date-btn');

    // Default to All
    const today = new Date().toISOString().split('T')[0];
    activeDate = null;
    // Default to Today
    //dateInput.value = today;
    //activeDate = today;

    // Listen for changes
    dateInput.addEventListener('change', (e) => {
        activeDate = e.target.value; // e.target.value is YYYY-MM-DD or empty
        if (!activeDate) activeDate = null;
        applyFilters();
    });

    // Clear Button
    clearBtn.addEventListener('click', () => {
        dateInput.value = '';
        activeDate = null; // Show all
        applyFilters();
    });
}

// 2. FILTERING LOGIC
function applyFilters() {
    displayedCount = 0;
    const grid = document.getElementById('card-grid');
    const noResults = document.getElementById('no-results');
    grid.innerHTML = ''; 

    // Filter Logic: Intersection of Tag AND Date
    filteredCards = allCardsData.filter(card => {
        const matchesTag = (activeTag === 'All') || card.tags.includes(activeTag);
        const matchesDate = !activeDate || (card.date === activeDate);
        return matchesTag && matchesDate;
    });

    // Handle Empty State
    if(filteredCards.length === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        loadMoreCards();
    }
}

function createFilterButtons() {
    const container = document.getElementById('filter-container');
    const tags = ['All', ...AVAILABLE_TAGS];

    tags.forEach(tag => {
        const btn = document.createElement('button');
        btn.textContent = tag;
        btn.className = 'filter-btn';
        if(tag === 'All') btn.classList.add('active');
        
        btn.onclick = () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTag = tag;
            applyFilters();
        };
        container.appendChild(btn);
    });
}

// 3. LOAD DATA (Simulated)
async function loadSimulatedData() {
    const data = [];
    const domains = ['wired.com', 'techcrunch.com', 'bloomberg.com', 'nature.com', 'github.com'];
    
    // Helper: get YYYY-MM-DD for X days ago
    const getDateDaysAgo = (days) => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.toISOString().split('T')[0];
    };

    // Generate 20 dummy cards
    for(let i=0; i<20; i++) { 
        const randomTags = AVAILABLE_TAGS.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);
        const domain = domains[Math.floor(Math.random() * domains.length)];
        
        // Random Date Logic:
        // We want to ensure there is data for "Today" (0 days ago) so the default view isn't empty.
        let dateStr;
        const r = Math.random() * 10;
        
        if(r < 3) {
            dateStr = getDateDaysAgo(0); // 30% chance of Today
        } else if (r < 5) {
            dateStr = getDateDaysAgo(1); // 20% chance of Yesterday
        } else {
            dateStr = getDateDaysAgo(Math.floor(Math.random() * 30) + 2); // Random past 30 days
        }

        data.push({
            url: `https://${domain}/article/insight-${i}`,
            summary: [
                `Analysis of ${domain} reporting on recent trends.`,
                `Key statistical data points retrieved on ${dateStr}.`,
                `Summary of impact on ${randomTags.join(' and ')} sector.`
            ],
            date: dateStr,
            tags: randomTags
        });
    }
    return new Promise(resolve => setTimeout(() => resolve(data), 300));
}

// 4. LOAD REAL FILES (Optional)
async function loadRealFiles() {
    let combinedData = [];
    //const promises = AVAILABLE_TAGS.map(tag => 
    //    fetch(`./data/${tag.toLowerCase()}.json`) 
    //        .then(res => res.ok ? res.json() : [])
    //        .catch(err => [])
    //);
    //const results = await Promise.all(promises);
    //results.forEach(data => combinedData = combinedData.concat(data));
    //return combinedData;
    const results = fetch(`./data/content.json`) 
            .then(res => res.ok ? res.json() : [])
            .catch(err => []);
    return results;
}

function removeDuplicates(data) {
    const unique = new Map();
    data.forEach(item => {
        // Unique ID based on URL and Date to allow same URL on different days
        const key = item.url + item.date; 
        if(!unique.has(key)) {
            unique.set(key, item);
        } else {
            // Merge tags if duplicate found
            const existing = unique.get(key);
            existing.tags = [...new Set([...existing.tags, ...item.tags])];
        }
    });
    return Array.from(unique.values());
}

// 5. RENDER CARDS
function loadMoreCards() {
    const grid = document.getElementById('card-grid');
    const template = document.getElementById('card-template');
    
    // Sort Newest First (Secondary sort by URL to be deterministic)
    filteredCards.sort((a,b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA || a.url.localeCompare(b.url);
    });

    const nextBatch = filteredCards.slice(displayedCount, displayedCount + CARDS_PER_PAGE);
    
    if(nextBatch.length === 0) return;

    nextBatch.forEach(data => {
        const clone = template.content.cloneNode(true);
        
        clone.querySelector('.card-url').textContent = new URL(data.url).hostname;
        clone.querySelector('.card-link').href = data.url;
        clone.querySelector('.card-date').textContent = data.date;
        
        const ul = clone.querySelector('.card-summary');
        data.summary.forEach(point => {
            const li = document.createElement('li');
            li.textContent = point;
            ul.appendChild(li);
        });

        const tagContainer = clone.querySelector('.card-tags');
        data.tags.forEach(t => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = t;
            tagContainer.appendChild(span);
        });

        grid.appendChild(clone);
    });

    displayedCount += nextBatch.length;
}

// 6. INFINITE SCROLL
function setupInfiniteScroll() {
    const sentinel = document.getElementById('scroll-sentinel');
    const observer = new IntersectionObserver(entries => {
        if(entries[0].isIntersecting) {
            loadMoreCards();
        }
    }, { rootMargin: '200px' });
    observer.observe(sentinel);
}