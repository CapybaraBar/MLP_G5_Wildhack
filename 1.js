const actionTypes = new Set()


var fs = require('fs');
var parse = require('csv-parser');


const moneyByUsers = new Map()
const buysByUsers = new Map()
const moneyByUsersAsArray = []

fs.createReadStream('WB_hack_3.csv')
  .pipe(parse({delimiter: ':'}))
  .on('data', function(line) {
    // const ecom_event_action = JSON.parse(line.ecom_event_action.replace(/'/gi, '"'))
    // console.log('ecom_event_action',ecom_event_action)
    const { user_id, ecom_qty, ecom_price100, ecom_currency } = line
    if(
        !JSON.parse(ecom_currency.replace(/'/gi, '"')).find(item => item !== 'RUB')
    ) {
      const total_money = JSON.parse(ecom_price100.replace(/'/gi, '"')).reduce(
        (acc, val, index) => acc+(
          val*JSON.parse(ecom_qty.replace(/'/gi, '"'))[index]
        ),
        0
      )

      if(!moneyByUsers.has(user_id)) {
        moneyByUsers.set(user_id, 0)
      }
      if(!buysByUsers.has(user_id)) {
        buysByUsers.set(user_id, 0)
      }

      moneyByUsers.set(user_id, moneyByUsers.get(user_id) + total_money)
      buysByUsers.set(user_id, buysByUsers.get(user_id) + 1)

      // console.log(total_price, { ecom_qty, ecom_price100, ecom_currency} )
    }
  })
  .on('end',function() {
    for(const [userId, money] of moneyByUsers) {
      moneyByUsersAsArray.push({
        userId,
        money
      })
    }

    moneyByUsersAsArray.sort(
      (a, b) => a.money > b.money ? -1 : a.money < b.money ? 1 : 0
    )

    console.log(JSON.stringify(moneyByUsersAsArray,null,2))

    console.log('moneyByUsersAsArray.length', moneyByUsersAsArray.length)

    const totalMoney = moneyByUsersAsArray.reduce(
      (acc, { money }) => acc+money,
      0
    )

    const regularCustomers = []

    let regularCustomerTotalMoney = 0
    for(const { userId, money } of moneyByUsersAsArray) {
      if(regularCustomerTotalMoney < totalMoney*0.7) {
        regularCustomerTotalMoney+=money
        regularCustomers.push(userId)
      }
    }

    console.log(
      'regular customers',
      regularCustomers
    )

    console.log('totalMoney', totalMoney)
  });
