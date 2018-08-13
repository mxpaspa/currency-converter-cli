const axios = require('axios')
const mongoose = require('mongoose');
const Log = require('../models/conversionHistoryModel')

module.exports = async (from,to,amount) => {

  const results = await axios({
    method: 'get',
    url: 'https://data.fixer.io/api/convert?access_key=[]&from='+from+'&to='+to+'&amount='+amount,
    params: {
      format: 'json',
    },
  })

  return results.data
}
