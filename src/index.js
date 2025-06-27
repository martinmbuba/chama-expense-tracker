document.addEventListener('DOMContentLoaded', () => {
  const contributionForm = document.getElementById('contribution-form');
  const expenseForm = document.getElementById('expense-form');
  const memberList = document.getElementById('member-list');
  const expenseList = document.getElementById('expense-list');
  const totalContributionsEl = document.getElementById('total-contributions');
  const totalExpensesEl = document.getElementById('total-expenses');
  const balanceEl = document.getElementById('balance');

  const apiBase = 'http://localhost:3000';

  let members = [];
  let expenses = [];

  function fetchData() {
    fetch(`${apiBase}/members`)
      .then(res => res.json())
      .then(data => {
        members = data;
        renderMembers();
        updateSummary();
      });

    fetch(`${apiBase}/expenses`)
      .then(res => res.json())
      .then(data => {
        expenses = data;
        renderExpenses();
        updateSummary();
      });
  }

  fetchData();

  contributionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('member').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value.trim();

    if (!name || isNaN(amount) || !description) {
      return alert('Fill in all fields correctly');
    }

    const newMember = { name, amount, description };

    fetch(`${apiBase}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMember)
    })
      .then(res => res.json())
      .then(data => {
        members.push(data);
        renderMembers();
        updateSummary();
        contributionForm.reset();
      });
  });

  expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const description = document.getElementById('expense-desc').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);

    if (!description || isNaN(amount)) {
      return alert('Fill in all fields correctly');
    }

    const newExpense = { description, amount };

    fetch(`${apiBase}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExpense)
    })
      .then(res => res.json())
      .then(data => {
        expenses.push(data);
        renderExpenses();
        updateSummary();
        expenseForm.reset();
      });
  });

  function renderMembers() {
    memberList.innerHTML = '';
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

    // Add listeners after DOM is updated
    document.querySelectorAll('.delete-member').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteMember(id);
      });
    });
  }

  function renderExpenses() {
    expenseList.innerHTML = '';
    expenses.forEach(e => {
      const li = document.createElement('li');
      li.className = 'bg-white bg-opacity-20 p-3 rounded flex justify-between items-center';
      li.innerHTML = `
        <span>${e.description} - KES ${e.amount.toFixed(2)}</span>
        <button data-id="${e.id}" class="delete-expense text-red-400 hover:text-red-700">Delete</button>
      `;
      expenseList.appendChild(li);
    });

    // Add listeners after DOM is updated
    document.querySelectorAll('.delete-expense').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteExpense(id);
      });
    });
  }

  function updateSummary() {
    const totalContrib = members.reduce((sum, m) => sum + m.amount, 0);
    const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalContrib - totalExp;

    totalContributionsEl.textContent = 'KES ' + totalContrib.toFixed(2);
    totalExpensesEl.textContent = 'KES ' + totalExp.toFixed(2);
    balanceEl.textContent = 'KES ' + balance.toFixed(2);
  }

  function deleteMember(id) {
    fetch(`${apiBase}/members/${id}`, { method: 'DELETE' })
      .then(() => {
        members = members.filter(m => m.id != id);
        renderMembers();
        updateSummary();
      });
  }

  function deleteExpense(id) {
    fetch(`${apiBase}/expenses/${id}`, { method: 'DELETE' })
      .then(() => {
        expenses = expenses.filter(e => e.id != id);
        renderExpenses();
        updateSummary();
      });
  }
});
