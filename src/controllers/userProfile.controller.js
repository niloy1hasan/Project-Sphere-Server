const { getUserProfileByEmail, getUserProfileByUsername, checkUsernameAvailable } = require('../models/userProfile.model');

exports.getUserProfileByQuery = async (req, res) => {
  try {
    const { email, username } = req.query;

    let profile;

    if (email) {
      profile = await getUserProfileByEmail(email);
    } else if (username) {
      profile = await getUserProfileByUsername(username);
    } else {
      return res.status(400).json({
        message: 'Email or username required'
      });
    }

    if (!profile) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json(profile);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

exports.checkUsernameAvailable = async (req, res) => {
  const { username } = req.query;

  try {
    if (!username) {
      return res.status(400).json({
        message: 'Username is required'
      });
    }

    const isAvailable = await checkUsernameAvailable(username);

    res.json({
      isAvailable
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};