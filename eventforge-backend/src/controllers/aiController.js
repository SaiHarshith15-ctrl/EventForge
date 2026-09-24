const asyncHandler = require('../middleware/asyncHandler');
const Event = require('../models/Event');

const CITIES = ['hyderabad', 'mumbai', 'bengaluru', 'bangalore', 'delhi', 'chennai'];

// Lightweight rule-based fallback assistant — mirrors the logic in the frontend prototype,
// but queries live data. Used automatically when OPENAI_API_KEY isn't set.
const ruleBasedRespond = async (message) => {
  const q = message.toLowerCase();
  const published = await Event.find({ isPublished: true }).limit(50);

  const reply = (text, events) => ({ reply: text, events: events ? events.slice(0, 4) : [] });

  if (q.includes('free')) {
    const free = published.filter((e) => (e.tickets[0]?.price ?? 0) === 0);
    return reply(free.length ? `I found ${free.length} free events for you!` : 'No free events found right now.', free);
  }

  if (q.includes('tech') || q.includes('ai') || q.includes('hackathon') || q.includes('conference')) {
    const tech = published.filter((e) =>
      ['Conference', 'Hackathon', 'Workshop', 'Exhibition'].includes(e.category) ||
      /ai|tech|hack/i.test(e.name)
    );
    const city = CITIES.find((c) => q.includes(c));
    const filtered = city ? tech.filter((e) => e.location.toLowerCase().includes(city)) : tech;
    return reply(filtered.length ? `I found ${filtered.length} technology events matching your request.` : 'No matching tech events found.', filtered);
  }

  if (q.includes('price') || q.includes('cost') || q.includes('how much')) {
    const e = published[0];
    if (!e) return reply('No events available right now.');
    const prices = e.tickets.map((t) => `${t.name}: ${t.price === 0 ? 'Free' : '₹' + t.price}`).join(', ');
    return reply(`For "${e.name}", ticket prices are: ${prices}.`, [e]);
  }

  if (q.includes('seat') || q.includes('available') || q.includes('spot')) {
    const e = published[0];
    if (!e) return reply('No events available right now.');
    return reply(`"${e.name}" has ${e.capacity - e.booked} seats remaining out of ${e.capacity}.`, [e]);
  }

  const city = CITIES.find((c) => q.includes(c));
  if (city) {
    const inCity = published.filter((e) => e.location.toLowerCase().includes(city));
    return reply(inCity.length ? `I found ${inCity.length} events in ${city}.` : `No events found in ${city} right now.`, inCity);
  }

  if (q.includes('event') || q.includes('show') || q.includes('find') || q.includes('search')) {
    return reply('Here are some events I found for you:', published);
  }

  return reply(
    'I can help you discover events, check speakers, prices, availability, and book tickets. Try: "Show me tech events in Hyderabad" or "Find free events".'
  );
};

// If OPENAI_API_KEY is configured, use it for a richer conversational assistant grounded
// in the platform's live event data. Falls back to the rule-based assistant otherwise.
const openAiRespond = async (message, history = []) => {
  const published = await Event.find({ isPublished: true }).limit(30).select('name category location date price tickets capacity booked');

  const context = published.map((e) => ({
    name: e.name, category: e.category, location: e.location,
    date: e.date, tickets: e.tickets.map((t) => ({ name: t.name, price: t.price })),
    seatsLeft: e.capacity - e.booked,
  }));

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are EventForge's helpful event discovery assistant. Only discuss events from this JSON list of currently published events: ${JSON.stringify(context)}. Keep replies short and friendly. If asked to book, tell the user you'll take them to the booking flow.`,
        },
        ...history.slice(-6),
        { role: 'user', content: message },
      ],
      temperature: 0.5,
      max_tokens: 300,
    }),
  }).then((r) => r.json());

  const text = res.choices?.[0]?.message?.content || "Sorry, I couldn't process that right now.";
  return { reply: text, events: [] };
};

// @desc    AI event assistant chat
// @route   POST /api/ai/chat
// @access  Public
const chat = asyncHandler(async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'message is required' });

  const result = process.env.OPENAI_API_KEY
    ? await openAiRespond(message, history).catch(() => ruleBasedRespond(message))
    : await ruleBasedRespond(message);

  res.json({ success: true, data: result });
});

module.exports = { chat };
