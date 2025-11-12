const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Tweet } = require('../models/Tweet');
const axios = require('axios');

const cryptoPrompts = {
  "alpha_airdrop": {
    title: "Alpha/Airdrop/Monetization Threads",
    description: "Actionable guides for earning crypto and early access opportunities",
    prompt: `Create a high-alpha crypto Twitter thread about an airdrop/monetization opportunity.

STYLE REQUIREMENTS:
- Thread format with 🧵 emoji
- Hook: Bold, direct, qualifying reader (e.g., "If you're low on funds but can post tweets...")
- Include specific reward amounts and data points
- Step-by-step actionable instructions
- Use crypto vernacular (Alpha, DYOR, NFA, TVL, FADE)
- Bold key names, tokens, and numbers
- End with NFA disclaimer

STRUCTURE:
1. Hook + 🧵
2. Context/Problem with high-value data
3. Step-by-step instructions (numbered)
4. Clear CTA (Don't fade it, Visit link, etc.)
5. NFA disclaimer

CONTEXT DATA:
{contextData}

Generate a thread that provides immediate financial opportunity with clear action steps.`
  },

  "deep_dive": {
    title: "Deep Dive/Token Utility/Product Breakdown",
    description: "Educational threads explaining complex projects and technology",
    prompt: `Create an educational crypto Twitter thread breaking down a complex project/technology.

STYLE REQUIREMENTS:
- Position as thought leader with insider knowledge
- Explain "how it works" not just "what it is"
- Focus on misunderstood aspects
- Use technical but accessible language
- Include specific partnerships and data
- Bold key technical terms and metrics

STRUCTURE:
1. Hook about misunderstood project + 🧵
2. What most people think vs reality
3. Technical breakdown (simplified)
4. Unique features/advantages
5. Token utility explanation
6. Why it matters + NFA

CONTEXT DATA:
{contextData}

Focus on educating about technology and utility rather than just price action.`
  },

  "meta_commentary": {
    title: "Platform/Meta Commentary & Strategy",
    description: "Industry insights, algorithm hacks, and controversial takes",
    prompt: `Create a meta-commentary crypto Twitter thread about industry trends or strategy.

STYLE REQUIREMENTS:
- Share unpopular opinion or reveal successful strategy
- Point out industry flaws or opportunities
- Drive engagement through controversy
- Use insider knowledge tone
- Include algorithm/platform strategy tips
- Bold key insights and controversial points

STRUCTURE:
1. Controversial hook/unpopular opinion + 🧵
2. Why most people are wrong
3. The real strategy/insight
4. Specific examples/data
5. How to capitalize on this
6. Final thought + NFA

CONTEXT DATA:
{contextData}

Focus on meta-level insights that keep audience on cutting edge of ecosystem.`
  },

  "market_ta": {
    title: "Real-Time Market & TA Commentary",
    description: "Chart analysis and market sentiment for major coins",
    prompt: `Create a real-time market analysis crypto post with technical commentary.

STYLE REQUIREMENTS:
- Establish as active, sharp trader
- Include specific price levels and targets
- Bold market calls and predictions
- Use TA terminology (S/R, breakout, etc.)
- Immediate, urgent tone

STRUCTURE:
1. Current market observation
2. Key levels to watch (S/R)
3. Market sentiment analysis
4. Prediction/target levels
5. Risk management note + NFA

CONTEXT DATA:
{contextData}

Focus on actionable trading insights with specific price targets.`
  },

  "humor_memes": {
    title: "Hyper-Relatable Humor & Memes",
    description: "Viral crypto humor leveraging current trends and drama",
    prompt: `Create a humorous crypto post using current trends and memes.

STYLE REQUIREMENTS:
- Leverage current crypto trends/drama
- Relatable to crypto community
- High shareability potential
- Use popular meme formats
- Humanize the creator

STRUCTURE:
1. Setup using current trend
2. Crypto-specific twist
3. Relatable punchline
4. Optional follow-up joke

CONTEXT DATA:
{contextData}

Focus on viral, shareable content that humanizes the creator.`
  },

  "community_polls": {
    title: "Interactive Community Polls",
    description: "Engaging polls for predictions and controversial opinions",
    prompt: `Create an interactive crypto poll post to maximize engagement.

STYLE REQUIREMENTS:
- Direct, specific question
- 2-4 clearly defined answers
- Controversial or trending topic
- Immediate interaction focus
- Boost algorithmic visibility

STRUCTURE:
1. Context setup
2. Clear poll question
3. Engaging answer options
4. Call for participation

CONTEXT DATA:
{contextData}

Create polls that drive immediate replies and retweets.`
  },

  "quote_tweet": {
    title: "Quote Tweet to Earn (Viral Outreach)",
    description: "Thought-provoking posts designed for quote tweeting",
    prompt: `Create a quote-tweet optimized crypto post for viral outreach.

STYLE REQUIREMENTS:
- Thought-provoking statement
- Simple but profound question
- Strong philosophical angle
- Easy to quote tweet
- Must include "QT this with your answer"

STRUCTURE:
1. Bold philosophical statement
2. Thought-provoking question
3. Direct QT prompt

CONTEXT DATA:
{contextData}

Create content that incentivizes user-generated promotion through quote tweets.`
  }
};

const cryptoPromptController = {
  // Get available prompt types with templates
  getPromptTypes: async (req, res) => {
    const promptTypes = Object.keys(cryptoPrompts).map(key => ({
      id: key,
      title: cryptoPrompts[key].title,
      description: cryptoPrompts[key].description,
      prompt: cryptoPrompts[key].prompt
    }));

    res.json({
      success: true,
      promptTypes
    });
  },

  // Generate content with selected prompt type
  generateCryptoContent: async (req, res) => {
    try {
      const { promptType, customContext, useContext = true } = req.body;

      if (!cryptoPrompts[promptType]) {
        return res.status(400).json({ error: 'Invalid prompt type' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({ error: 'Gemini API key not configured' });
      }

      let contextData = '';
      
      // Get combined context if requested
      if (useContext) {
        try {
          const contextResponse = await axios.get(`http://localhost:${process.env.PORT || 5000}/api/combined-context?niche=crypto`);
          if (contextResponse.data.success) {
            contextData = contextResponse.data.combinedPrompt;
          }
        } catch (error) {
          console.error('Context fetch error:', error);
          return res.status(500).json({ 
            error: 'Failed to fetch context data. Please try again or disable context.',
            details: error.message 
          });
        }
      }

      // Add custom context if provided
      if (customContext) {
        contextData += `\n\nCustom Context:\n${customContext}`;
      }

      // Get the selected prompt template
      const selectedPrompt = cryptoPrompts[promptType];
      const finalPrompt = selectedPrompt.prompt.replace('{contextData}', contextData);

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: process.env.GEMINI_PRO_MODEL || 'gemini-2.5-pro'
      });

      const result = await model.generateContent(finalPrompt);
      const generatedText = result.response.text();
      
      res.json({ 
        content: generatedText.trim(),
        promptType: selectedPrompt.title,
        model: 'gemini-2.5-pro',
        contextUsed: useContext && contextData.length > 0
      });

    } catch (error) {
      console.error('Crypto content generation error:', error);
      res.status(500).json({ 
        error: 'Content generation failed. Please check your API key and try again.',
        details: error.message 
      });
    }
  }
};

module.exports = { cryptoPromptController, cryptoPrompts };
