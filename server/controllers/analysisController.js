const { Tweet } = require('../models/Tweet');
const axios = require('axios');

const analysisController = {
  // Extract structured data using regex patterns
  extractTweetData: (tweetText) => {
    const data = {
      urls: [],
      hashtags: [],
      mentions: [],
      dates: [],
      tokens: [],
      prices: [],
      requirements: [],
      keywords: []
    };

    // Extract URLs
    const urlRegex = /https?:\/\/[^\s]+/g;
    data.urls = tweetText.match(urlRegex) || [];

    // Extract hashtags
    const hashtagRegex = /#\w+/g;
    data.hashtags = tweetText.match(hashtagRegex) || [];

    // Extract mentions
    const mentionRegex = /@\w+/g;
    data.mentions = tweetText.match(mentionRegex) || [];

    // Extract dates (various formats)
    const dateRegex = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/gi;
    data.dates = tweetText.match(dateRegex) || [];

    // Extract token symbols
    const tokenRegex = /\$[A-Z]{2,10}\b/g;
    data.tokens = tweetText.match(tokenRegex) || [];

    // Extract prices
    const priceRegex = /\$[\d,]+\.?\d*/g;
    data.prices = tweetText.match(priceRegex) || [];

    // Extract airdrop keywords
    const airdropKeywords = ['airdrop', 'claim', 'snapshot', 'eligible', 'whitelist', 'testnet', 'mainnet', 'retroactive'];
    data.keywords = airdropKeywords.filter(keyword => 
      tweetText.toLowerCase().includes(keyword)
    );

    // Extract requirements
    const requirementPatterns = [
      /hold \d+/gi,
      /minimum \d+/gi,
      /before \w+/gi,
      /deadline/gi,
      /register/gi,
      /connect wallet/gi
    ];
    
    requirementPatterns.forEach(pattern => {
      const matches = tweetText.match(pattern);
      if (matches) data.requirements.push(...matches);
    });

    return data;
  },

  // Analyze tweets and extract structured data
  analyzeTweets: async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      
      const tweets = await Tweet.find({ isUsed: false })
        .sort({ created_at: -1 })
        .limit(parseInt(limit));

      const analyzedTweets = tweets.map(tweet => {
        const extractedData = analysisController.extractTweetData(tweet.text);
        
        return {
          id: tweet.tweetId,
          author: tweet.author,
          tag: tweet.tag,
          text: tweet.text,
          created_at: tweet.created_at,
          metrics: tweet.metrics,
          extracted: extractedData,
          relevanceScore: analysisController.calculateRelevance(extractedData)
        };
      });

      // Sort by relevance score
      analyzedTweets.sort((a, b) => b.relevanceScore - a.relevanceScore);

      res.json({
        success: true,
        totalTweets: analyzedTweets.length,
        tweets: analyzedTweets,
        summary: analysisController.generateSummary(analyzedTweets)
      });

    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze tweets' });
    }
  },

  // Calculate relevance score based on extracted data
  calculateRelevance: (extractedData) => {
    let score = 0;
    
    // Higher score for airdrop keywords
    score += extractedData.keywords.length * 3;
    
    // URLs often contain important info
    score += extractedData.urls.length * 2;
    
    // Dates indicate time-sensitive info
    score += extractedData.dates.length * 2;
    
    // Token mentions
    score += extractedData.tokens.length * 1;
    
    // Requirements indicate actionable content
    score += extractedData.requirements.length * 2;
    
    return score;
  },

  // Generate summary of trending topics
  generateSummary: (analyzedTweets) => {
    const summary = {
      topTokens: {},
      commonKeywords: {},
      urgentDates: [],
      topUrls: [],
      requirements: []
    };

    analyzedTweets.forEach(tweet => {
      // Count tokens
      tweet.extracted.tokens.forEach(token => {
        summary.topTokens[token] = (summary.topTokens[token] || 0) + 1;
      });

      // Count keywords
      tweet.extracted.keywords.forEach(keyword => {
        summary.commonKeywords[keyword] = (summary.commonKeywords[keyword] || 0) + 1;
      });

      // Collect dates
      summary.urgentDates.push(...tweet.extracted.dates);

      // Collect URLs
      summary.topUrls.push(...tweet.extracted.urls);

      // Collect requirements
      summary.requirements.push(...tweet.extracted.requirements);
    });

    // Sort and limit results
    summary.topTokens = Object.entries(summary.topTokens)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

    summary.commonKeywords = Object.entries(summary.commonKeywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

    return summary;
  },

  // Get structured prompt data for Gemini
  getPromptContext: async (req, res) => {
    try {
      const { niche = 'crypto' } = req.query;
      
      const tweets = await Tweet.find({ 
        isUsed: false,
        tag: niche === 'crypto' ? { $in: ['influencer', 'company'] } : 'influencer'
      })
      .sort({ created_at: -1 });

      const contextData = tweets.map(tweet => {
        const extracted = analysisController.extractTweetData(tweet.text);
        
        return {
          author: tweet.author,
          tag: tweet.tag,
          text: tweet.text,
          keyInfo: {
            tokens: extracted.tokens,
            keywords: extracted.keywords,
            dates: extracted.dates,
            requirements: extracted.requirements,
            urls: extracted.urls.length > 0 ? 'Has links' : 'No links'
          }
        };
      });

      const structuredPrompt = `Recent ${niche} trends and opportunities:\n\n` +
        contextData.map(item => 
          `${item.author} (${item.tag}):\n` +
          `"${item.text}"\n` +
          `Key Info: ${JSON.stringify(item.keyInfo)}\n`
        ).join('\n');

      res.json({
        success: true,
        contextData,
        structuredPrompt,
        totalTweets: contextData.length
      });

    } catch (error) {
      console.error('Context generation error:', error);
      res.status(500).json({ error: 'Failed to generate context' });
    }
  }
};

module.exports = analysisController;
