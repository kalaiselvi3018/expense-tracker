// ===============================
// ELEMENTS
// ===============================

const form = document.getElementById("transactionForm");

const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");
const savingsElement = document.getElementById("savings");

const transactionList = document.getElementById("transactionList");

const searchInput = document.getElementById("search");
const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");

const editIdInput = document.getElementById("editId");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const budgetInput = document.getElementById("budgetInput");
const setBudgetBtn = document.getElementById("setBudgetBtn");

const budgetAmount = document.getElementById("budgetAmount");
const budgetSpent = document.getElementById("budgetSpent");
const budgetRemaining = document.getElementById("budgetRemaining");
const budgetProgress = document.getElementById("budgetProgress");
const budgetMessage = document.getElementById("budgetMessage");

const transactionCount = document.getElementById("transactionCount");
const averageExpense = document.getElementById("averageExpense");
const topCategory = document.getElementById("topCategory");
const highestExpense = document.getElementById("highestExpense");

const darkModeBtn = document.getElementById("darkModeBtn");
const exportBtn = document.getElementById("exportBtn");
const clearBtn = document.getElementById("clearBtn");


// ===============================
// LOCAL STORAGE
// ===============================

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

let monthlyBudget =
    Number(localStorage.getItem("monthlyBudget")) || 0;


// ===============================
// TODAY'S DATE
// ===============================

dateInput.valueAsDate = new Date();


// ===============================
// SAVE TRANSACTIONS
// ===============================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}


// ===============================
// ADD / EDIT TRANSACTION
// ===============================

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const description = descriptionInput.value.trim();

    const amount = Number(amountInput.value);

    if (!description || amount <= 0) {
        alert("Please enter valid transaction details.");
        return;
    }


    // EDIT TRANSACTION

    if (editIdInput.value) {

        const id = Number(editIdInput.value);

        transactions = transactions.map(transaction => {

            if (transaction.id === id) {

                return {
                    ...transaction,

                    type: typeInput.value,

                    description: description,

                    amount: amount,

                    category: categoryInput.value,

                    date: dateInput.value
                };
            }

            return transaction;
        });

        alert("Transaction updated successfully!");

    }

    // ADD TRANSACTION

    else {

        const transaction = {

            id: Date.now(),

            type: typeInput.value,

            description: description,

            amount: amount,

            category: categoryInput.value,

            date: dateInput.value
        };

        transactions.push(transaction);

        alert("Transaction added successfully!");
    }


    saveTransactions();

    resetForm();

    updateAll();

});


// ===============================
// RESET FORM
// ===============================

function resetForm() {

    form.reset();

    editIdInput.value = "";

    formTitle.textContent = "➕ Add Transaction";

    submitBtn.textContent = "➕ Add Transaction";

    cancelEditBtn.classList.add("hidden");

    dateInput.valueAsDate = new Date();
}


// ===============================
// DISPLAY TRANSACTIONS
// ===============================

function displayTransactions() {

    transactionList.innerHTML = "";


    const searchText =
        searchInput.value.toLowerCase().trim();

    const typeFilter =
        filterType.value;

    const categoryFilter =
        filterCategory.value;


    const filteredTransactions = transactions.filter(
        transaction => {

            const matchesSearch =
                transaction.description
                    .toLowerCase()
                    .includes(searchText);


            const matchesType =
                typeFilter === "all" ||
                transaction.type === typeFilter;


            const matchesCategory =
                categoryFilter === "all" ||
                transaction.category === categoryFilter;


            return (
                matchesSearch &&
                matchesType &&
                matchesCategory
            );
        }
    );


    if (filteredTransactions.length === 0) {

        transactionList.innerHTML =
            `<p class="empty">No transactions found.</p>`;

        return;
    }


    filteredTransactions
        .slice()
        .reverse()
        .forEach(transaction => {

            const div =
                document.createElement("div");

            div.className = "transaction";


            const sign =
                transaction.type === "income"
                    ? "+"
                    : "-";


            const textClass =
                transaction.type === "income"
                    ? "income-text"
                    : "expense-text";


            div.innerHTML = `

                <div class="transaction-info">

                    <strong>
                        ${escapeHTML(transaction.description)}
                    </strong>

                    <small>
                        ${transaction.category}
                        |
                        ${transaction.date}
                    </small>

                </div>


                <div class="transaction-right">

                    <span class="${textClass}">
                        ${sign} ₹${transaction.amount.toFixed(2)}
                    </span>


                    <button
                        class="edit-btn"
                        onclick="editTransaction(${transaction.id})">

                        ✏️ Edit

                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteTransaction(${transaction.id})">

                        🗑️ Delete

                    </button>

                </div>
            `;


            transactionList.appendChild(div);

        });
}


