const { getRelevantProfiles } = require('../services/profileService');

const getProfiles = async (req, res) => {
  const { designation, location, company } = req.query;
  const profiles = await getRelevantProfiles({ designation, location, company });
  res.json(profiles);
};

module.exports = { getProfiles };