const supabase = require("../config/supabaseClient");

const handleChatMessage = async (userId, message) => {

  // fetch parks for context
  const { data: parks } = await supabase
    .from("parks")
    .select("name, access_type, confidence_score");

  // example
  const reply = `Based on our parks data, you said: "${message}". We have ${parks.length} parks available.`;

  // Optionally save conversation
  await supabase.from("chat_logs").insert([
    {
      user_id: userId,
      message,
      reply
    }
  ]);

  return reply;
};

module.exports = { handleChatMessage };
