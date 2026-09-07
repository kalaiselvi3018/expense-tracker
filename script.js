const form = document.getElementById("transactionForm");

const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");

const transactionList = document.getElementById("transactionList");
const searchInput = document.getElementById("search");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

/* Set today's date */

dateInput.valueAsDate = new Date();

/* Add Transaction */

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const transaction = {
    id: Date.now(),

    type: typeInput.value,

    description: descriptionInput.value,

    amount: Number(amountInput.value),

    category: categoryInput.value,

    date: dateInput.value,
  };

  transactions.push(transaction);

  saveTransactions();

  form.reset();

  dateInput.valueAsDate = new Date();

  displayTransactions();

  updateDashboard();
});

/* Save data */

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

/* Display transactions */

function displayTransactions(search = "") {
  transactionList.innerHTML = "";

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(search.toLowerCase()),
  );

  if (filteredTransactions.length === 0) {
    transactionList.innerHTML = `<p class="empty">No transactions found.</p>`;

    return;
  }

  filteredTransactions
    .slice()
    .reverse()
    .forEach((transaction) => {
      const div = document.createElement("div");

      div.className = "transaction";

      const sign = transaction.type === "income" ? "+" : "-";

      const textClass =
        transaction.type === "income" ? "income-text" : "expense-text";

      div.innerHTML = `

                <div class="transaction-info">

                    <strong>
                        ${transaction.description}
                    </strong>

                    <small>
                        ${transaction.category} |
                        ${transaction.date}
                    </small>

                </div>

                <div class="transaction-right">

                    <span class="${textClass}">
                        ${sign} ₹${transaction.amount.toFixed(2)}
                    </span>

                    <button
                        class="delete-btn"
                        onclick="deleteTransaction(${transaction.id})">
                        Delete
                    </button>

                </div>
            `;

      transactionList.appendChild(div);
    });
}

/* Delete transaction */

function deleteTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);

  saveTransactions();

  displayTransactions();

  updateDashboard();
}

/* Update dashboard */

function updateDashboard() {
  let totalIncome = 0;

  let totalExpense = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === "income") {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
  });

  const balance = totalIncome - totalExpense;

  incomeElement.textContent = `₹${totalIncome.toFixed(2)}`;

  expenseElement.textContent = `₹${totalExpense.toFixed(2)}`;

  balanceElement.textContent = `₹${balance.toFixed(2)}`;
}

/* Search */

searchInput.addEventListener("input", function () {
  displayTransactions(searchInput.value);
});

/* Initial display */

displayTransactions();

updateDashboard();
