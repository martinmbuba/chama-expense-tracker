// Wait for the DOM to finish loading
document.addEventListener('DOMContentLoaded', () => {
// Search Functionality
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');

searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim().toLowerCase();
  
  if (!query) {
    renderMembers(); // Show all if search is empty
    return;
  }

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(query)
  );

  // Display only matching members
  renderFilteredMembers(filteredMembers);
});

// Helper to render only filtered results
function renderFilteredMembers(filtered) {
  memberList.innerHTML = '';
  filtered.forEach(m => {
    const li = document.createElement('li');
    li.className = 'bg-white bg-opacity-20 p-3 rounded flex justify-between items-center';
    li.innerHTML = `
      <div>
        <p class="font-bold">${m.name} - KES ${m.amount.toFixed(2)}</p>
        <p class="text-sm text-gray-200 italic">${m.description}</p>
      </div>
      <button data-id="${m.id}" class="delete-member text-red-400 hover:text-red-700">Remove</button>
    `;
    memberList.appendChild(li);
  });

  // Re-add delete functionality for filtered view
  document.querySelectorAll('.delete-member').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      deleteMember(id);
    });
  });
}

  // Get references to important elements in the DOM
  const contributionForm = document.getElementById('contribution-form');
  const expenseForm = document.getElementById('expense-form');
  const memberList = document.getElementById('member-list');
  const expenseList = document.getElementById('expense-list');
  const totalContributionsEl = document.getElementById('total-contributions');
  const totalExpensesEl = document.getElementById('total-expenses');
  const balanceEl = document.getElementById('balance');

  // Base URL for the JSON server
  const apiBase = 'https://json-server-rff0.onrender.com';

  // Store members and expenses data
  let members = [];
  let expenses = [];

  // Load existing members and expenses from server
  function fetchData() {
    // Get members
    fetch(`${apiBase}/members`)
      .then(res => res.json())
      .then(data => {
        members = data;
        renderMembers();      // Show members in the DOM
        updateSummary();      // Update totals and balance
      });

    // Get expenses
    fetch(`${apiBase}/expenses`)
      .then(res => res.json())
      .then(data => {
        expenses = data;
        renderExpenses();     // Show expenses in the DOM
        updateSummary();      // Update totals and balance
      });
  }

  fetchData(); // Call the function when the page loads

  // Handle new contribution form submit
  contributionForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Stop the page from refreshing

    // Get input values
    const name = document.getElementById('member').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value.trim();

    // Check if all fields are valid
    if (!name || isNaN(amount) || !description) {
      return alert('Fill in all fields correctly');
    }

    // Create member object
    const newMember = { name, amount, description };

    // Send to server
    fetch(`${apiBase}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMember)
    })
      .then(res => res.json())
      .then(data => {
        members.push(data);      // Add new member to list
        renderMembers();         // Re-render member list
        updateSummary();         // Recalculate total and balance
        contributionForm.reset(); // Clear form
      });
  });

  // Handle new expense form submit
  expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get input values
    const description = document.getElementById('expense-desc').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);

    // Validate input
    if (!description || isNaN(amount)) {
      return alert('Fill in all fields correctly');
    }

    const newExpense = { description, amount };

    // Send to server
    fetch(`${apiBase}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExpense)
    })
      .then(res => res.json())
      .then(data => {
        expenses.push(data);      // Add new expense to list
        renderExpenses();         // Re-render expense list
        updateSummary();          // Recalculate totals and balance
        expenseForm.reset();      // Clear form
      });
  });

  // Display the list of members
  function renderMembers() {
    memberList.innerHTML = ''; // Clear list first

    members.forEach(m => {
      const li = document.createElement('li');
      li.className = 'bg-white bg-opacity-20 p-3 rounded flex justify-between items-center';

      li.innerHTML = `
        <div>
          <p class="font-bold">${m.name} - KES ${m.amount.toFixed(2)}</p>
          <p class="text-sm text-gray-200 italic">${m.description}</p>
        </div>
        <button data-id="${m.id}" class="delete-member text-red-400 hover:text-red-700">Remove</button>
      `;

      memberList.appendChild(li);
    });

    // Attach event listener to each remove button
    document.querySelectorAll('.delete-member').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteMember(id);
      });
    });
  }

  // Display the list of expenses
  function renderExpenses() {
    expenseList.innerHTML = ''; // Clear list first

    expenses.forEach(e => {
      const li = document.createElement('li');
      li.className = 'bg-white bg-opacity-20 p-3 rounded flex justify-between items-center';

      li.innerHTML = `
        <span>${e.description} - KES ${e.amount.toFixed(2)}</span>
        <button data-id="${e.id}" class="delete-expense text-red-400 hover:text-red-700">Delete</button>
      `;

      expenseList.appendChild(li);
    });

    // Attach event listener to each delete button
    document.querySelectorAll('.delete-expense').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteExpense(id);
      });
    });
  }

  // Recalculate totals and update the summary
  function updateSummary() {
    const totalContrib = members.reduce((sum, m) => sum + m.amount, 0);
    const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalContrib - totalExp;

    totalContributionsEl.textContent = 'KES ' + totalContrib.toFixed(2);
    totalExpensesEl.textContent = 'KES ' + totalExp.toFixed(2);
    balanceEl.textContent = 'KES ' + balance.toFixed(2);
  }

  // Remove a member from the server and update UI
  function deleteMember(id) {
    fetch(`${apiBase}/members/${id}`, { method: 'DELETE' })
      .then(() => {
        members = members.filter(m => m.id != id);
        renderMembers();
        updateSummary();
      });
  }

  // Remove an expense from the server and update UI
  function deleteExpense(id) {
    fetch(`${apiBase}/expenses/${id}`, { method: 'DELETE' })
      .then(() => {
        expenses = expenses.filter(e => e.id != id);
        renderExpenses();
        updateSummary();
      });
  }

});
