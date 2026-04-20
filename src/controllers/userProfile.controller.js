const { getUserProfileByEmail, getUserProfileByUsername, checkUsernameAvailable, setupProfile, completeOnboarding, checkOnboarding, updateBioByUsername, updateMobileNumberByUsername, getUserIdByUsername, updateSocialLinks, getSocialLinks, getAdditionalInfo, updateAdditionalInfo } = require('../models/userProfile.model');
const { getUserIdFromRequest } = require('./utils.controller');

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

// -------

exports.updateSocialLinks = async (req, res) => {
  try {
    const { username } = req.params;
    const { github, x_handle, instagram, facebook, linkedin, website } = req.body;

    const userId = await getUserIdFromRequest(username, res);
    if (!userId) return;

    const updated = await updateSocialLinks(userId, {
      github, x_handle, instagram, facebook, linkedin, website
    });

    res.status(200).json({
      success: true,
      message: 'Social links updated successfully',
      data: updated
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSocialLinks = async (req, res) => {
  try {
    const { username } = req.params;
    const userId = await getUserIdFromRequest(username, res);
    if (!userId) return;

    const socialLinks = await getSocialLinks(userId);
    res.status(200).json({ success: true, data: socialLinks || {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// 

// ==================== ADDRESSES ====================
// exports.addAddress = async (req, res) => {
//   try {
//     const { username } = req.params;
//     const { address_line, city, state, postal_code, country } = req.body;

//     if (!address_line || !city || !country) {
//       return res.status(400).json({
//         success: false,
//         message: 'address_line, city, and country are required'
//       });
//     }

//     const userId = await getUserIdFromRequest(username, res);
//     if (!userId) return;

//     const newAddress = await addAddress(userId, {
//       address_line, city, state, postal_code, country
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Address added successfully',
//       data: newAddress
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.updateAddress = async (req, res) => {
//   try {
//     const { username, addressId } = req.params;
//     const { address_line, city, state, postal_code, country } = req.body;

//     const userId = await getUserIdFromRequest(username, res);
//     if (!userId) return;

//     const updated = await updateAddress(parseInt(addressId), userId, {
//       address_line, city, state, postal_code, country
//     });

//     if (!updated) {
//       return res.status(404).json({ success: false, message: 'Address not found' });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Address updated successfully',
//       data: updated
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.deleteAddress = async (req, res) => {
//   try {
//     const { username, addressId } = req.params;
//     const userId = await getUserIdFromRequest(username, res);
//     if (!userId) return;

//     const deleted = await deleteAddress(parseInt(addressId), userId);

//     if (!deleted) {
//       return res.status(404).json({ success: false, message: 'Address not found' });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Address deleted successfully'
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.getAddresses = async (req, res) => {
//   try {
//     const { username } = req.params;
//     const userId = await getUserIdFromRequest(username, res);
//     if (!userId) return;

//     const addresses = await getAddresses(userId);
//     res.status(200).json({ success: true, data: addresses });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // ==================== ADDITIONAL INFO ====================
exports.updateAdditionalInfo = async (req, res) => {
  try {
    const { username } = req.params;
    const { additional_name, age, gender, country, company_name } = req.body;

    const userId = await getUserIdFromRequest(username, res);
    if (!userId) return;

    const updated = await updateAdditionalInfo(userId, {
      additional_name, age, gender, country, company_name
    });

    res.status(200).json({
      success: true,
      message: 'Additional info updated successfully',
      data: updated
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAdditionalInfo = async (req, res) => {
  try {
    const { username } = req.params;
    const userId = await getUserIdFromRequest(username, res);
    if (!userId) return;

    const info = await getAdditionalInfo(userId);
    res.status(200).json({ success: true, data: info || {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// // ==================== SKILLS ====================
// exports.addSkill = async (req, res) => {
//   try {
//     const { username } = req.params;
//     const { skill } = req.body;

//     if (!skill) {
//       return res.status(400).json({ success: false, message: 'Skill name is required' });
//     }

//     const userId = await getUserIdFromRequest(username, res);
//     if (!userId) return;

//     const newSkill = await addSkill(userId, skill);

//     if (!newSkill) {
//       return res.status(409).json({ success: false, message: 'Skill already exists' });
//     }

//     res.status(201).json({
//       success: true,
//       message: 'Skill added successfully',
//       data: newSkill
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.addMultipleSkills = async (req, res) => {
//   try {
//     const { username } = req.params;
//     const { skills } = req.body;

//     if (!skills || !Array.isArray(skills) || skills.length === 0) {
//       return res.status(400).json({ success: false, message: 'Skills array is required' });
//     }

//     const userId = await getUserIdFromRequest(username, res);
//     if (!userId) return;

//     const added = await addMultipleSkills(userId, skills);

//     res.status(201).json({
//       success: true,
//       message: `${added.length} skills added successfully`,
//       data: added
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.deleteSkill = async (req, res) => {
//   try {
//     const { username, skillName } = req.params;

//     const userId = await getUserIdFromRequest(username, res);
//     if (!userId) return;

//     const deleted = await deleteSkill(userId, decodeURIComponent(skillName));

//     if (!deleted) {
//       return res.status(404).json({ success: false, message: 'Skill not found' });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Skill deleted successfully'
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.getSkills = async (req, res) => {
//   try {
//     const { username } = req.params;
//     const userId = await getUserIdFromRequest(username, res);
//     if (!userId) return;

//     const skills = await getSkills(userId);
//     res.status(200).json({ success: true, data: skills });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.replaceSkills = async (req, res) => {
//   try {
//     const { username } = req.params;
//     const { skills } = req.body;

//     if (!skills || !Array.isArray(skills)) {
//       return res.status(400).json({ success: false, message: 'Skills array is required' });
//     }

//     const userId = await getUserIdFromRequest(username, res);
//     if (!userId) return;

//     const updatedSkills = await replaceSkills(userId, skills);

//     res.status(200).json({
//       success: true,
//       message: 'Skills replaced successfully',
//       data: updatedSkills
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // ==================== WORKS ====================
// exports.addWork = async (req, res) => {
//   try {
//     const { username } = req.params;
//     const { title, company, description, start_date, end_date, is_current, work_url } = req.body;

//     if (!title) {
//       return res.status(400).json({ success: false, message: 'Title is required' });
//     }

//     const userId = await getUserIdFromRequest(username, res);
//     if (!userId) return;

//     const newWork = await addWork(userId, {
//       title, company, description, start_date, end_date, is_current, work_url
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Work added successfully',
//       data: newWork
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.updateWork = async (req, res) => {
//   try {
//     const { username, workId } = req.params;
//     const { title, company, description, start_date, end_date, is_current, work_url } = req.body;

//     const userId = await getUserIdFromRequest(username, res);
//     if (!userId) return;

//     const updated = await updateWork(parseInt(workId), userId, {
//       title, company, description, start_date, end_date, is_current, work_url
//     });

//     if (!updated) {
//       return res.status(404).json({ success: false, message: 'Work not found' });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Work updated successfully',
//       data: updated
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.deleteWork = async (req, res) => {
//   try {
//     const { username, workId } = req.params;
//     const userId = await getUserIdFromRequest(username, res);
//     if (!userId) return;

//     const deleted = await deleteWork(parseInt(workId), userId);

//     if (!deleted) {
//       return res.status(404).json({ success: false, message: 'Work not found' });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Work deleted successfully'
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.getWorks = async (req, res) => {
//   try {
//     const { username } = req.params;
//     const userId = await getUserIdFromRequest(username, res);
//     if (!userId) return;

//     const works = await getWorks(userId);
//     res.status(200).json({ success: true, data: works });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

