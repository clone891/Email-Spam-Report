const validateEmail = (req, res, next) => {
    const { userEmail } = req.body;
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
  
    if (!userEmail || !emailRegex.test(userEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
  
    next();
  };
  
  const validateTestCode = (req, res, next) => {
    const { testCode } = req.params;
  
    if (!testCode || testCode.length < 5) {
      return res.status(400).json({ message: 'Invalid test code' });
    }
  
    next();
  };
  
  module.exports = {
    validateEmail,
    validateTestCode,
  };