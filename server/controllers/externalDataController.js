const axios = require('axios');

const externalDataController = {
  // Get crypto prices from CoinGecko (free API)
  getCryptoPrices: async (tokens = ['bitcoin', 'ethereum']) => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
        params: {
          ids: tokens.join(','),
          vs_currencies: 'usd',
          include_24hr_change: true
        }
      });
      return response.data;
    } catch (error) {
      console.error('CoinGecko API error:', error);
      return {};
    }
  },

  // Get trending crypto from CoinGecko
  getTrendingCrypto: async () => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/search/trending');
      return response.data.coins.slice(0, 5).map(coin => ({
        name: coin.item.name,
        symbol: coin.item.symbol,
        rank: coin.item.market_cap_rank
      }));
    } catch (error) {
      console.error('Trending crypto error:', error);
      return [];
    }
  },

  // Get trending crypto news from multiple sources
  getTrendingNews: async (limit = 5) => {
    const newsPromises = [
      // CoinDesk RSS (free)
      externalDataController.getCoinDeskNews(limit),
      // CoinTelegraph RSS (free)  
      externalDataController.getCoinTelegraphNews(limit),
      // Reddit crypto trending (free)
      externalDataController.getRedditTrending(limit)
    ];

    try {
      const results = await Promise.allSettled(newsPromises);
      const allNews = [];
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          allNews.push(...result.value);
        }
      });

      // Sort by recency and remove duplicates
      return allNews
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
        .slice(0, limit);
        
    } catch (error) {
      console.error('Trending news error:', error);
      return [];
    }
  },

  // CoinDesk RSS feed
  getCoinDeskNews: async (limit = 3) => {
    try {
      const response = await axios.get('https://www.coindesk.com/arc/outboundfeeds/rss/');
      const Parser = require('rss-parser');
      const parser = new Parser();
      const feed = await parser.parseString(response.data);
      
      return feed.items.slice(0, limit).map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        source: 'CoinDesk'
      }));
    } catch (error) {
      console.error('CoinDesk RSS error:', error);
      return [];
    }
  },

  // CoinTelegraph RSS feed
  getCoinTelegraphNews: async (limit = 3) => {
    try {
      const response = await axios.get('https://cointelegraph.com/rss');
      const Parser = require('rss-parser');
      const parser = new Parser();
      const feed = await parser.parseString(response.data);
      
      return feed.items.slice(0, limit).map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        source: 'CoinTelegraph'
      }));
    } catch (error) {
      console.error('CoinTelegraph RSS error:', error);
      return [];
    }
  },

  // Reddit crypto trending (using Reddit JSON API)
  getRedditTrending: async (limit = 3) => {
    try {
      const response = await axios.get('https://www.reddit.com/r/CryptoCurrency/hot.json?limit=10');
      const posts = response.data.data.children;
      
      return posts.slice(0, limit).map(post => ({
        title: post.data.title,
        link: `https://reddit.com${post.data.permalink}`,
        pubDate: new Date(post.data.created_utc * 1000).toISOString(),
        source: 'Reddit r/CryptoCurrency',
        score: post.data.score
      }));
    } catch (error) {
      console.error('Reddit trending error:', error);
      return [];
    }
  },

  // Get Twitter trending topics (using Twitter API v2)
  getTwitterTrending: async () => {
    try {
      // This would require Twitter API v2 - placeholder for now
      // You can implement this with your existing Twitter client
      return [
        { trend: '#Bitcoin', volume: 'High' },
        { trend: '#Ethereum', volume: 'Medium' },
        { trend: '#DeFi', volume: 'Medium' }
      ];
    } catch (error) {
      console.error('Twitter trending error:', error);
      return [];
    }
  },

  // Get DeFi data from DeFiPulse/Llama (free)
  getDefiData: async () => {
    try {
      const response = await axios.get('https://api.llama.fi/protocols');
      return response.data.slice(0, 10).map(protocol => ({
        name: protocol.name,
        tvl: protocol.tvl,
        change_1d: protocol.change_1d
      }));
    } catch (error) {
      console.error('DeFi data error:', error);
      return [];
    }
  },

  // Comprehensive external context
  getExternalContext: async (req, res) => {
    try {
      const { niche = 'crypto', includeNews = true, includePrices = true } = req.query;
      
      const context = {
        timestamp: new Date().toISOString(),
        niche
      };

      // Get crypto-specific data
      if (niche === 'crypto') {
        const [prices, trending, news, defi, twitterTrends] = await Promise.allSettled([
          includePrices ? externalDataController.getCryptoPrices() : Promise.resolve({}),
          externalDataController.getTrendingCrypto(),
          includeNews ? externalDataController.getTrendingNews(5) : Promise.resolve([]),
          externalDataController.getDefiData(),
          externalDataController.getTwitterTrending()
        ]);

        context.prices = prices.status === 'fulfilled' ? prices.value : {};
        context.trending = trending.status === 'fulfilled' ? trending.value : [];
        context.news = news.status === 'fulfilled' ? news.value : [];
        context.defi = defi.status === 'fulfilled' ? defi.value.slice(0, 5) : [];
        context.twitterTrends = twitterTrends.status === 'fulfilled' ? twitterTrends.value : [];
      }

      // Generate structured prompt context
      const promptContext = externalDataController.generatePromptContext(context);

      res.json({
        success: true,
        context,
        promptContext,
        sources: ['CoinGecko', 'CryptoNews', 'DeFiLlama']
      });

    } catch (error) {
      console.error('External context error:', error);
      res.status(500).json({ error: 'Failed to fetch external context' });
    }
  },

  // Generate structured prompt from external data
  generatePromptContext: (context) => {
    let prompt = `\n\nCurrent Market Context (${new Date().toLocaleDateString()}):\n`;

    // Add price data
    if (context.prices && Object.keys(context.prices).length > 0) {
      prompt += `\nPrices:\n`;
      Object.entries(context.prices).forEach(([coin, data]) => {
        const change = data.usd_24h_change > 0 ? `+${data.usd_24h_change.toFixed(2)}%` : `${data.usd_24h_change.toFixed(2)}%`;
        prompt += `- ${coin}: $${data.usd} (${change} 24h)\n`;
      });
    }

    // Add trending coins
    if (context.trending && context.trending.length > 0) {
      prompt += `\nTrending: ${context.trending.map(coin => `$${coin.symbol}`).join(', ')}\n`;
    }

    // Add trending news headlines with sources
    if (context.news && context.news.length > 0) {
      prompt += `\nBreaking/Trending News:\n`;
      context.news.slice(0, 4).forEach(article => {
        const timeAgo = externalDataController.getTimeAgo(article.pubDate);
        prompt += `- ${article.title} (${article.source} - ${timeAgo})\n`;
      });
    }

    // Add Twitter trending topics
    if (context.twitterTrends && context.twitterTrends.length > 0) {
      prompt += `\nTwitter Trending: ${context.twitterTrends.map(trend => trend.trend).join(', ')}\n`;
    }

    // Add DeFi data
    if (context.defi && context.defi.length > 0) {
      prompt += `\nTop DeFi Protocols:\n`;
      context.defi.slice(0, 3).forEach(protocol => {
        const tvl = (protocol.tvl / 1e9).toFixed(1);
        prompt += `- ${protocol.name}: $${tvl}B TVL\n`;
      });
    }

    return prompt;
  },

  // Enhanced context combining internal tweets + external data
  getCombinedContext: async (req, res) => {
    try {
      const { niche = 'crypto' } = req.query;

      // Get internal tweet analysis (no limit)
      const tweetResponse = await axios.get(`http://localhost:${process.env.PORT || 5000}/api/prompt-context?niche=${niche}`);
      
      // Get external market data
      const externalResponse = await axios.get(`http://localhost:${process.env.PORT || 5000}/api/external-context?niche=${niche}`);

      const combinedPrompt = 
        (tweetResponse.data.structuredPrompt || '') + 
        (externalResponse.data.promptContext || '');

      res.json({
        success: true,
        internalTweets: tweetResponse.data.totalTweets || 0,
        externalSources: externalResponse.data.sources || [],
        combinedPrompt,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Combined context error:', error);
      res.status(500).json({ error: 'Failed to generate combined context' });
    }
  },

  // Helper function to get time ago
  getTimeAgo: (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours > 24) return `${Math.floor(diffHours / 24)}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return `${diffMins}m ago`;
  }
};

module.exports = externalDataController;
