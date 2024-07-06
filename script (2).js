'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2020-07-28T23:36:17.929Z',
    '2020-08-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};
const noww = new Date();
const accounts = [account1, account2];

/////////////////////////////////////////////////

let currentAccount, timer;

const updateUI = function (currentAccount) {
  calcDisplayBalance(currentAccount);
  calcDisplaySummary(currentAccount);
  displayMovments(currentAccount);
  //startLogOutTimer()
};

//-----------------------CURRENCY--------------------
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

//---------------DATEs--------------------
const formatMovementDate = function (date, locale) {
  const calcdaysPassed = function (date1, date2) {
    return Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
  };

  const daysPassed = calcdaysPassed(new Date(), date);

  console.log(daysPassed);
  if (daysPassed === 0) return 'today';
  if (daysPassed === 1) return 'yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  return new Intl.DateTimeFormat(locale).format(date);
};
//-----------BTN SORT----------------

btnSort.addEventListener('click', function (e) {
  displayMovments(currentAccount, true);
});
//--------------CREAT USERNAME--------------------
const userNames = [];
const creatUserName = function (accounts) {
  accounts.map((acc) => {
    acc.userName = acc.owner
      .split(' ')
      .map((char) => char[0].toLowerCase())
      .join('');
    userNames.push(acc.userName);
  });
};
creatUserName(accounts);
//--------------------SHOW MOVMENTS-------------------

const displayMovments = function (account, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort
    ? account.movements.sort((a, b) => a - b)
    : account.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(account.movementsDates[i]);
    const dateformatted = formatMovementDate(date, account.locale);
    console.log(dateformatted);
    const html = `
      <div class="movements__row">
    <div class="movements__type movements__type--${type}">${type} ${i + 1}</div>
    <div class="movements__date">${dateformatted}</div>
    <div class="movements__value">${formatCur(
      mov.toFixed(2),
      account.locale,
      account.currency
    )}</div>
    </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
//-------------BALANCE-----------------------
const calcDisplayBalance = function (account) {
  account.balance = account.movements
    .reduce((mov, cur) => mov + cur)
    .toFixed(2);

  labelBalance.innerHTML = formatCur(
    account.balance,
    account.locale,
    account.currency
  );
};
//---------------SUMMERY------------------------
const calcDisplaySummary = function (acc) {
  const incomse = acc.movements
    .filter((mov) => mov > 0)
    .reduce((sum, cur) => sum + cur, 0)
    .toFixed(2);

  labelSumIn.innerHTML = formatCur(incomse, acc.locale, acc.currency);
  const outComes = acc.movements
    .filter((mov) => mov < 0)
    .reduce((sum, cur) => sum + cur, 0)
    .toFixed(2);
  labelSumOut.innerHTML = formatCur(outComes, acc.locale, acc.currency);
  const insert = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((rat) => {
      return rat > 1;
    })
    .reduce((mov, cur) => mov + cur, 0)
    .toFixed(2);
  labelSumInterest.innerHTML = formatCur(insert, acc.locale, acc.currency);
};
//-------TRANSFOR MONY--------------------
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const receiverAcc = accounts.find(
    (acc) => acc.userName === inputTransferTo.value
  );
  const amount = inputTransferAmount.value;

  if (
    amount > 0 &&
    receiverAcc &&
    amount < currentAccount.balance &&
    receiverAcc != currentAccount
  ) {
    receiverAcc.movements.push(amount);
    currentAccount.movements.push(-amount);

    currentAccount.movementsDates.push(new Date().toISOString());

    inputTransferTo.value = '';
    inputTransferAmount.value = '';
    updateUI(currentAccount);
  }
  //reset timer
  clearInterval(timer);
  timer = startLogOutTimer();
});
//-------LEON MONY----------------------
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  inputLoanAmount.value = '';

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    currentAccount.movementsDates.push(new Date().toISOString());
    currentAccount.movements.push(amount);
    updateUI(currentAccount);
    console.log(currentAccount);
  }
  //reset timer
  clearInterval(timer);
  timer = startLogOutTimer();
});

//--------CLOSE ACCOUNT-----------------
btnClose.addEventListener('click', function () {
  if (
    currentAccount.userName === inputCloseUsername.value &&
    +currentAccount.pin === +inputClosePin.value
  ) {
    const index = currentAccount.findIndex(
      (acc) => acc.owner === currentAccount.owner
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }
  inputClosePin.value = inputCloseUsername.value = '';
});

//------------------------------------------LOG IN----------------------------------------------
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    (acc) => acc.userName === inputLoginUsername.value
  );
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcom back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    //inputs
    containerApp.style.opacity = 100;
    inputLoginPin.value = inputLoginUsername.value = '';
    inputLoginPin.blur();

    //timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    //----------------CURRENT DATE AND TIME -----------------

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    //update ui
    updateUI(currentAccount);
  }
});
//----------------TIMER------------------

const startLogOutTimer = function () {
  //set time to 5 min
  let time = 120;

  //call the timer evry secound
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const secound = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${secound}`;

    //clear timer
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to started';
      containerApp.style.opacity = 0;
    }

    time--;
  };
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};
