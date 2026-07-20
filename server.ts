/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { PRODUCTS } from './src/data';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely. Do not crash if key is missing.
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini AI Client successfully initialized.');
  } catch (error) {
    console.error('Failed to initialize GoogleGenAI:', error);
  }
} else {
  console.warn('GEMINI_API_KEY environment variable is missing or placeholder. Running in mock AI mode.');
}

// 1. API: Get Curated Catalog
app.get('/api/products', (req, res) => {
  res.json({ products: PRODUCTS });
});

// 2. API: Intelligent Personal AI Assistant Chat
app.post('/api/chat', async (req, res) => {
  const { messages, userPreferences } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid or missing messages array.' });
  }

  // Inject our real products catalog into the prompt so the model can browse it.
  const catalogContext = PRODUCTS.map((p) => {
    return `ID: ${p.id}, Name: ${p.name}, Price: $${p.price}, Original Price: ${p.originalPrice ? '$' + p.originalPrice : 'N/A'}, Category: ${p.category}, Subcategory: ${p.subcategory}, Brand: ${p.brand}, Colors: ${p.colors.join(', ')}, Sizes: ${p.sizes.join(', ')}, Rating: ${p.rating}, Stock: ${p.stock}, Specs: ${JSON.stringify(p.specs)}, Short Story: ${p.productStory}`;
  }).join('\n---\n');

  const systemInstruction = `You are the DreamShelf AI Smart Personal Shopper and Virtual Stylist.
DreamShelf is a progressive, luxury, highly curated online marketplace (not a furniture store!) selling elite apparel, next-gen devices, brutalist home decor, high-performance gym gear, self-care skincare, and lifestyle items.
Your purpose is to welcome clients, help them coordinate visual outfits, answer deep technical specs, and suggest matching companion pieces with sophistication.

Here is the entire live DreamShelf product catalog:
${catalogContext}

Instructions:
1. Always suggest products from our live catalog above. Recommend specific items by ID and price.
2. IMPORTANT: When mentioning a product from our catalog, use custom markdown links format: [Product Name](href:product:ID) so the frontend client can parse and render clickable custom route cards. E.g., "[AeroWeave Knit Blazer](href:product:ds-001) for $185".
3. Maintain an elegant, warm, friendly, minimalist, yet luxury voice. Speak like a senior personal shopper in a Milan boutique.
4. Keep answers brief, visual, and highly styled in markdown. Avoid long-winded paragraphs. Prefer bullet points for lists.
5. If the user asks about returns, coupons, shipping, or how the store works, answer politely using our FAQ context: returns are accepted within 14 days; we have coupon DREAM20 (20% off) and SHELF_LOYAL_50 ($50 off over $250); shipping takes 3-5 days.

Current User Preferences: ${JSON.stringify(userPreferences || {})}`;

  // Fallback if AI client is not available or fails
  if (!ai) {
    // Generate a beautiful, high-quality simulated response based on keywords
    const lastMessage = messages[messages.length - 1]?.text || '';
    let responseText = `Welcome to DreamShelf. I am currently running in Offline Concierge Mode. \n\nBased on your interest, I highly recommend our signature [AeroWeave Knit Blazer](href:product:ds-001) ($185) paired with the [Aethera ANC Spatial Headphones](href:product:ds-002) ($349) to elevate your work-from-home aesthetic. Feel free to use the coupon code **DREAM20** for a 20% savings on your first checkout!`;

    if (lastMessage.toLowerCase().includes('audio') || lastMessage.toLowerCase().includes('headphone') || lastMessage.toLowerCase().includes('sound') || lastMessage.toLowerCase().includes('music')) {
      responseText = `For pristine acoustics, our [Aethera ANC Spatial Headphones](href:product:ds-002) ($349) are second to none. They feature titanium headbands and hybrid active noise cancellation. Pair them with [The Architecture of Tomorrow](href:product:ds-008) book on your coffee table for a perfect brutalist living room setup.`;
    } else if (lastMessage.toLowerCase().includes('jacket') || lastMessage.toLowerCase().includes('clothing') || lastMessage.toLowerCase().includes('wear') || lastMessage.toLowerCase().includes('fashion') || lastMessage.toLowerCase().includes('outfit')) {
      responseText = `The future of tailored apparel lies in comfort. Our [AeroWeave Knit Blazer](href:product:ds-001) ($185) maintains an immaculate structured drape while flexing comfortably like a knit tee. Pair it with the [Nordic Cashmere Overcoat](href:product:ds-003) ($490) in oatmeal cashmere for colder seasons.`;
    } else if (lastMessage.toLowerCase().includes('gym') || lastMessage.toLowerCase().includes('workout') || lastMessage.toLowerCase().includes('dumbbell') || lastMessage.toLowerCase().includes('fit')) {
      responseText = `To transform your fitness space into a gallery, the [Helix Smart Dumbbells (Pair)](href:product:ds-004) ($299) are ideal. They replace ten separate plates with one high-precision dial. They rest elegantly on natural cork bases.`;
    } else if (lastMessage.toLowerCase().includes('decor') || lastMessage.toLowerCase().includes('home') || lastMessage.toLowerCase().includes('vase') || lastMessage.toLowerCase().includes('clay')) {
      responseText = `To introduce organic texture to your desk or mantelpiece, I recommend our hand-thrown [Brutalist Terracotta Pedestal Vase](href:product:ds-005) ($95). It pairs beautifully with wild stems and can sit next to [The Architecture of Tomorrow](href:product:ds-008) coffee table volume.`;
    } else if (lastMessage.toLowerCase().includes('skin') || lastMessage.toLowerCase().includes('cream') || lastMessage.toLowerCase().includes('beauty') || lastMessage.toLowerCase().includes('glow')) {
      responseText = `Our skincare philosophy focuses on barrier health. The [Soma Squalane Glow Nectar](href:product:ds-006) ($68) contains organic sugarcane squalane and rosehip oil to give a dewy, glowing finish with just two drops.`;
    }

    return res.json({ text: responseText, source: 'offline_concierge' });
  }

  try {
    // Structure chat message formatting for GoogleGenAI SDK
    // Convert client message array to GoogleGenAI chat standard
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const lastMessageText = messages[messages.length - 1].text;

    // Use chats.create to support multi-turn conversational memory
    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.75,
      },
      history: history,
    });

    const result = await chat.sendMessage({ message: lastMessageText });
    return res.json({ text: result.text || 'I was unable to formulate a response.', source: 'gemini_3.5_flash' });
  } catch (error: any) {
    console.error('Gemini API call failed:', error);
    res.status(500).json({ error: 'Fidelity AI engine encountered an issue.', message: error.message });
  }
});

