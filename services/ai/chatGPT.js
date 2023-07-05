const { Configuration, OpenAIApi } = require("openai");

const OPENAI_API_KEY = process.env.CHATGPT_API_SECRET;


exports.sendChatAutocomplete = async (messages) => {

  const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  let res;
  try {
    res = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages
    });
    const answer = JSON.parse(res.data?.choices[0]?.message?.content);
    return { success: true, data: answer };
  } catch (error) {
    console.error("Error ", error);
    return { success: false, data: res.data }
  }
}