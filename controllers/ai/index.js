const express = require("express");
const ai = express.Router();
const tokenAccessVerification = require("../../middleware/token-access-verification");
const createAIItinerary = require("./create-ai-itinerary.controller");
const getAIItinerary = require("./get-ai-itinerary.controller");

ai.post(
  "/itinerary",
  // (req, res, next) =>
  //   tokenAccessVerification.tokenAccessVerification(req, res, next),
  createAIItinerary
),

  ai.get(
    "/itinerary/:tid",
    // (req, res, next) =>
    //   tokenAccessVerification.tokenAccessVerification(req, res, next),
    getAIItinerary
  ),

  module.exports = ai;
