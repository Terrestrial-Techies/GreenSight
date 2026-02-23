const supabase = require("../config/supabase");

const getAllParks = async (req, res) => {
  const { data, error } = await supabase
    .from("parks")
    .select("*");

  if (error) return res.status(400).json(error);

  res.json(data);
};

module.exports = { getAllParks };
