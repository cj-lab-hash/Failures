const failureForm = document.getElementById('failureForm');
const customFieldsContainer = document.getElementById('customFields');
const addFieldBtn = document.getElementById('addFieldBtn');
const refreshBtn = document.getElementById('refreshBtn');
const tableHead = document.querySelector('#failureTable thead');
const tableBody = document.querySelector('#failureTable tbody');
const unlockDeleteBtn = document.getElementById('unlockDeleteBtn');
const deleteStatus = document.getElementById('deleteStatus');

let deleteUnlocked = false;
let deletePassword = '';

const fixedColumns = [
  'id',
  'line',
  'part_no',
  'bin_number',
  'failure_title',
  'symptom',
  'root_cause',
  'action_taken',
  'owner_name',
  'status',
  'created_at'
];

const columnLabels = {
  id: 'Id',
  line: 'Line',
  part_no: 'Part No',
  bin_number: 'Bin Number',
  failure_title: 'Failure Title',
  symptom: 'Symptom',
  root_cause: 'Root Cause',
  action_taken: 'Action Taken',
  owner_name: 'Owner',
  status: 'Status',
  created_at: 'Created At',
  actions: 'Actions'
};

function addCustomFieldRow(key = '', value = '') {
  const row = document.createElement('div');
  row.className = 'custom-row';

  row.innerHTML = `
    <input type="text" class="custom-key" placeholder="Field name" value="${key}" />
    <input type="text" class="custom-value" placeholder="Field value" value="${value}" />
    <button type="button" class="btn btn-danger remove-field">Remove</button>
  `;

  row.querySelector('.remove-field').addEventListener('click', () => {
    row.remove();
  });

  customFieldsContainer.appendChild(row);
}

function collectCustomFields() {
  const rows = customFieldsContainer.querySelectorAll('.custom-row');
  const extraFields = {};

  rows.forEach((row) => {
    const key = row.querySelector('.custom-key').value.trim();
    const value = row.querySelector('.custom-value').value.trim();

    if (key) {
      extraFields[key] = value;
    }
  });

  return extraFields;
}

async function saveFailure(event) {
  event.preventDefault();

  const formData = new FormData(failureForm);
  const payload = Object.fromEntries(formData.entries());
  payload.extra_fields = collectCustomFields();

  try {
    const response = await fetch('/api/failures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to save record');
    }

    failureForm.reset();
    customFieldsContainer.innerHTML = '';
    await loadFailures();
    alert('Record saved successfully.');
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

function buildColumns(records) {
  const extraColumns = new Set();

  records.forEach((record) => {
    const extras = record.extra_fields || {};
    Object.keys(extras).forEach((key) => extraColumns.add(key));
  });

  return [...fixedColumns, ...extraColumns, 'actions'];
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '-';
  return value;
}

function renderTable(records) {
  const columns = buildColumns(records);

  tableHead.innerHTML = `
  <tr>
    ${columns.map((col) => `<th>${columnLabels[col] || col}</th>`).join('')}
  </tr>
  `;

  if (!records.length) {
    tableBody.innerHTML = `
      <tr>
        <td class="empty" colspan="${columns.length}">No saved records yet.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = records.map((record) => {
    const extras = record.extra_fields || {};

    const cells = columns.map((col) => {
          if (col === 'actions') {
           return `
           <td>
            <button
                  class="btn btn-danger"
                 onclick="deleteFailure(${record.id})"
                  ${deleteUnlocked ? '' : 'disabled'}
                 >
                Delete
              </button>
             </td>
             `;
            }


      if (fixedColumns.includes(col)) {
        let value = record[col];

        if (col === 'created_at' && value) {
          value = new Date(value).toLocaleString();
        }

        return `<td>${formatValue(value)}</td>`;
      }

      return `<td>${formatValue(extras[col])}</td>`;
    });

    return `<tr>${cells.join('')}</tr>`;
  }).join('');
}

async function loadFailures() {
  try {
    const response = await fetch('/api/failures');
    const records = await response.json();
    renderTable(records);
  } catch (error) {
    console.error(error);
    tableBody.innerHTML = `
      <tr>
        <td class="empty" colspan="99">Failed to load data.</td>
      </tr>
    `;
  }
}

async function deleteFailure(id) {
  if (!deleteUnlocked) {
    alert('Delete is locked. Please unlock first.');
    return;
  }

  const confirmed = confirm('Delete this record?');
  if (!confirmed) return;

  try {
    const response = await fetch(`/api/failures/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: deletePassword
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete record');
    }

    await loadFailures();
    alert('Record deleted successfully.');
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

addFieldBtn.addEventListener('click', () => addCustomFieldRow());
refreshBtn.addEventListener('click', loadFailures);
failureForm.addEventListener('submit', saveFailure);

loadFailures();
//delete button protection//
unlockDeleteBtn.addEventListener('click', () => {
  const input = prompt('Enter delete password:');

  if (!input) return;

  deletePassword = input.trim();

  if (deletePassword) {
    deleteUnlocked = true;
    deleteStatus.textContent = 'Delete is unlocked';
    deleteStatus.style.color = 'green';
    loadFailures();
  }
});
