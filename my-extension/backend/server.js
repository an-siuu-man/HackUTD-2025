const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Enable CORS for all origins (adjust for production)
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large payloads

// In-memory storage for scraped content
const scrapedData = new Map();

// Endpoint to receive scraped content
app.post('/api/scraped-content', (req, res) => {
    try {
        const { url, content, timestamp } = req.body;
        
        if (!url || !content) {
            return res.status(400).json({ 
                success: false, 
                error: 'URL and content are required' 
            });
        }
        
        // Store the scraped content
        scrapedData.set(url, {
            content,
            timestamp: timestamp || new Date().toISOString(),
            length: content.length
        });
        
        console.log(`✓ Received scraped content from: ${url} (${content.length} characters)`);
        
        res.json({ 
            success: true, 
            message: 'Content stored successfully',
            url,
            length: content.length
        });
    } catch (error) {
        console.error('Error storing content:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Endpoint to retrieve all scraped content
app.get('/api/scraped-content', (req, res) => {
    const allContent = Array.from(scrapedData.entries()).map(([url, data]) => ({
        url,
        ...data
    }));
    
    res.json({ 
        success: true, 
        count: allContent.length,
        data: allContent 
    });
});

// Endpoint to retrieve specific URL content
app.get('/api/scraped-content/:url', (req, res) => {
    const url = decodeURIComponent(req.params.url);
    const data = scrapedData.get(url);
    
    if (data) {
        res.json({ 
            success: true, 
            url,
            ...data 
        });
    } else {
        res.status(404).json({ 
            success: false, 
            error: 'Content not found for this URL' 
        });
    }
});

// Endpoint to clear all scraped content
app.delete('/api/scraped-content', (req, res) => {
    const count = scrapedData.size;
    scrapedData.clear();
    
    res.json({ 
        success: true, 
        message: `Cleared ${count} entries` 
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        status: 'running',
        storedEntries: scrapedData.size
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Scraper API Server running on http://localhost:${PORT}`);
    console.log(`📊 Endpoints:`);
    console.log(`   POST   /api/scraped-content     - Store scraped content`);
    console.log(`   GET    /api/scraped-content     - Get all scraped content`);
    console.log(`   GET    /api/scraped-content/:url - Get specific URL content`);
    console.log(`   DELETE /api/scraped-content     - Clear all content`);
    console.log(`   GET    /api/health             - Health check`);
});