// ===============================
// EDIT TRANSACTION
// ===============================

function editTransaction(id) {

    const transaction =
        transactions.find(
            transaction => transaction.id === id
        );


    if (!transaction) {
        return;
    }


    typeInput.value =
        transaction.type;

    descriptionInput.value =
        transaction.description;

    amountInput.value =
        transaction.amount;

    categoryInput.value =
        transaction.category;

    dateInput.value =
        transaction.date;

    editIdInput.value =
        transaction.id;


    formTitle.textContent =
        "✏️ Edit Transaction";

    submitBtn.textContent =
        "💾 Update Transaction";

    cancelEditBtn.classList.remove("hidden");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ===============================
// CANCEL EDIT
// ===============================

cancelEditBtn.addEventListener(
    "click",
    function () {

        resetForm();

    }
);


// ===============================
// DELETE TRANSACTION
// ===============================

function deleteTransaction(id) {

    const transaction =
        transactions.find(
            transaction => transaction.id === id
        );


    if (!transaction) {
        return;
    }


    const confirmDelete =
        confirm(
            `Delete "${transaction.description}"?`
        );


    if (!confirmDelete) {
        return;
    }


    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    saveTransactions();

    updateAll();
}


// ===============================
// UPDATE DASHBOARD
// ===============================

function updateDashboard() {

    let totalIncome = 0;

    let totalExpense = 0;


    transactions.forEach(transaction => {

        if (transaction.type === "income") {

            totalIncome += transaction.amount;

        } else {

            totalExpense += transaction.amount;

        }

    });


    const balance =
        totalIncome - totalExpense;


    const savings =
        totalIncome - totalExpense;


    incomeElement.textContent =
        `₹${totalIncome.toFixed(2)}`;

    expenseElement.textContent =
        `₹${totalExpense.toFixed(2)}`;

    balanceElement.textContent =
        `₹${balance.toFixed(2)}`;

    savingsElement.textContent =
        `₹${savings.toFixed(2)}`;
}


// ===============================
// MONTHLY BUDGET
// ===============================

setBudgetBtn.addEventListener(
    "click",
    function () {

        const budget =
            Number(budgetInput.value);


        if (budget <= 0) {

            alert(
                "Please enter a valid monthly budget."
            );

            return;
        }


        monthlyBudget = budget;


        localStorage.setItem(
            "monthlyBudget",
            monthlyBudget
        );


        budgetInput.value = "";

        updateBudget();

    }
);


// ===============================
// UPDATE BUDGET
// ===============================

function updateBudget() {

    const totalExpense =
        transactions
            .filter(
                transaction =>
                    transaction.type === "expense"
            )
            .reduce(
                (total, transaction) =>
                    total + transaction.amount,
                0
            );


    const remaining =
        monthlyBudget - totalExpense;


    budgetAmount.textContent =
        `₹${monthlyBudget.toFixed(2)}`;

    budgetSpent.textContent =
        `₹${totalExpense.toFixed(2)}`;

    budgetRemaining.textContent =
        `₹${remaining.toFixed(2)}`;


    if (monthlyBudget > 0) {

        let percentage =
            (totalExpense / monthlyBudget) * 100;


        percentage =
            Math.min(percentage, 100);


        budgetProgress.style.width =
            `${percentage}%`;


        if (totalExpense > monthlyBudget) {

            budgetMessage.textContent =
                "⚠️ You have exceeded your budget!";

        }

        else if (percentage >= 80) {

            budgetMessage.textContent =
                "⚠️ You have used more than 80% of your budget.";

        }

        else {

            budgetMessage.textContent =
                "✅ You are within your budget.";

        }

    }

    else {

        budgetProgress.style.width = "0%";

        budgetMessage.textContent =
            "Set a monthly budget to track your spending.";

    }
}


// ===============================
// SEARCH
// ===============================

searchInput.addEventListener(
    "input",
    displayTransactions
);


// ===============================
// FILTER TYPE
// ===============================

filterType.addEventListener(
    "change",
    displayTransactions
);


// ===============================
// FILTER CATEGORY
// ===============================

filterCategory.addEventListener(
    "change",
    displayTransactions
);


// ===============================
// FINANCIAL ANALYTICS
// ===============================

function updateAnalytics() {

    const total =
        transactions.length;


    const expenses =
        transactions.filter(
            transaction =>
                transaction.type === "expense"
        );


    const expenseTotal =
        expenses.reduce(
            (sum, transaction) =>
                sum + transaction.amount,
            0
        );


    transactionCount.textContent =
        total;


    if (expenses.length > 0) {

        const average =
            expenseTotal / expenses.length;


        averageExpense.textContent =
            `₹${average.toFixed(2)}`;

    }

    else {

        averageExpense.textContent =
            "₹0.00";

    }


    // TOP CATEGORY

    const categoryTotals = {};


    expenses.forEach(transaction => {

        if (!categoryTotals[transaction.category]) {

            categoryTotals[transaction.category] = 0;

        }


        categoryTotals[transaction.category] +=
            transaction.amount;

    });


    let highestCategory = "-";

    let highestCategoryAmount = 0;


    for (const category in categoryTotals) {

        if (
            categoryTotals[category] >
            highestCategoryAmount
        ) {

            highestCategoryAmount =
                categoryTotals[category];

            highestCategory =
                category;

        }

    }


    topCategory.textContent =
        highestCategory;


    // HIGHEST EXPENSE

    if (expenses.length > 0) {

        const highest =
            Math.max(
                ...expenses.map(
                    transaction =>
                        transaction.amount
                )
            );


        highestExpense.textContent =
            `₹${highest.toFixed(2)}`;

    }

    else {

        highestExpense.textContent =
            "₹0.00";

    }
}


// ===============================
// EXPORT CSV
// ===============================

exportBtn.addEventListener(
    "click",
    function () {

        if (transactions.length === 0) {

            alert(
                "There are no transactions to export."
            );

            return;
        }


        let csv =
            "Type,Description,Amount,Category,Date\n";


        transactions.forEach(transaction => {

            csv +=
                `"${transaction.type}",` +
                `"${transaction.description}",` +
                `"${transaction.amount}",` +
                `"${transaction.category}",` +
                `"${transaction.date}"\n`;

        });


        const blob =
            new Blob(
                [csv],
                {
                    type: "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            "expense-tracker-data.csv";


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    }
);


// ===============================
// CLEAR ALL DATA
// ===============================

clearBtn.addEventListener(
    "click",
    function () {

        if (transactions.length === 0) {

            alert("There is no data to clear.");

            return;
        }


        const confirmation =
            confirm(
                "Are you sure you want to delete ALL transactions?"
            );


        if (!confirmation) {
            return;
        }


        transactions = [];

        saveTransactions();

        updateAll();

        alert("All transaction data has been cleared.");

    }
);


// ===============================
// DARK MODE
// ===============================

darkModeBtn.addEventListener(
    "click",
    function () {

        document.body.classList.toggle("dark");


        const darkMode =
            document.body.classList.contains("dark");


        localStorage.setItem(
            "darkMode",
            darkMode
        );


        if (darkMode) {

            darkModeBtn.textContent =
                "☀️ Light Mode";

        }

        else {

            darkModeBtn.textContent =
                "🌙 Dark Mode";

        }

    }
);


// ===============================
// LOAD DARK MODE
// ===============================

function loadDarkMode() {

    const darkMode =
        localStorage.getItem("darkMode") === "true";


    if (darkMode) {

        document.body.classList.add("dark");

        darkModeBtn.textContent =
            "☀️ Light Mode";

    }

}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


// ===============================
// UPDATE EVERYTHING
// ===============================

function updateAll() {

    displayTransactions();

    updateDashboard();

    updateBudget();

    updateAnalytics();

}


// ===============================
// INITIAL LOAD
// ===============================

if (monthlyBudget > 0) {

    budgetInput.placeholder =
        `Current budget: ₹${monthlyBudget}`;

}

loadDarkMode();

updateAll();