// 3. API: Smart Personal Recommendations Suggestion Core
app.post('/api/recommend', async (req, res) => {
  const { mood, budget } = req.body;

  if (!ai) {
    // Mock recommendations matching budget/mood criteria
    const filtered = PRODUCTS.filter((p) => {
      if (budget && p.price > budget) return false;
      return true;
    });
    return res.json({
      recommendations: filtered.slice(0, 3),
      reasoning: 'These selections represent our premium items that fit within your specified criteria, hand-selected to elevate your environment.',
      source: 'offline_concierge',
    });
  }

  try {
    const prompt = `Based on the client's current mood of "${mood || 'Minimalist Luxury'}" and max budget of ${budget ? '$' + budget : 'unlimited'}, search our catalog and recommend 2 products.
Return a JSON object containing:
1. "productIds": array of product IDs recommended.
2. "reasoning": a brief, exquisite 2-sentence explanation of why these match this mood.

Our catalog products are:
${PRODUCTS.map((p) => `${p.id}: ${p.name} ($${p.price}) - ${p.description}`).join('\n')}`;

    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT' as any,
          properties: {
            productIds: {
              type: 'ARRAY' as any,
              items: { type: 'STRING' as any },
            },
            reasoning: { type: 'STRING' as any },
          },
          required: ['productIds', 'reasoning'],
        },
      },
    });

    const responseText = result.text;
    const parsed = JSON.parse(responseText || '{}');
    const recommendedProducts = PRODUCTS.filter((p) => parsed.productIds?.includes(p.id));

    res.json({
      recommendations: recommendedProducts.length > 0 ? recommendedProducts : PRODUCTS.slice(0, 2),
      reasoning: parsed.reasoning || 'Selected to bring pristine structural form and harmony into your creative workspace.',
      source: 'gemini_3.5_flash',
    });
  } catch (error) {
    console.error('Recommendation API failed:', error);
    res.json({
      recommendations: PRODUCTS.slice(0, 2),
      reasoning: 'These exquisite pieces are chosen by our lead stylists to evoke a sense of quiet luxury and architectural grace in your space.',
      source: 'offline_concierge',
    });
  }
});

// Start server and handle Vite development middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development server middleware mounted.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DreamShelf server running on http://localhost:${PORT}`);
  });
}

startServer();
