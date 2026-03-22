const {createUser, getUsers} = require('../models/users.model');

exports.createUser = async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        message: 'first name, last name and email are required',
      });
    }

    const newUser = await createUser({
      first_name,
      last_name,
      email
    });

    res.status(201).json({
      message: 'User created successfully',
      data: newUser,
    });

  } catch (error) {

    if (error.code === '23505') {
      return res.status(400).json({
        message: 'email already exists',
      });
    }

    console.error(error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

exports.getUsers = async(req, res) => {
    try{
        const allUsers = await getUsers();
        res.status(201).json({
            message: "successful",
            data: allUsers
        });
    } catch(error){
        console.error(error);
        res.status(500).json({
        message: 'Internal server error',
        });
    }
}