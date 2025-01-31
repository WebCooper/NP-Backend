const User = require('../models/User');

const Register = (req, res) => {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    user.save()
        .then(() => {
            res.status(201).json({ message: 'User registered successfully' });
        })
        .catch((error) => {
            res.status(500).json({ message: 'Error registering user', error });
        });
}

const Login = (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email })
       .then((user) => {
            if (!user || user.password!== password) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            res.json({ message: 'User logged in successfully' });
        })
       .catch((error) => {
            res.status(500).json({ message: 'Error logging in user', error });
        });
}

module.exports = { Register, Login };
