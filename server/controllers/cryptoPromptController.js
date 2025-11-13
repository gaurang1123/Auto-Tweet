const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Tweet } = require('../models/Tweet');
const axios = require('axios');

const cryptoPrompts = {
  "alpha_airdrop": {
    title: "Alpha/Airdrop/Monetization Threads",
    description: "Actionable guides for earning crypto and early access opportunities",
    prompt: `Create a crypto Twitter thread about an airdrop/earning opportunity for Indian crypto newcomers.

LANGUAGE REQUIREMENTS:
- Use SIMPLE, CLEAR English (Indian audience, non-native speakers)
- Avoid complex crypto jargon - explain terms simply
- Use conversational tone like talking to a friend
- Short sentences, easy to understand
- Use "you" and "your" frequently
- Explain technical terms in brackets

CRITICAL THREAD REQUIREMENTS:
- Generate EXACTLY 3-4 separate tweets
- Each tweet must be 200-280 characters (close to max length)
- Format as: "Tweet 1/4:", "Tweet 2/4:", etc.
- Use 🧵 emoji only in first tweet
- Each tweet must be a complete thought that can stand alone

STYLE REQUIREMENTS:
- Start with relatable hook: "If you missed..." or "New to crypto?"
- Include specific reward amounts in simple terms
- Step-by-step instructions with numbers
- Use simple words instead of: "alpha" → "opportunity", "DYOR" → "do research", "NFA" → "not financial advice"
- Bold key names, tokens, and numbers with **text**

THREAD STRUCTURE:
Tweet 1/4: Simple hook + problem + opportunity + 🧵
Tweet 2/4: What this project does (explained simply) + why it matters
Tweet 3/4: Step-by-step instructions (numbered, easy to follow)
Tweet 4/4: How to get started + follow recommendations + "Not financial advice"

CONTEXT DATA:
{contextData}

Write like you're explaining to someone new to crypto. Use simple words and clear explanations.`
  },

  "deep_dive": {
    title: "Deep Dive/Token Utility/Product Breakdown",
    description: "Educational threads explaining complex projects and technology",
    prompt: `Create an educational crypto Twitter thread explaining a project for Indian crypto newcomers.

LANGUAGE REQUIREMENTS:
- Use SIMPLE, CLEAR English (Indian audience, non-native speakers)
- Explain technical terms in simple words
- Use conversational, friendly tone
- Short sentences, easy to understand
- Compare to familiar things when possible

CRITICAL THREAD REQUIREMENTS:
- Generate EXACTLY 3-4 separate tweets
- Each tweet must be 200-280 characters (close to max length)
- Format as: "Tweet 1/4:", "Tweet 2/4:", etc.
- Use 🧵 emoji only in first tweet
- Each tweet must be a complete thought that can stand alone

STYLE REQUIREMENTS:
- Start with: "Let me explain [project] in simple words"
- Avoid complex technical jargon
- Use analogies: "Think of it like..." or "It's similar to..."
- Explain benefits in simple terms
- Bold key terms with **text**

THREAD STRUCTURE:
Tweet 1/4: What this project is (in simple words) + why you should care + 🧵
Tweet 2/4: How it works (explained simply, use analogies)
Tweet 3/4: What makes it special + real benefits for users
Tweet 4/4: Why it matters for the future + "Not financial advice"

CONTEXT DATA:
{contextData}

Explain like you're teaching a friend who's new to crypto. Use simple examples and clear language.`
  },

  "meta_commentary": {
    title: "Platform/Meta Commentary & Strategy",
    description: "Industry insights, algorithm hacks, and controversial takes",
    prompt: `Create a crypto industry commentary thread for Indian crypto newcomers.

LANGUAGE REQUIREMENTS:
- Use SIMPLE, CLEAR English (Indian audience, non-native speakers)
- Avoid complex industry terms
- Use conversational, relatable tone
- Explain concepts in simple words
- Use examples people can understand

CRITICAL THREAD REQUIREMENTS:
- Generate EXACTLY 3-4 separate tweets
- Each tweet must be 200-280 characters (close to max length)
- Format as: "Tweet 1/4:", "Tweet 2/4:", etc.
- Use 🧵 emoji only in first tweet
- Each tweet must be a complete thought that can stand alone

STYLE REQUIREMENTS:
- Start with relatable observation: "I noticed something..."
- Share insights in simple terms
- Use examples from real life
- Avoid complex strategy terms
- Bold key points with **text**

THREAD STRUCTURE:
Tweet 1/4: Simple observation + why it matters + 🧵
Tweet 2/4: What most people don't understand (explained simply)
Tweet 3/4: What you should do about it (clear action steps)
Tweet 4/4: Final advice + encouragement + "Not financial advice"

CONTEXT DATA:
{contextData}

Write like you're sharing insights with a friend. Keep it simple and relatable.`
  },

  "market_ta": {
    title: "Real-Time Market & TA Commentary",
    description: "Chart analysis and market sentiment for major coins",
    prompt: `Create a market analysis crypto thread for Indian crypto newcomers.

LANGUAGE REQUIREMENTS:
- Use SIMPLE, CLEAR English (Indian audience, non-native speakers)
- Explain trading terms in simple words
- Use conversational tone
- Avoid complex technical analysis jargon
- Use familiar comparisons

CRITICAL THREAD REQUIREMENTS:
- Generate EXACTLY 3-4 separate tweets
- Each tweet must be 200-280 characters (close to max length)
- Format as: "Tweet 1/4:", "Tweet 2/4:", etc.
- Use 🧵 emoji only in first tweet
- Each tweet must be a complete thought that can stand alone

STYLE REQUIREMENTS:
- Start with: "Here's what I'm seeing in the market..."
- Explain price movements in simple terms
- Use basic support/resistance concepts
- Avoid complex TA terminology
- Bold key levels with **text**

THREAD STRUCTURE:
Tweet 1/4: Current market situation (explained simply) + 🧵
Tweet 2/4: Key price levels to watch (in simple terms)
Tweet 3/4: What this means for traders (clear explanation)
Tweet 4/4: Risk management advice + "Not financial advice"

CONTEXT DATA:
{contextData}

Explain market movements like you're talking to someone learning to trade. Keep it simple and educational.`
  },

  "humor_memes": {
    title: "Hyper-Relatable Humor & Memes",
    description: "Viral crypto humor leveraging current trends and drama",
    prompt: `Create a humorous crypto thread that Indian crypto newcomers can relate to.

LANGUAGE REQUIREMENTS:
- Use SIMPLE, CLEAR English (Indian audience, non-native speakers)
- Use relatable situations and humor
- Keep jokes simple and universal
- Avoid complex crypto inside jokes
- Use familiar references

CRITICAL THREAD REQUIREMENTS:
- Generate EXACTLY 3-4 separate tweets
- Each tweet must be 200-280 characters (close to max length)
- Format as: "Tweet 1/4:", "Tweet 2/4:", etc.
- Use 🧵 emoji only in first tweet
- Each tweet must be a complete thought that can stand alone

STYLE REQUIREMENTS:
- Start with relatable situation
- Use simple, universal humor
- Reference common crypto experiences
- Keep it light and fun
- Bold funny parts with **text**

THREAD STRUCTURE:
Tweet 1/4: Relatable crypto situation setup + 🧵
Tweet 2/4: The funny reality of crypto life
Tweet 3/4: More relatable humor
Tweet 4/4: Funny conclusion + community engagement

CONTEXT DATA:
{contextData}

Make jokes that anyone new to crypto can understand and relate to. Keep it simple and fun.`
  },

  "community_polls": {
    title: "Interactive Community Polls",
    description: "Engaging polls for predictions and controversial opinions",
    prompt: `Create an interactive crypto poll thread for Indian crypto newcomers.

LANGUAGE REQUIREMENTS:
- Use SIMPLE, CLEAR English (Indian audience, non-native speakers)
- Ask questions in simple terms
- Explain poll options clearly
- Use conversational tone
- Make it easy to understand and participate

CRITICAL THREAD REQUIREMENTS:
- Generate EXACTLY 3-4 separate tweets
- Each tweet must be 200-280 characters (close to max length)
- Format as: "Tweet 1/4:", "Tweet 2/4:", etc.
- Use 🧵 emoji only in first tweet
- Each tweet must be a complete thought that can stand alone

STYLE REQUIREMENTS:
- Start with: "I want to know what you think..."
- Ask clear, simple questions
- Explain why the question matters
- Use A/B/C/D options that are easy to understand
- Bold options with **text**

THREAD STRUCTURE:
Tweet 1/4: Context + why this question matters + 🧵
Tweet 2/4: Main poll question + clear options (A/B/C/D)
Tweet 3/4: Explain each option simply
Tweet 4/4: Ask for participation + encourage discussion

CONTEXT DATA:
{contextData}

Ask questions that newcomers can understand and have opinions about. Keep it simple and engaging.`
  },

  "quote_tweet": {
    title: "Quote Tweet to Earn (Viral Outreach)",
    description: "Thought-provoking posts designed for quote tweeting",
    prompt: `Create a quote-tweet optimized crypto thread for Indian crypto newcomers.

LANGUAGE REQUIREMENTS:
- Use SIMPLE, CLEAR English (Indian audience, non-native speakers)
- Ask thought-provoking but simple questions
- Use conversational tone
- Make statements that are easy to understand
- Encourage sharing and discussion

CRITICAL THREAD REQUIREMENTS:
- Generate EXACTLY 3-4 separate tweets
- Each tweet must be 200-280 characters (close to max length)
- Format as: "Tweet 1/4:", "Tweet 2/4:", etc.
- Use 🧵 emoji only in first tweet
- Each tweet must be a complete thought that can stand alone

STYLE REQUIREMENTS:
- Start with simple but interesting statement
- Ask questions people can relate to
- Use examples from real life
- Make it easy to quote tweet
- Bold key statements with **text**

THREAD STRUCTURE:
Tweet 1/4: Interesting statement about crypto + 🧵
Tweet 2/4: Simple question that makes people think
Tweet 3/4: Different perspectives explained simply
Tweet 4/4: Final question + "Quote tweet with your answer"

CONTEXT DATA:
{contextData}

Create content that's easy to understand but makes people want to share their thoughts. Keep it simple and relatable.`
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
