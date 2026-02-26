<<<<<<< HEAD
const supabase = require("../config/supabase");
=======
const { supabase } = require("../config/supabaseClient");
>>>>>>> 5e539e2 (try this)

const registerUser = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

module.exports = {
  registerUser,
  loginUser,
};
