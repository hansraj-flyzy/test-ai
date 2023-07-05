const log = require("lambda-log");
const aiItineraryModel = require("../../models/itinerary-ai")
const { sendChatAutocomplete } = require("../../services/ai/chatGPT");

log.options.debug = process.env.EnableLogs === "true" ? true : false;

const createAIItineraryController = async (req, res, next) => {
  try {
    const { startDate, destinationDurationArray } = req.body;

    // Formulate the question for the AI itinerary service
    let newQuestion = 'Please make an itinerary for:';
    for (let item of destinationDurationArray) {
      newQuestion += `${item.cityString} - ${item.duration} days\n`;
    }
    newQuestion += 'Starting ' + new Date(startDate)?.toDateString();

    const messages = [
      {
        role: 'system',
        content: `You are TravGPT, an AI bot for Flyzy, a travel technology company. You are responsible for creating itineraries given a city or array of cities, the start date (to consider general weather conditions), and the number of days in each location. Your output should be a JSON array of activities, including name, one-liner description, city name, type of activity (keyword), things to keep in mind (weather etc), and location coordinates. You should return a validated JSON string, no placeholders.If response is too long, reduced number of objects in array but provide valid json data. Schema:
        {
          "itinerary_description": "string", // 30 words
          "itinerary": [
            {
              "title": "string" // Date string
              "activities": [
                {
                  "name": "string",
                  "description": "string",
                  "city": "string",
                  "type": "string",
                  "iconify_icon": "string", // relevant icon based on activity type from iconify
                  "icon_color": "string", // relevant color for the icon
                  "time_of_visit":"string", // 9 AM, 
                  "directions": "string", // commute suggestions with duration of journey
                  "location": {
                    "latitude": "number",
                    "longitude": "number"
                  },
                  "keep_in_mind": "string"
                }
              ]
            }
          ]
        }`
      },
      { role: 'user', content: newQuestion },
    ];

    const resp = await sendChatAutocomplete(messages);
    if (resp.success) {
      const itineraryResult = resp.data;
      const itineraryDoc = new aiItineraryModel({ itineraryResult: resp.data, itinerary_description: itineraryResult?.itinerary_description, itinerary: itineraryResult?.itinerary, startDate, destinationDurationArray, created_utc_timestamp: new Date() })
      await itineraryDoc.save();
      return res.status(200).json(itineraryDoc);
    } else {
      return res.status(500).json(resp.data);
    }
  } catch (err) {
    log.error(err, "Error in AI Itinerary generation process");
    let error = new Error(`Itinerary generation failed. Details: ${err.message}`);
    error.statusCode = 400;
    next(error);
  }
};

module.exports = createAIItineraryController;
