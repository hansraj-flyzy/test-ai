const log = require("lambda-log");
const aiItineraryModel = require("../../models/itinerary-ai")

log.options.debug = process.env.EnableLogs === "true" ? true : false;

const createAIItineraryController = async (req, res, next) => {
  try {
    const { tid } = req.params;
    const itineraryDoc = await aiItineraryModel.findById(tid);
    return res.status(200).json(itineraryDoc);
  } catch (err) {
    log.error(err, "Error in AI Itinerary fetch process");
    let error = new Error(`Itinerary fetch failed. Details: ${err.message}`);
    error.statusCode = 400;
    next(error);
  }
};

module.exports = createAIItineraryController;
