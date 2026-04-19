const { getUserProfileByEmail, getUserProfileByUsername, checkUsernameAvailable, setupProfile, completeOnboarding, checkOnboarding, updateBioByUsername, updateMobileNumberByUsername } = require('../models/userProfile.model');

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

exports.setUserProfileByQuery = async (req, res) => {
};

exports.updateUserProfileByQuery = async (req, res) => {

};

exports.setupProfile = async (req, res) => {
  try {
    const { email, username, top_skill, photo_url } = req.body;

    if (!email || !username || !top_skill || !photo_url) {
      return res.status(400).json({
        success: false,
        message: "username, top_skill, and image are required"
      });
    }

    const result = await setupProfile(
      { username, top_skill, photo_url },
      email
    );

    return res.status(200).json({
      success: true,
      message: "Profile setup successful",
      data: result
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.completeOnboarding = async (req, res) => {
  try {
    const email = req.body?.email;
    console.log("complete", email)
    const updatedUser = await completeOnboarding(email);

    return res.json({
      success: true,
      data: updatedUser
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.isOnboardingNeeded = async (req, res) => {
  const email = req.body?.email;
  console.log(email);
  try {

    const showOnboarding = await checkOnboarding(email);
    console.log("show : ", showOnboarding)
    return res.json({ showOnboarding });

  } catch (err) {
    console.log("got error")
    return res.json({

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

exports.updateMobileNumber = async (req, res) => {
  try {
    const { username } = req.params;
    const { mobile_number } = req.body;

    if (!mobile_number) {
      return res.status(400).json({
        success: false,
        message: "Mobile Number is required",
      });
    }

    const cleaned = mobile_number.replace(/[\s-]/g, "");

    const bdPhoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

    if (!bdPhoneRegex.test(cleaned)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid mobile number format. Use +8801XXXXXXXXX or 01XXXXXXXXX",
      });
    }

    const updatedProfile = await updateMobileNumberByUsername(username , mobile_number);

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.updateBio = async (req, res) => {
  try {
    const { username } = req.params;
    const { bio } = req.body;

    if (!bio) {
      return res.status(400).json({
        success: false,
        message: "Bio is required",
      });
    }

    const updatedProfile = await updateBioByUsername(username, bio);

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};